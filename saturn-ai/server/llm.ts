/**
 * Saturn AI — LLM Router
 * ─────────────────────────────────────────────────────────────────
 * Priority order:
 *   1. Ollama (local, offline-capable) — preferred
 *   2. OpenAI GPT-4o
 *   3. Anthropic Claude
 *   4. Google Gemini
 *   5. Offline fallback — deterministic Saturn responses, no LLM needed
 *
 * The router tries providers in priority order and falls back
 * automatically if one is unavailable. Fully offline? It still works.
 * ─────────────────────────────────────────────────────────────────
 */

export type LLMProvider = "ollama" | "openai" | "anthropic" | "gemini" | "offline";

export interface LLMConfig {
  provider: LLMProvider;
  ollamaUrl: string;
  ollamaModel: string;
  openaiKey: string;
  openaiModel: string;
  anthropicKey: string;
  anthropicModel: string;
  geminiKey: string;
  geminiModel: string;
  systemPrompt: string;
}

export interface LLMResponse {
  text: string;
  provider: LLMProvider;
  model: string;
  offline: boolean;
  latencyMs: number;
}

export interface ProviderStatus {
  provider: LLMProvider;
  available: boolean;
  model: string;
  latencyMs?: number;
  error?: string;
}

// ─── Saturn system identity ───────────────────────────────────────────────────
const DEFAULT_SYSTEM_PROMPT = `You are Saturn, the internal operating assistant for New Era Designs LLC.
You are concise, premium, technical, controlled, direct, and systems-oriented. Not a hype machine.
Chris Edwards is the creative director. NED specializes in environmental graphics, wayfinding, signage, brand systems, and ADA-compliant design.
Your job: support precision decisions, surface the right information, draft proposals, calculate fees, and keep NED moving at speed.
Never be vague. Be brief. Be useful.`;

// ─── Offline fallback intelligence ───────────────────────────────────────────
// Saturn can answer NED-specific questions without any LLM when offline
const OFFLINE_KB: Record<string, string> = {
  proposal: `NED Proposal structure: Executive Summary → Business Objective → Visual Scope → Operational Impact → Proposed Scope → Deliverables → Phases (Discovery / Concept / Production) → Fee Schedule → Payment (50% upfront / 50% delivery).`,
  pricing: `NED Fee ranges: Brand Identity $3,500–$8,500 | Wayfinding System $8,000–$25,000 | Environmental Graphics $5,000–$18,000 | Signage Package $4,500–$15,000 | ADA Compliance Audit $2,500–$6,000. Rush: +25%. Revisions beyond 2 rounds: hourly at $125/hr.`,
  process: `NED 13-step process: 1.Discovery 2.Brief 3.Research 4.Concept 5.Presentation 6.Revision 7.Development 8.Production-Ready Files 9.Vendor Coordination 10.Installation Support 11.QA 12.Closeout 13.Archive.`,
  ada: `ADA signage requirements: Braille Grade 2 required on all room IDs. Characters: min 5/8" max 2". Mounting: 60" AFF to centerline. Non-glare finish. 70% contrast minimum. Tactile characters raised 1/32".`,
  workflow: `NED 5-app pipeline: Illustrator (vector/identity) → SketchUp (3D/spatial) → ECDesign (environmental/wayfinding) → Photoshop (compositing/texture) → InDesign (print/proposals).`,
};

function offlineFallback(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes("proposal") || p.includes("scope") || p.includes("brief")) return OFFLINE_KB.proposal;
  if (p.includes("price") || p.includes("fee") || p.includes("cost") || p.includes("rate")) return OFFLINE_KB.pricing;
  if (p.includes("process") || p.includes("step") || p.includes("phase") || p.includes("workflow")) return OFFLINE_KB.process;
  if (p.includes("ada") || p.includes("accessible") || p.includes("braille") || p.includes("signage spec")) return OFFLINE_KB.ada;
  if (p.includes("pipeline") || p.includes("illustrator") || p.includes("sketchup") || p.includes("indesign")) return OFFLINE_KB.workflow;
  return `Saturn is running in offline mode. No LLM connected.\n\nI can answer questions about NED proposals, pricing, process, ADA specs, and workflow from my built-in knowledge base. Connect Ollama locally or add an API key in Settings → LLM Config for full AI responses.\n\nTry asking about: pricing, proposals, ADA requirements, the NED process, or the 5-app workflow.`;
}

