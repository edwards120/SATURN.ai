/**
 * Saturn AI — Config System
 * Reads from environment variables (local .env) or database config table.
 * Offline-first: works with zero env vars set.
 */

import type { LLMConfig } from "./llm";

export function getLLMConfig(): LLMConfig {
  return {
    provider: (process.env.SATURN_LLM_PROVIDER as any) || "ollama",
    ollamaUrl: process.env.OLLAMA_URL || "http://localhost:11434",
    ollamaModel: process.env.OLLAMA_MODEL || "llama3",
    openaiKey: process.env.OPENAI_API_KEY || "",
    openaiModel: process.env.OPENAI_MODEL || "gpt-4o",
    anthropicKey: process.env.ANTHROPIC_API_KEY || "",
    anthropicModel: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022",
    geminiKey: process.env.GEMINI_API_KEY || "",
    geminiModel: process.env.GEMINI_MODEL || "gemini-1.5-flash",
    systemPrompt: process.env.SATURN_SYSTEM_PROMPT || "",
  };
}

export const ENV_TEMPLATE = `# ──────────────────────────────────────────────
# Saturn AI — Environment Configuration
# Copy this to .env in your saturn-ai/ folder
# ──────────────────────────────────────────────

# ── LLM Provider Priority ──────────────────────
# Saturn tries: ollama → openai → anthropic → gemini → offline
# Leave empty to skip a provider

# Local Ollama (recommended for offline use)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3

# OpenAI (optional — cloud, requires API key)
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o

# Anthropic Claude (optional — cloud, requires API key)
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

# Google Gemini (optional — cloud, requires API key)
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash

# ── Integrations ───────────────────────────────

# Adobe Creative Cloud
ADOBE_CLIENT_ID=
ADOBE_CLIENT_SECRET=
ADOBE_ORG_ID=

# Adobe Firefly
FIREFLY_CLIENT_ID=
FIREFLY_CLIENT_SECRET=

# Shopify (one store — add more in Integrations page)
SHOPIFY_STORE_DOMAIN=
SHOPIFY_ADMIN_TOKEN=
SHOPIFY_API_VERSION=2025-01

# SketchUp (local file watcher)
SKETCHUP_PROJECTS_FOLDER=
SKETCHUP_EXE_PATH=

# Notion
NOTION_TOKEN=
NOTION_DB_ID=

# ── Saturn Identity ────────────────────────────
PORT=5000
NODE_ENV=production
`;
