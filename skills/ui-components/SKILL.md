---
# Do not remove this header. Agents read it.
description: |
  Agents: Always follow this skill when creating or modifying any UI component. 
  Use Shadcn MCP + CLI to scaffold primitives and patterns; avoid hand-rolled UI. 
  Conform to the variants matrix and canonical compositions.
---

# UI Components Skill

## Quick Toolbelt
- Init MCP (pick your client): `bunx --bun shadcn@latest mcp init --client opencode`
- Add primitives fast: `bunx --bun shadcn@latest add button input select dialog table`
- Compose in `components/` using tokens and allowed variants

## Purpose

Define an opinionated component vocabulary and variants matrix so UIs look cohesive across apps. This complements the Styling Skill by prescribing allowed variants, sizes, and compositions.

## Design Principles (Ive Revision)
- Reduction: Remove the unnecessary until only the essential remains.
- Clarity: Hierarchy and contrast that are felt before they’re noticed.
- Material Honesty: Tokens are the material; never fake depth or color.
- Rhythm: Consistent vertical rhythm and measured line lengths guide reading.
- Deference: Interface recedes so content and decisions come forward.
- Poise: Motion is calm, purposeful, and barely there.
- Care: Accessibility as craft—focus, contrast, and language refined.

## Decision Heuristics (Ive Revision)
- Actions: One primary action per view; prefer secondary/outline for the rest. Ghost is only for inline, low‑emphasis affordances. Destructive requires explicit confirmation; never default‑focused.
- Composition: Page headers include title, short description, then primary and secondary actions. Keep copy to 60–72ch; avoid more than two font weights per page. Avoid centered body copy; reserve center alignment for simple empty states.
- Elevation: Prefer 1px borders; avoid shadows unless separation is essential. Use `shadow-sm` sparingly; overlays rely on subtle borders and backdrops.
- Density: Cozy by default; compact at container scope (`text-sm`, `gap-2/3`, `p-2/3`). Never reduce interactive hit targets below 40px.
- Typography: H1 is unique per page; H2 for sections; H3 for subsections; never invent sizes. Tighten headings subtly (`tracking-tight`) and keep body open and legible.
- Icons: Pair icons with labels unless the control is universally understood. Default size 20; inherit color; avoid decorative color unless semantic.
- Forms: Always include a `Label`; place concise help text directly beneath. Errors are specific, polite, and associated via `aria-invalid` and `aria-describedby`.
- Motion: Durations 120–180ms for micro‑interactions, ~240ms for entrances; no bounce or overshoot. Prefer color/opacity transitions; transform only when it communicates state.
- Color: Primary is sparse and purposeful; accent is rare and contextual. Destructive conveys irreversible risk; don’t use for mere warnings.

## Key Files

- `components/ui/*` — Shadcn primitives (auto-generated; do not edit)
- `components/*` — Custom components (author here)
- `components.json` — Shadcn configuration (Maia preset)

## Shadcn MCP + CLI (Required)

Shadcn is the default mechanism to add primitives and patterns. Use MCP for in-editor automation and CLI for direct commands.

- Install MCP server in this repo (choose your client):
  - Claude: `bunx --bun shadcn@latest mcp init --client claude`
  - Opencode: `bunx --bun shadcn@latest mcp init --client opencode`
  - Cursor: `bunx --bun shadcn@latest mcp init --client cursor`
  - Codex: `bunx --bun shadcn@latest mcp init --client codex`
  - Factory: `bunx --bun shadcn@latest mcp init --client factory`

- Generate primitives:
  - `bunx --bun shadcn@latest add <component>` (e.g., `button`, `dialog`, `table`)

- Docs:
  - MCP: https://ui.shadcn.com/docs/mcp
  - Shadcn: https://ui.shadcn.com/docs

Preferred flow:
1) Add primitive(s) with Shadcn. 2) Compose in `components/` using tokens. 3) Apply allowed variants/sizes only. 4) Verify with the checklist.

## Authoring Rules
- Import primitives from `@/components/ui/[name]`
- Compose with `cn()` from `@/lib/utils`
- Use semantic `variant` and `size` props; avoid boolean style flags
- Use token classes only (see Styling Skill). No raw colors or numeric palette classes
- Add `'use client'` when using hooks or browser APIs
- Type all props with explicit interfaces

## Icons
- Library: Phosphor (`@phosphor-icons/react`)
- Sizes: 16 (dense), 20 (default), 24 (prominent)
- Weights: `regular` default; `bold` for active; `duotone` for decorative; `fill` only when required
- Color: inherit text color; for accents, use token classes (e.g., `text-primary`)

## Variants Matrix (Canonical)

### Button
Allowed variants and sizes only:
- Variants: `default`, `secondary`, `outline`, `ghost`, `destructive`
- Sizes: `sm`, `md` (default), `lg`

