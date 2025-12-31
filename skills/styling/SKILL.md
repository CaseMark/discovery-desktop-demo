---
# Do not remove this header. Agents read it.
description: |
  Agents: Always follow this skill when creating or modifying any UI or styling. 
  Use Shadcn MCP + CLI to scaffold primitives, patterns, and themes; do not hand-roll UI. 
  Prefer tokens, canonical layouts, and the variants matrix over ad-hoc decisions.
---

# Styling Skill

## Quick Toolbelt
- Init MCP (pick your client): `bunx --bun shadcn@latest mcp init --client opencode`
- Add primitives fast: `bunx --bun shadcn@latest add button input select dialog table`
- Compose in `components/` using tokens and allowed variants

## Purpose

Provide a shared, opinionated design language to keep apps consistent and avoid “vibe coding.” This document defines the foundations (tokens, type, spacing), canonical layout patterns, and enforcement guidelines for all create-legal-app projects.

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

## Scope & Key Files

- `app/globals.css` — Tailwind v4 imports, inline theme tokens and roles
- `app/layout.tsx` — Font loading (Inter, JetBrains Mono, Spectral for headings)
- `components.json` — Shadcn theme configuration (Maia preset)

Notes:
- Tailwind v4 is used. There is no `tailwind.config.ts`. Tokens and roles are mapped via `@theme inline` in `app/globals.css`.
- Colors are defined in OKLCH. Always reference tokens via Tailwind classes, never raw values.

## Shadcn MCP + CLI (Required)

Shadcn is the primary way to add/modify UI primitives. Use MCP for in-editor automation and the CLI for direct commands.

- Install MCP server in this repo (choose your client):
  - Claude: `bunx --bun shadcn@latest mcp init --client claude`
  - Opencode: `bunx --bun shadcn@latest mcp init --client opencode`
  - Cursor: `bunx --bun shadcn@latest mcp init --client cursor`
  - Codex: `bunx --bun shadcn@latest mcp init --client codex`
  - Factory: `bunx --bun shadcn@latest mcp init --client factory`

- Use CLI to manage components and theme:
  - Add component: `bunx --bun shadcn@latest add <component>` (e.g., `button`, `dialog`, `table`)
  - Update theme preset or sync: see docs and `components.json`

- Docs:
  - MCP: https://ui.shadcn.com/docs/mcp
  - Shadcn: https://ui.shadcn.com/docs

Preferred flow:
1) Generate primitives via Shadcn (MCP or CLI). 2) Compose in custom components. 3) Style via tokens only. 4) Verify against checklists below.

## Foundations

### Fonts
- Body: Inter (`--font-sans`) via `app/layout.tsx` and applied in `app/globals.css`.
- Code: JetBrains Mono (`--font-mono`).
- Headings: Spectral (loaded in `app/layout.tsx`, applied to `h1–h6` in `app/globals.css`).

### Color Tokens & Roles
Use only semantic token classes. Do not use raw hex, rgb, OKLCH values, or Tailwind numeric palettes (e.g., `-500`).
- Surfaces: `bg-background`, `bg-card`, `bg-popover`
- Text: `text-foreground`, `text-muted-foreground`, `text-accent-foreground`, `text-primary-foreground`, `text-secondary-foreground`, `text-destructive-foreground`
- Actions: `bg-primary`, `bg-secondary`, `bg-accent`, `bg-destructive`
- Chrome: `border`, `ring`, `input`
- Sidebar (when present): `bg-[sidebar]` tokens are available

Dark mode: Tokens adapt automatically via `.dark` variables defined in `app/globals.css`. Prefer tokens over `dark:` prefixes. A custom `@custom-variant dark` exists for advanced cases—use sparingly and only when tokens cannot express the intent.

### Type Scale & Roles
Use semantic roles with concrete classes. Do not ad‑hoc type sizes.
- Display (rare): `text-5xl font-semibold tracking-tight`
- H1 (page title): `text-3xl md:text-4xl font-bold`
- H2 (section): `text-2xl md:text-3xl font-semibold`
- H3 (subsection): `text-xl md:text-2xl font-semibold`
- H4 (minor heading): `text-lg font-medium`
- Body: `text-base text-foreground`
- Muted: `text-sm text-muted-foreground`
- Caption/Meta: `text-xs text-muted-foreground`

Text emphasis levels:
- High: `text-foreground`
- Medium: `text-foreground/80`
- Low: `text-muted-foreground`

