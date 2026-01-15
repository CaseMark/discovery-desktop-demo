# Discovery Desktop

**AI-Powered Document Discovery for Legal Professionals**

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Next.js](https://img.shields.io/badge/Next.js-16.1-black)](https://nextjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)](https://tailwindcss.com)

## Overview

Discovery Desktop is a browser-based document discovery application that enables legal professionals to upload, process, and semantically search through case documents. Built on the Case.dev platform, it provides OCR processing, vector embeddings, and intelligent search capabilities—all running locally in your browser.

## Features

- **Smart Document Processing**: Automatic text extraction with format-aware handling
  - **DOCX files**: Client-side extraction via mammoth.js (no API cost)
  - **PDFs & images**: OCR processing via Case.dev API
  - **Plain text**: Direct processing (no API cost)
- **Semantic Search**: Find relevant document passages using AI-powered vector similarity search
- **Case Management**: Organize documents into cases for structured discovery workflows
- **Search History**: Track and revisit previous searches within each case
- **Percentage Match Filtering**: Filter search results by relevance threshold
- **Local-First Architecture**: All case data stored in your browser for privacy

## Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com) with custom legal-focused theme
- **Typography**: [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif) (headings), [Inter](https://rsms.me/inter/) (body)
- **Database**: IndexedDB via [Dexie.js](https://dexie.org) (client-side)
- **Document Processing**: [mammoth.js](https://github.com/mwilliamson/mammoth.js) (DOCX extraction)
- **File Storage**: [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) (production OCR uploads)
- **AI Services**: [Case.dev](https://case.dev) APIs for OCR and embeddings
- **Package Manager**: [Bun](https://bun.sh)

## Database Configuration

Discovery Desktop uses **IndexedDB** for all client-side data storage, managed through Dexie.js. This provides:

- **Zero server database setup**: No PostgreSQL, MySQL, or cloud database required
- **Privacy by default**: All case data remains in your browser
- **Offline capability**: Access your cases without internet (search requires API)
- **Automatic schema migrations**: Dexie handles database versioning

### Database Schema

| Table | Description |
|-------|-------------|
| `cases` | Case metadata (name, description, created date) |
| `documents` | Uploaded documents with OCR status and extracted text |
| `chunks` | Text chunks created from documents for embedding |
| `embeddings` | Vector embeddings for semantic search |
| `searchHistory` | Previous search queries per case |
| `processingJobs` | OCR and embedding job status tracking |

## Vercel Blob Configuration

For production deployments, Discovery Desktop uses [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) to store uploaded documents temporarily during OCR processing. This is required because:

- Large PDFs exceed request size limits when sent as base64 data URLs
- The Case.dev OCR API needs a publicly accessible URL to fetch documents
- Blob storage provides reliable, fast access for the OCR service

### Setup

1. Go to [Vercel Dashboard → Storage](https://vercel.com/dashboard/stores)
2. Create a new Blob store
3. Copy the `BLOB_READ_WRITE_TOKEN` to your environment variables

### How it works

1. User uploads a document
2. Document is uploaded to Vercel Blob (`ocr-uploads/` folder)
3. Blob returns a public URL
4. URL is sent to Case.dev OCR API for processing
5. OCR results are returned and stored in IndexedDB

**Note:** In local development without a Blob token, the app falls back to base64 data URLs (suitable for small files).

## API Pricing

Discovery Desktop uses Case.dev APIs with the following pricing structure:

| Service | Cost |
|---------|------|
| **Embedding Generation** | $3.00 per 1M input tokens |
| **Embedding Generation** | $15.00 per 1M output tokens |
| **OCR Processing** | $0.02 per page |

### Cost Examples

- Uploading a 10-page PDF: ~$0.20 (OCR) + ~$0.01 (embeddings) = **~$0.21**
- Running a search query: ~$0.001 per search
- Processing 100 pages of documents: **~$2.10**

## Demo Limits

This demo application includes usage limits to ensure fair access:

| Limit | Value |
|-------|-------|
| **Session Duration** | 24 hours |
| **Usage Budget** | $5.00 USD |

Once you reach either limit, you'll need to create a free account at [console.case.dev](https://console.case.dev) for unlimited access to Discovery Desktop and other Case.dev applications.

### What counts toward usage?

- OCR processing (per page)
- Embedding generation for document indexing
- Embedding generation for search queries

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/CaseMark/starter-app-demos.git
cd starter-app-demos/discovery-desktop-demo
bun install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env.local
```

Configure your environment variables:

```env
# Case.dev API (get keys from https://console.case.dev)
CASE_API_KEY=sk_case_...
CASE_API_URL=https://api.case.dev

# Vercel Blob (required for production OCR)
# Create a blob store at https://vercel.com/dashboard/stores
BLOB_READ_WRITE_TOKEN=vercel_blob_...

# Demo limits (optional, defaults shown)
NEXT_PUBLIC_DEMO_SESSION_HOURS=24
NEXT_PUBLIC_DEMO_SESSION_PRICE_LIMIT=5
```

### 3. Run Development Server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to access Discovery Desktop.

## Project Structure

```
discovery-desktop-demo/
├── app/                    # Next.js App Router
│   ├── (protected)/        # Authenticated routes
│   │   ├── cases/          # Case management pages
│   │   ├── dashboard/      # Main dashboard
│   │   └── settings/       # User settings
│   └── api/                # API routes
│       ├── embeddings/     # Embedding generation
│       └── ocr/            # OCR processing
├── components/
│   ├── demo/               # Demo limit components
│   ├── documents/          # Document management UI
│   ├── layout/             # App layout components
│   ├── search/             # Search interface
│   └── ui/                 # Base UI primitives
├── lib/
│   ├── case-dev/           # Case.dev API client
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom React hooks
│   ├── processing/         # Document processing pipeline
│   ├── search/             # Search implementation
│   ├── storage/            # IndexedDB operations
│   ├── usage/              # Demo usage tracking
│   └── vector-store/       # Vector similarity search
└── types/                  # TypeScript definitions
```

## Usage Workflow

1. **Create a Case**: Start by creating a new case to organize your documents
2. **Upload Documents**: Add PDFs or images to your case for processing
3. **Wait for Processing**: Documents are OCR'd and indexed automatically
4. **Search**: Use natural language queries to find relevant passages
5. **Review Results**: Click on matches to see full context and source documents

## Upgrade to Full Access

Ready for unlimited document processing? Create a free account at [console.case.dev](https://console.case.dev) to:

- Remove demo usage limits
- Access additional Case.dev APIs
- Deploy your own Discovery Desktop instance
- Build custom legal AI applications

## License

This project is licensed under the [Apache 2.0 License](LICENSE).

---

Built with [Case.dev](https://case.dev) — AI infrastructure for legal technology.