Usage examples:
```tsx
<Button>Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
```

Style guidance (reference, not implementation):
- `default`: `bg-primary text-primary-foreground`
- `secondary`: `bg-secondary text-secondary-foreground`
- `outline`: `border border-input bg-background`
- `ghost`: minimal chrome; rely on hover: `hover:bg-accent`
- `destructive`: `bg-destructive text-destructive-foreground`

States:
- Loading: add spinner to the left, disable interactions
- Destructive: always requires confirmation (dialog or second step)

### Input / Textarea / Select
- Sizes: `sm`, `md` (default)
- States: `default`, `invalid`, `disabled`
- Compose with Label + Help text

Usage:
```tsx
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" />
  <p className="text-xs text-muted-foreground">We’ll never share your email.</p>
</div>
```

Style guidance:
- Default: `border-input bg-background`
- Invalid: add `aria-invalid` and prefer tokenized ring: `ring-2 ring-destructive/30`
- Disabled: `opacity-50 cursor-not-allowed` (no custom colors)

### Card
- Variants: `flat` (default border), `elevated` (`shadow-sm`), `ghost` (no border)
- Composition: `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`

Usage:
```tsx
<Card className="shadow-sm">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Optional description</CardDescription>
  </CardHeader>
  <CardContent>{/* Content */}</CardContent>
</Card>
```

### Alert/Dialog
- Use Shadcn primitives; do not restyle components beyond tokens
- Danger actions must be `variant="destructive"`
- Confirm patterns require explicit primary/secondary actions

### Badge
- Variants: `default`, `secondary`, `outline`
- Sizes: `sm` (default), `md`
- Colors follow token roles; avoid status‑specific custom colors unless tokens are extended

## Canonical Compositions

### Page Header
```tsx
<div className="border-b bg-background">
  <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
    <div>
      <h1 className="text-xl md:text-2xl font-semibold">Page Title</h1>
      <p className="text-sm text-muted-foreground">Optional description</p>
    </div>
    <div className="flex items-center gap-2">
      <Button variant="outline">Secondary</Button>
      <Button>Primary</Button>
    </div>
  </div>
</div>
```

### Toolbar / Filter Bar
```tsx
<div className="flex flex-wrap items-center gap-2">
  {/* Filters */}
  <Input className="w-[240px]" placeholder="Search" />
  <Select>{/* ... */}</Select>
  <div className="ml-auto flex items-center gap-2">
    <Button variant="outline">Export</Button>
    <Button>New</Button>
  </div>
</div>
```

### Table Page Shell
```tsx
<section className="space-y-6">
  <header className="flex items-center justify-between">
    <div>
      <h2 className="text-xl font-semibold">Records</h2>
      <p className="text-sm text-muted-foreground">Manage your data</p>
    </div>
    <div className="flex items-center gap-2">
      <Button variant="outline">Import</Button>
      <Button>New</Button>
    </div>
  </header>
  {/* Filter bar */}
  <div className="flex flex-wrap items-center gap-2">
    <Input placeholder="Search" className="w-[240px]" />
    <Select>{/* ... */}</Select>
  </div>
  {/* Table */}
  <div className="rounded-lg border bg-card p-0">
    {/* table component here */}
  </div>
</section>
```

## Motion & Feedback
- Durations: 120–180ms (micro), ~240ms (entrances); no bounce/overshoot
- Prefer `transition-colors` and opacity; use transforms only to communicate state
- Elevation: border-first; reserve `shadow-sm` for essential separation; avoid heavy shadows
- Loading: use skeletons (`animate-pulse`) for content areas; spinners for button-level
- Empty: neutral icon, concise guidance, primary action
- Errors: tokenized text or alert components; never red text alone without context

## Accessibility
- Ensure `aria-*` states for inputs (`aria-invalid`, `aria-describedby`)
- Use Label for all form fields; associate via `htmlFor`
- Keep hit targets ≥ 40px; maintain visible focus (global ring)
- Verify color contrast when placing text over `accent` or `primary` backgrounds

## Design Review Checklist (Components)
- Variant and size are from the allowed matrix
- Colors are token-based; no raw or numeric palette usage
- Focus states visible; keyboard interactions work
- Loading/empty/error states follow the shared patterns
- Composition matches canonical shells where applicable

## Optional Guardrail (opt-in)
Add a custom ESLint rule to flag raw color usage in className (example regex):
```js
// In eslint.config.mjs (opt-in)
const RAW_COLOR_CLASS = /(bg|text|border|ring)-(black|white|\d{1,3}|[a-zA-Z]+-\d{2,3})|#([0-9a-fA-F]{3,8})/;
```

## Resources
- Shadcn MCP: https://ui.shadcn.com/docs/mcp
- Shadcn Docs: https://ui.shadcn.com/docs
- Phosphor Icons
- Tailwind CSS
