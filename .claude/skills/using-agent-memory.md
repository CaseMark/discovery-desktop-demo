# Using Agent Memory Skill

## Purpose

This skill covers the case.dev Memory API, which provides persistent, searchable storage for facts extracted from conversations. It enables AI agents to remember user preferences, client details, and context across sessions.

## Key Concepts

- **What Memory does**: Extracts discrete facts from conversations, stores them semantically, enables retrieval by meaning
- **When to use**: User preferences, client details, matter context, session notes
- **Semantic Storage**: Facts are stored with embeddings for meaning-based retrieval, not just keyword matching
- **Automatic Extraction**: The API intelligently extracts facts from conversation messages

## Scoping Patterns

Memory can be scoped to different levels using metadata:

| Scope | Field | Use Case |
|-------|-------|----------|
| Client | `metadata.client_id` | Client preferences, contact info |
| Matter | `metadata.matter_id` | Case facts, deadlines, documents |
| Session | `run_id` | Temporary context within a session |
| Agent | `agent_id` | Multi-agent system separation |

## Setup

### Initialize Client

```typescript
import Casedev from 'casedev';

const client = new Casedev({ 
  apiKey: process.env.CASEDEV_API_KEY 
});
```

## API Operations

### Add Memories

Add memories by passing conversation messages. The API automatically extracts and stores relevant facts.

```typescript
await client.memory.add({
  messages: [
    { role: 'user', content: 'My preferred contact time is mornings before 10am.' },
    { role: 'assistant', content: 'I\'ve noted that you prefer morning calls before 10am.' }
  ],
  metadata: { 
    client_id: 'client_123', 
    matter_id: 'matter_456',
    category: 'preferences'
  }
});
```

### Search Memories

Search memories semantically by meaning, not just keywords.

```typescript
const memories = await client.memory.search({
  query: 'investment preferences',
  filters: { client_id: 'client_123' },
  top_k: 5
});

// Access results
memories.results.forEach(m => {
  console.log(m.memory);    // The extracted fact
  console.log(m.metadata);  // Associated metadata
  console.log(m.score);     // Relevance score
});
```

### List All Memories

Retrieve memories with pagination.

```typescript
const allMemories = await client.memory.list({ 
  page: 1, 
  page_size: 50 
});
```

### Delete Memories

Delete memories by filter criteria.

```typescript
// Delete all archived memories for a client
await client.memory.delete({ 
  filters: { 
    client_id: 'client_123', 
    archived: true 
  } 
});

// Delete all memories for a closed matter
await client.memory.delete({ 
  filters: { 
    matter_id: 'matter_456' 
  } 
});
```

## Filter Operators

Use operators for complex filtering:

| Operator | Description | Example |
|----------|-------------|---------|
| `eq` | Equals (default) | `{ priority: 9 }` |
| `ne` | Not equals | `{ status: { ne: 'archived' } }` |
| `gt` | Greater than | `{ priority: { gt: 5 } }` |
| `gte` | Greater than or equal | `{ priority: { gte: 5 } }` |
| `lt` | Less than | `{ priority: { lt: 5 } }` |
| `lte` | Less than or equal | `{ priority: { lte: 5 } }` |
| `in` | In list | `{ category: { in: ['deadlines', 'preferences'] } }` |

### Combining Filters

```typescript
// AND - all conditions must match
const memories = await client.memory.search({
  query: 'deadline',
  filters: {
    AND: [
      { client_id: 'client_123' },
      { priority: { gte: 8 } }
    ]
  }
});

// OR - any condition matches
const memories = await client.memory.search({
  query: 'contact',
  filters: {
    OR: [
      { category: 'preferences' },
      { category: 'client_info' }
    ]
  }
});
```

## Best Practices

### 1. Controlling Ingestion

Use custom instructions to filter what gets stored:

```typescript
// Only store confirmed facts, not speculation
await client.memory.add({
  messages: conversationMessages,
  metadata: { client_id },
  // Custom instructions to guide extraction
  instructions: `
    Only extract facts that are explicitly confirmed.
    Ignore statements like "I think" or "maybe".
    Example: Store "Dr. Smith confirmed the diagnosis" 
    but not "I might have symptoms of..."
  `
});
```

**What to store:**
- ✅ Confirmed facts: "Client confirmed the contract was signed on March 1st"
- ✅ Explicit preferences: "Please call me on my cell, not office phone"
- ✅ Key dates and deadlines
- ❌ Speculation: "I think the deadline might be next week"
- ❌ Sensitive data: SSNs, credit card numbers (filter before storage)

### 2. Memory Expiration

Use `expiration_date` in metadata to manage memory lifecycle:

```typescript
// Session context - expires in 7 days
await client.memory.add({
  messages,
  metadata: {
    client_id,
    expiration_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'session_context'
  }
});

// Recent interactions - expires in 30 days
await client.memory.add({
  messages,
  metadata: {
    client_id,
    expiration_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'interaction'
  }
});

// User preferences - no expiration (permanent)
await client.memory.add({
  messages,
  metadata: {
    client_id,
    type: 'preference'
    // No expiration_date = permanent
  }
});
```

### 3. Tagging & Organization

Define consistent categories for easy retrieval:

