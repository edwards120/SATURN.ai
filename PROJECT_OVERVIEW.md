# SATURN.ai — Project Overview

## Product definition

SATURN is a local-first studio operating system built for New Era Designs. It combines studio records, repeatable business workflows, and AI-assisted knowledge retrieval in one application.

The product is designed around a specific problem: creative work produces decisions, notes, pricing logic, project history, documents, and client context across too many disconnected places. SATURN is being developed as the internal layer that keeps those parts connected.

## Core principles

1. **Local first** — the application should remain useful without a paid AI provider or permanent internet connection.
2. **Studio specific** — workflows should reflect how New Era Designs actually scopes, designs, documents, and delivers work.
3. **Useful before intelligent** — project records, pricing, tasks, and documents must work even when AI is unavailable.
4. **Transparent routing** — users should know which AI provider answered and when the offline knowledge base was used.
5. **No false integrations** — an integration tile or interface does not mean the external service is fully connected.

## Current application modules

| Module | Current purpose | Status |
|---|---|---|
| Command Center | Daily studio view, prompt access, and provider health | Active prototype |
| Proposal Engine | Create and manage proposal records | Active prototype |
| Pricing + Scope | Organize pricing logic and project scope | Active prototype |
| Project Memory | Track project context, phases, and status | Active prototype |
| Workflow Tracker | Manage repeatable production steps and tasks | Active prototype |
| Meeting Notes | Store notes and convert conversation into actions | Active prototype |
| Document Q&A | Maintain document records and studio knowledge | Active prototype |
| Client Portal | Client-facing review and approval workflows | Planned |
| Invoice Engine | Generate invoices from approved project scope | Planned |
| Asset Library | Organize and version studio assets | Planned |

## AI architecture

SATURN routes prompts through available providers in this order:

```text
Ollama → OpenAI → Anthropic → Gemini → Offline Knowledge Base
```

The API response identifies the provider, model, latency, and whether the answer came from the offline fallback.

The application is designed to function with zero cloud API keys. Ollama can provide local inference, and the built-in knowledge fallback supports limited NED-specific responses when no model is available.

## Data model currently represented

- Projects
- Proposals
- Documents
- Tasks
- Workflow steps
- Meeting notes
- Provider configuration metadata

SQLite is used for local persistence, with Drizzle ORM and Zod-backed validation across shared schemas.

## Near-term priorities

1. Confirm every existing module completes its full create, read, update, and delete workflow.
2. Add automated tests for API routes, schemas, and provider fallback behavior.
3. Separate prototypes and mock integrations from operational integrations in the interface.
4. Add authentication before any remote deployment.
5. Improve document ingestion and retrieval beyond basic record storage and keyword knowledge.
6. Add export, backup, and database migration procedures.
7. Review model names and provider APIs before production use.

## Explicit boundaries

SATURN is not currently represented as:

- A production-ready SaaS platform
- A secure external client portal
- A replacement for accounting software
- A fully autonomous design agent
- A completed Adobe, Shopify, SketchUp, Google, Notion, or Slack integration layer

Those may become product directions, but the repository should distinguish implemented behavior from roadmap ideas.

## Intended relationship to New Era Designs

- `neweradesigns.co` is the public brand and Shopify experience.
- `SATURN.ai` is the internal studio operating system.
- Future focused tools, such as signage specification software, can expose narrow functionality that SATURN may eventually call through APIs.

This separation keeps the public website, the studio operating system, and future products from becoming one unmanageable codebase.
