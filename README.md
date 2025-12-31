# Create Legal App

**The Agent-Optimized Legal Tech Starter Kit.**

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Next.js](https://img.shields.io/badge/Next.js-15.1-black)](https://nextjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)](https://tailwindcss.com)

> 🤖 **Built for Agents**: This repository is designed to be read by AI agents. It includes comprehensive internal documentation (`AGENTS.md` and `skills/`) that guides LLMs in generating production-ready legal tech code.

## 🚀 Overview

`create-legal-app` is a modern, opinionated starter kit for building legal technology applications. It provides a solid foundation with Next.js 15, Shadcn UI (Maia theme), and a structure pre-configured for complex legal workflows like document analysis, case management, and secure vaults.

**What makes this different?**
Most starter kits are just code. This kit includes **Instructional Metadata** (Skills) that teach your AI coding assistant (Cursor, Windsurf, etc.) *exactly* how to implement semantic search, OCR pipelines, and legal-specific workflows using the Case.dev SDK.

## ✨ Features & Stack

- **Framework**: [Next.js 15](https://nextjs.org) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com) + [Shadcn UI](https://ui.shadcn.com) (Maia Preset)
- **Font**: [Inter](https://rsms.me/inter/) & [Spectral](https://fonts.google.com/specimen/Spectral) (Serif for legal texts)
- **Package Manager**: [Bun](https://bun.sh)
- **Agent Skill System**: Dedicated documentation in `skills/` for:
    - `case-dev`: Legal AI, Vaults, OCR
    - `database`: Neon / Postgres schemas (Schema ready)
    - `auth`: Authentication patterns

## 🛠️ Getting Started

### 1. Initialize the Project

```bash
git clone https://github.com/CaseMark/create-legal-app.git my-legal-startup
cd my-legal-startup
bun install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env.local
```

Fill in your API keys (get your Case.dev keys from the [Case.dev Console](https://console.case.dev)):

```env
# .env.local
CASE_API_KEY=sk_case_...
DATABASE_URL=postgres://...
```

### 3. Run Development Server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see the starter page.

## 🤖 For AI Agents

**Are you an AI?** Start by reading **[AGENTS.md](./AGENTS.md)**.

1.  **Context**: Read `AGENTS.md` to understand the project architecture and principles.
2.  **Skills**: Before implementing a feature, check the `skills/` directory. For example, if the user asks for "Document Upload", read `skills/case-dev/SKILL.md`.
3.  **Conventions**: stricta file naming and `kebab-case` for utilities.

## 📚 Documentation Structure

- **`/app`**: Next.js App Router (Pages, Layouts, API Routes)
- **`/components`**: React components (UI primitives in `/ui`, custom in root)
- **`/lib`**: Shared utilities (Place your `case-dev` client here)
- **`/skills`**: **The Brain**. Contains Markdown files specifically for AI context.
    - `/case-dev`: SDK usage, Vaults, Workflows
    - `/database`: Schema design patterns
    - `/auth`: Auth flow documentation

## 📄 License

This project is licensed under the [Apache 2.0 License](LICENSE).
