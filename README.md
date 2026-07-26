# SATURN.ai

**SATURN is my local-first studio operating system for New Era Designs.**

I built it because running a creative studio across random notes, folders, browser tabs, pricing sheets, client conversations, and half-finished ideas gets chaotic fast. SATURN brings the operational side of the work into one place: projects, proposals, pricing, workflows, meeting notes, documents, and AI-assisted studio knowledge.

This is not meant to be another generic chatbot with a dark dashboard. The point is to create a working memory for the studio—something that understands how New Era Designs scopes work, organizes projects, develops proposals, and moves an idea from conversation to delivery.

## Current status

SATURN is an active experimental build. The core local application and data modules exist, but it should not be treated as a finished commercial SaaS product yet.

### Working modules

- **Command Center** — studio dashboard, quick prompts, and provider health
- **Proposal Engine** — proposal records and NED-oriented proposal workflows
- **Pricing + Scope** — pricing references and scope calculations
- **Project Memory** — project tracking, phases, status, and context
- **Workflow Tracker** — repeatable production steps and task management
- **Meeting Notes** — raw notes, summaries, and action tracking
- **Document Q&A** — document records and a studio knowledge base
- **Multi-provider AI router** — Ollama, OpenAI, Anthropic, Gemini, then offline knowledge fallback

### Still developing

- Real client portal and approval workflows
- Invoice generation
- Asset-library versioning
- Production-grade Adobe, Shopify, SketchUp, Google Drive, Calendar, Notion, Slack, and accounting integrations
- Authentication, permissions, deployment hardening, and automated testing

Integration screens or connector scaffolding may exist before an integration is fully production-ready.

## Technology

- React 18 + TypeScript
- Vite
- Tailwind CSS + Radix UI
- Express 5
- SQLite + Drizzle ORM
- Zod validation
- TanStack Query
- Framer Motion
- Ollama and optional cloud LLM providers

## Quick start

```bash
cd saturn-ai
npm install
npm run db:push
npm run dev
```

Open `http://localhost:5000`.

Requirements:

- Node.js 18+
- npm 9+
- Ollama is optional for private, local AI

More detailed setup instructions are in [`saturn-ai/INSTALL.md`](saturn-ai/INSTALL.md).

## AI routing

SATURN is designed to keep working even when a paid provider is unavailable.

```text
Ollama → OpenAI → Anthropic → Gemini → Offline NED Knowledge Base
```

Copy `saturn-ai/.env.example` to `saturn-ai/.env` and add only the providers you intend to use. Never commit the completed `.env` file.

## Repository structure

```text
SATURN.ai/
├── README.md
├── PROJECT_OVERVIEW.md
├── SECURITY.md
└── saturn-ai/
    ├── client/          React interface
    ├── server/          Express API, storage, AI routing, integrations
    ├── shared/          Shared database schemas and types
    ├── script/          Build tooling
    ├── INSTALL.md       Local setup guide
    └── package.json
```

## Why it exists

New Era Designs works across brand identity, websites, signage, spatial design, motion, and visual storytelling. Those projects create a lot of information before they create a finished visual. SATURN is the system being built to hold that information together and turn studio knowledge into clearer decisions.

Some parts are polished. Some parts are prototypes. The direction is intentional.

— Christopher Edwards / New Era Designs
