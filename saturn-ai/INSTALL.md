# Saturn AI — Local Install Guide
### New Era Designs | V1.5

---

## Requirements

| Dependency | Version | Notes |
|---|---|---|
| Node.js | 18+ | https://nodejs.org |
| npm | 9+ | Included with Node |
| Ollama *(optional)* | Latest | https://ollama.ai — for local LLM |

---

## Quick Start

### macOS
```bash
# 1. Install Node.js (if not installed)
brew install node   # or download from nodejs.org

# 2. Navigate to Saturn folder
cd saturn-ai

# 3. Install dependencies
npm install

# 4. Push database schema
npm run db:push

# 5. Start Saturn
npm run dev
```
Then open → **http://localhost:5000**

### Windows (Lenovo 5 Desktop)
```powershell
# 1. Install Node.js from https://nodejs.org (LTS version)
# 2. Open PowerShell or CMD in the saturn-ai folder

cd saturn-ai
npm install
npm run db:push
npm run dev
```
Then open → **http://localhost:5000**

---

## Add LLM Providers (Settings → LLM Config)

### Option A — Ollama (Local / Offline)
```bash
# Install Ollama: https://ollama.ai
ollama pull llama3        # 8B model (4GB VRAM)
ollama pull mistral       # 7B model (4GB VRAM)
ollama pull codellama     # Code-focused (your RTX 4060 handles 13B+)
```
Default URL: `http://localhost:11434`

### Option B — OpenAI
1. Get key at https://platform.openai.com/api-keys
2. Paste in Settings → LLM Config → OpenAI panel

### Option C — Anthropic (Claude)
1. Get key at https://console.anthropic.com
2. Paste in Settings → LLM Config → Anthropic panel

### Option D — Google Gemini
1. Get key at https://aistudio.google.com/app/apikey
2. Paste in Settings → LLM Config → Gemini panel

### Environment File (Advanced)
Download the `.env` template from Settings → LLM Config → Download .env Template.
Place `.env` in the `saturn-ai/` folder. Saturn reads it on startup.

---

## Production Mode
```bash
npm run build
NODE_ENV=production node dist/index.cjs
```

---

## LLM Priority Order
Ollama (local) → OpenAI → Anthropic → Gemini → Offline KB

If no LLM is configured, Saturn answers NED-specific questions from its built-in Offline Knowledge Base.

---

## Modules

| Module | Path | Description |
|---|---|---|
| Command Center | `/` | Dashboard + LLM health status |
| Proposal Engine | `/proposals` | NED proposal generator |
| Pricing & Scope | `/pricing` | Service pricing calculator |
| Projects | `/projects` | Project tracker |
| Workflow | `/workflow` | Task & workflow manager |
| Meeting Notes | `/meetings` | Meeting transcripts + AI summary |
| Document Q&A | `/documents` | Upload docs, ask questions |
| Integrations | `/integrations` | Adobe, Shopify, SketchUp connectors |
| Settings | `/settings` | LLM config, .env, system info |

---

## Folder Structure
```
saturn-ai/
├── client/          # React frontend (Vite + Tailwind + shadcn/ui)
├── server/          # Express backend
│   ├── llm.ts       # LLM router (Ollama→OpenAI→Anthropic→Gemini→Offline)
│   ├── config.ts    # Environment config reader
│   ├── routes.ts    # API routes
│   └── integrations.ts  # Adobe, Shopify, SketchUp integrations
├── shared/          # Shared types + schema
├── saturn.db        # SQLite database (auto-created)
└── INSTALL.md       # This file
```

---

## Upgrading Saturn
Replace the `client/` and `server/` folders with updated versions.
Run `npm install && npm run db:push && npm run build`.
Your `saturn.db` data is preserved.

---

## Support
New Era Designs — chris@neweradesigns.co