// ─── Ollama (local) ───────────────────────────────────────────────────────────
async function callOllama(prompt: string, config: LLMConfig): Promise<string> {
  const res = await fetch(`${config.ollamaUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: config.ollamaModel || "llama3",
      prompt: `${config.systemPrompt || DEFAULT_SYSTEM_PROMPT}\n\nUser: ${prompt}\n\nSaturn:`,
      stream: false,
      options: { temperature: 0.7, num_predict: 1024 },
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
  const data = await res.json() as { response: string };
  return data.response?.trim() || "";
}

// ─── OpenAI ───────────────────────────────────────────────────────────────────
async function callOpenAI(prompt: string, config: LLMConfig): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${config.openaiKey}`,
    },
    body: JSON.stringify({
      model: config.openaiModel || "gpt-4o",
      messages: [
        { role: "system", content: config.systemPrompt || DEFAULT_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      max_tokens: 1024,
      temperature: 0.7,
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}`);
  const data = await res.json() as { choices: { message: { content: string } }[] };
  return data.choices[0]?.message?.content?.trim() || "";
}

// ─── Anthropic Claude ─────────────────────────────────────────────────────────
async function callAnthropic(prompt: string, config: LLMConfig): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.anthropicKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: config.anthropicModel || "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      system: config.systemPrompt || DEFAULT_SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`Anthropic HTTP ${res.status}`);
  const data = await res.json() as { content: { text: string }[] };
  return data.content[0]?.text?.trim() || "";
}

// ─── Google Gemini ────────────────────────────────────────────────────────────
async function callGemini(prompt: string, config: LLMConfig): Promise<string> {
  const model = config.geminiModel || "gemini-1.5-flash";
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.geminiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${config.systemPrompt || DEFAULT_SYSTEM_PROMPT}\n\nUser: ${prompt}` }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      }),
      signal: AbortSignal.timeout(30000),
    }
  );
  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
  const data = await res.json() as { candidates: { content: { parts: { text: string }[] } }[] };
  return data.candidates[0]?.content?.parts[0]?.text?.trim() || "";
}

// ─── Health check ─────────────────────────────────────────────────────────────
export async function checkProviderHealth(config: LLMConfig): Promise<ProviderStatus[]> {
  const results: ProviderStatus[] = [];

  // Ollama
  try {
    const t = Date.now();
    const res = await fetch(`${config.ollamaUrl}/api/tags`, { signal: AbortSignal.timeout(3000) });
    results.push({ provider: "ollama", available: res.ok, model: config.ollamaModel, latencyMs: Date.now() - t });
  } catch {
    results.push({ provider: "ollama", available: false, model: config.ollamaModel, error: "Not running" });
  }

  // OpenAI
  results.push({
    provider: "openai",
    available: !!config.openaiKey,
    model: config.openaiModel || "gpt-4o",
    error: config.openaiKey ? undefined : "No API key",
  });

  // Anthropic
  results.push({
    provider: "anthropic",
    available: !!config.anthropicKey,
    model: config.anthropicModel || "claude-3-5-sonnet",
    error: config.anthropicKey ? undefined : "No API key",
  });

  // Gemini
  results.push({
    provider: "gemini",
    available: !!config.geminiKey,
    model: config.geminiModel || "gemini-1.5-flash",
    error: config.geminiKey ? undefined : "No API key",
  });

  // Offline always available
  results.push({ provider: "offline", available: true, model: "Saturn KB", latencyMs: 0 });

  return results;
}

// ─── Main router ──────────────────────────────────────────────────────────────
export async function routePrompt(prompt: string, config: LLMConfig): Promise<LLMResponse> {
  const start = Date.now();

  // Build provider priority list
  const priority: LLMProvider[] = [];

  // Always try local first if configured
  if (config.ollamaUrl) priority.push("ollama");
  if (config.openaiKey) priority.push("openai");
  if (config.anthropicKey) priority.push("anthropic");
  if (config.geminiKey) priority.push("gemini");
  priority.push("offline"); // always last resort

  for (const provider of priority) {
    try {
      let text = "";
      let model = "";

      switch (provider) {
        case "ollama":
          text = await callOllama(prompt, config);
          model = config.ollamaModel || "llama3";
          break;
        case "openai":
          text = await callOpenAI(prompt, config);
          model = config.openaiModel || "gpt-4o";
          break;
        case "anthropic":
          text = await callAnthropic(prompt, config);
          model = config.anthropicModel || "claude-3-5-sonnet";
          break;
        case "gemini":
          text = await callGemini(prompt, config);
          model = config.geminiModel || "gemini-1.5-flash";
          break;
        case "offline":
          text = offlineFallback(prompt);
          model = "Saturn KB (offline)";
          break;
      }

      if (text) {
        return {
          text,
          provider,
          model,
          offline: provider === "offline",
          latencyMs: Date.now() - start,
        };
      }
    } catch (err) {
      // Try next provider
      console.warn(`[Saturn LLM] ${provider} failed:`, err instanceof Error ? err.message : err);
      continue;
    }
  }

  // Should never reach here — offline always works
  return {
    text: offlineFallback(prompt),
    provider: "offline",
    model: "Saturn KB (offline)",
    offline: true,
    latencyMs: Date.now() - start,
  };
}