```typescript
// Define standard categories
const MEMORY_CATEGORIES = {
  PREFERENCES: 'preferences',      // Contact preferences, communication style
  CLIENT_INFO: 'client_info',      // Client details, relationships
  DEADLINES: 'deadlines',          // Important dates, filing deadlines
  CASE_FACTS: 'case_facts',        // Facts relevant to legal matters
  SESSION_NOTES: 'session_notes',  // Temporary conversation context
} as const;

// Use categories consistently
await client.memory.add({
  messages,
  metadata: {
    client_id,
    matter_id,
    category: MEMORY_CATEGORIES.DEADLINES,
    priority: 9  // High priority for deadlines
  }
});

// Retrieve by category
const deadlines = await client.memory.search({
  query: 'upcoming deadline',
  filters: {
    client_id,
    category: MEMORY_CATEGORIES.DEADLINES
  }
});
```

## Integration Pattern for Chat Routes

### Complete Chat Route Example

```typescript
// app/api/chat/route.ts
import { NextResponse } from 'next/server';
import Casedev from 'casedev';

const client = new Casedev({ apiKey: process.env.CASEDEV_API_KEY! });

export async function POST(request: Request) {
  const { messages, client_id, matter_id, session_id } = await request.json();
  const userMessage = messages[messages.length - 1].content;

  // 1. Retrieve relevant memories before generating response
  const memories = await client.memory.search({
    query: userMessage,
    filters: { client_id, matter_id },
    top_k: 5
  });

  // 2. Build system prompt with memory context
  const memoryContext = memories.results.length > 0
    ? `You have access to the following context about this client:\n${memories.results.map(m => `- ${m.memory}`).join('\n')}`
    : '';

  const systemPrompt = `
You are a helpful legal assistant.
${memoryContext}

Use this context to provide personalized, informed responses.
`;

  // 3. Generate response using LLM
  const response = await client.llm.v1.chat.createCompletion({
    model: 'anthropic/claude-3-5-sonnet-20241022',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages
    ],
  });

  const assistantMessage = response.choices[0].message.content;

  // 4. Store new facts from the conversation
  await client.memory.add({
    messages: [
      ...messages,
      { role: 'assistant', content: assistantMessage }
    ],
    metadata: { 
      client_id, 
      matter_id, 
      session_id,
      category: 'interaction'
    }
  });

  return NextResponse.json({ 
    message: assistantMessage,
    memories_used: memories.results.length
  });
}
```

### Server Action Pattern

```typescript
// app/actions/memory.ts
'use server';

import Casedev from 'casedev';

const client = new Casedev({ apiKey: process.env.CASEDEV_API_KEY! });

export async function getClientContext(clientId: string, query: string) {
  const memories = await client.memory.search({
    query,
    filters: { client_id: clientId },
    top_k: 10
  });

  return memories.results.map(m => ({
    fact: m.memory,
    category: m.metadata?.category,
    relevance: m.score
  }));
}

export async function saveInteraction(
  clientId: string,
  matterId: string,
  messages: Array<{ role: string; content: string }>
) {
  await client.memory.add({
    messages,
    metadata: {
      client_id: clientId,
      matter_id: matterId,
      category: 'interaction',
      timestamp: new Date().toISOString()
    }
  });
}
```

## Common Patterns

### Pre-populate Context for New Conversations

```typescript
async function initializeConversation(clientId: string, matterId: string) {
  // Get client preferences
  const preferences = await client.memory.search({
    query: 'communication preferences contact style',
    filters: { client_id: clientId, category: 'preferences' },
    top_k: 5
  });

  // Get matter-specific context
  const matterContext = await client.memory.search({
    query: 'case facts status updates',
    filters: { matter_id: matterId, category: 'case_facts' },
    top_k: 10
  });

  return {
    preferences: preferences.results,
    matterContext: matterContext.results
  };
}
```

### Cleanup Old Session Data

```typescript
async function cleanupExpiredMemories(clientId: string) {
  const now = new Date().toISOString();
  
  await client.memory.delete({
    filters: {
      client_id: clientId,
      expiration_date: { lt: now }
    }
  });
}
```

### Multi-Agent Memory Separation

```typescript
// Agent 1: Research Agent
await client.memory.add({
  messages,
  metadata: {
    client_id,
    agent_id: 'research_agent',
    category: 'research_findings'
  }
});

// Agent 2: Drafting Agent - only sees its own memories by default
const draftingMemories = await client.memory.search({
  query: 'contract clauses',
  filters: {
    client_id,
    agent_id: 'drafting_agent'
  }
});

// Or explicitly access another agent's memories
const researchFindings = await client.memory.search({
  query: 'relevant cases',
  filters: {
    client_id,
    agent_id: 'research_agent'
  }
});
```

## Gotchas

- **Async Extraction**: Memory extraction happens asynchronously; new facts may not be immediately searchable
- **Semantic Search**: Queries match by meaning, not exact keywords; "contact preferences" will find "call me in the morning"
- **Metadata Types**: Metadata values should be strings or numbers for reliable filtering
- **Filter Case Sensitivity**: String filters are case-sensitive
- **Rate Limits**: Be mindful of API rate limits when processing many conversations
- **Expiration**: Expired memories are not automatically deleted; implement cleanup routines

## Resources

- [case.dev Memory API Documentation](https://docs.case.dev/memory)
- [Mem0 Ingestion Control Patterns](https://docs.mem0.ai/cookbooks/essentials/controlling-memory-ingestion)
- [Mem0 Memory Expiration Patterns](https://docs.mem0.ai/cookbooks/essentials/memory-expiration-short-and-long-term)
- [Mem0 Tagging Patterns](https://docs.mem0.ai/cookbooks/essentials/tagging-and-organizing-memories)