### Spacing & Density
Default density is “cozy.” Use this scale and avoid arbitrary values.
- Gaps: `gap-2` (tight), `gap-3`, `gap-4` (default), `gap-6` (roomy)
- Padding: `p-2`, `p-3`, `p-4` (default), `p-6`
- Page gutters: `px-4` (mobile), `md:px-6`

Density modes:
- Cozy (default): body `text-base`, components `gap-4`, `p-4`
- Compact (data-dense UIs): wrapper `text-sm`, prefer `gap-2–3`, `p-2–3`

### Layout & Containers
- Content container: `container mx-auto px-4 md:px-6`
- Max widths: prefer fluid; for prose or narrow flows use `max-w-2xl`/`max-w-3xl`
- Breakpoints: `sm 640`, `md 768`, `lg 1024`, `xl 1280`, `2xl 1536`

### Foundational Notes
- Baseline rhythm: align spacing and line-height to a 4px baseline where practical.
- Line length: constrain long-form content to `max-w-prose` or `max-w-3xl`.
- Radii: use the single radius system; avoid mixing corner treatments.
- Focus: rely on the global tokenized ring; avoid per-component outlines.
- Shadows: border-first; reserve `shadow-sm` for essential separation only.

## Canonical Page Patterns

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

### Two-Column Layout
```tsx
<div className="container mx-auto grid grid-cols-1 gap-6 md:grid-cols-[280px,1fr] px-4 md:px-6">
  <aside className="space-y-4">{/* Nav / Filters */}</aside>
  <main className="space-y-6">{/* Content */}</main>
</div>
```

### Card List
```tsx
<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
  <Card className="shadow-sm" />
  <Card className="shadow-sm" />
</div>
```

### Forms
```tsx
<form className="space-y-6">
  <div className="space-y-2">
    <Label htmlFor="email">Email</Label>
    <Input id="email" type="email" />
    <p className="text-xs text-muted-foreground">We’ll never share your email.</p>
  </div>
  <div className="flex gap-2">
    <Button type="submit">Save</Button>
    <Button type="button" variant="outline">Cancel</Button>
  </div>
</form>
```

## Component Styling Rules
- Always compose with `cn()` from `@/lib/utils`.
- Prefer semantic variants to boolean flags (e.g., `variant="secondary"` over `secondary={true}`).
- For borders: `border` with `border-border`. Avoid custom colors.
- For focus: rely on global `outline-ring/50` styles; don’t override unless necessary.

## Motion & Elevation
- Durations: 120–180ms (micro), ~240ms (entrances)
- Easing: `ease-out` for entrances, `ease-in` for exits, `ease-in-out` for micro‑interactions; no bounce/overshoot
- Defaults: `transition-colors` on interactive elements; use transforms only when communicating state
- Elevation: border-first; reserve `shadow-sm` for essential separation. Avoid heavier shadows.

## Accessibility & States
- Focus visible: ensure all interactive elements have visible focus; rely on tokens `ring`
- Contrast: aim for WCAG AA (tokens are tuned, but verify when layering)
- Hit targets: min 40×40px for buttons and touch targets
- State patterns: use consistent empty, loading, and error treatments
```tsx
// Skeleton
<div className="h-6 w-48 animate-pulse rounded bg-muted" />

// Inline error
<p className="text-sm text-destructive-foreground">Something went wrong.</p>
```

## Do / Don’t
- Do use token classes (`bg-primary`, `text-muted-foreground`, `border`)
- Do keep spacing to the shared scale
- Don’t use raw colors (`#fff`, `bg-black`, `bg-primary-500`)
- Don’t rely on `dark:` when tokens suffice
- Don’t use negative margins for layout; adjust structure instead

## Design Review Checklist
- Uses only token-based colors and roles
- Typography matches role (H1–H4, body, caption) and density
- Spacing uses shared scale; gutters are correct; rhythm feels consistent
- Focus states visible; controls meet hit target guidance
- Dark mode verified; no color hard-coding
- Variants align with the component matrix (see UI Components Skill)

## Optional Guardrail (opt-in)
Add a custom ESLint rule to flag raw color usage in className (example regex):
```js
// In eslint.config.mjs (opt-in)
const RAW_COLOR_CLASS = /(bg|text|border|ring)-(black|white|\d{1,3}|[a-zA-Z]+-\d{2,3})|#([0-9a-fA-F]{3,8})/;
```

## Resources
- Tailwind CSS v4
- Shadcn UI Theming (Maia)
- Shadcn MCP: https://ui.shadcn.com/docs/mcp
- Shadcn Docs: https://ui.shadcn.com/docs
- CSS Custom Properties (MDN)
