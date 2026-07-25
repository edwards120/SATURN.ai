import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Cpu, Zap, Globe, Settings2, Package, CheckCircle2,
  AlertCircle, XCircle, RefreshCw, ExternalLink, Download,
  Database, Server, Monitor, Palette, Code2, FileText, WifiOff
} from "lucide-react";

// Module registry — all Saturn V1 modules
const MODULES = [
  { id: "command-center", name: "Command Center", desc: "Daily brief, quick prompt, system status", icon: Zap, status: "active", version: "1.0.0" },
  { id: "proposal-engine", name: "Proposal Engine", desc: "NED template-based proposal generator", icon: FileText, status: "active", version: "1.0.0" },
  { id: "pricing-scope", name: "Pricing + Scope", desc: "Fee schedule, scope calculator", icon: Package, status: "active", version: "1.0.0" },
  { id: "document-qa", name: "Document Q&A", desc: "Saturn knowledge base, keyword search", icon: Database, status: "active", version: "1.0.0" },
  { id: "projects", name: "Project Memory", desc: "Active project tracking with phases", icon: Monitor, status: "active", version: "1.0.0" },
  { id: "workflow-tracker", name: "Workflow Tracker", desc: "5-app production pipeline", icon: Code2, status: "active", version: "1.0.0" },
  { id: "meeting-notes", name: "Meeting Notes", desc: "Raw notes → structured actions", icon: FileText, status: "active", version: "1.0.0" },
  { id: "client-portal", name: "Client Portal", desc: "Approval workflows, client-facing views", icon: Globe, status: "v2", version: "—" },
  { id: "invoice-engine", name: "Invoice Engine", desc: "Automated invoicing from proposals", icon: Package, status: "v2", version: "—" },
  { id: "asset-library", name: "Asset Library", desc: "Brand file organization and versioning", icon: Palette, status: "v2", version: "—" },
];

// LLM model options
const LLM_MODELS = [
  { id: "llama3", name: "Llama 3 (8B)", desc: "Fast, general purpose. Good for most tasks.", tier: "local" },
  { id: "llama3-70b", name: "Llama 3 (70B)", desc: "High capability. Requires more VRAM.", tier: "local" },
  { id: "mistral", name: "Mistral 7B", desc: "Efficient, strong reasoning.", tier: "local" },
  { id: "codellama", name: "CodeLlama", desc: "Optimized for code generation.", tier: "local" },
  { id: "gpt4o", name: "GPT-4o", desc: "OpenAI API. Requires API key.", tier: "api" },
  { id: "claude3", name: "Claude 3.5 Sonnet", desc: "Anthropic API. Requires API key.", tier: "api" },
];

// Integration tiles
const INTEGRATIONS = [
  { id: "google-drive", name: "Google Drive", desc: "Sync assets and deliverables", connected: false, icon: "🗂️" },
  { id: "google-cal", name: "Google Calendar", desc: "Sync meetings and deadlines", connected: false, icon: "📅" },
  { id: "slack", name: "Slack", desc: "Notifications and client comms", connected: false, icon: "💬" },
  { id: "quickbooks", name: "QuickBooks", desc: "Sync invoices and payments", connected: false, icon: "💰" },
  { id: "notion", name: "Notion", desc: "Sync project documentation", connected: false, icon: "📝" },
  { id: "figma", name: "Figma", desc: "Design file access", connected: false, icon: "🎨" },
];

const statusColors = {
  active: "text-green-400 bg-green-500/10 border-green-500/20",
  v2: "text-[var(--saturn-faint)] bg-white/5 border-white/10",
  disabled: "text-red-400 bg-red-500/10 border-red-500/20",
};

type PingStatus = "idle" | "checking" | "ok" | "error";

interface ProviderConfig {
  id: string;
  label: string;
  icon: typeof Cpu;
  desc: string;
  urlField?: { label: string; placeholder: string; default: string };
  keyField?: { label: string; placeholder: string; envVar: string };
  modelField?: { label: string; options: string[] };
  docsUrl: string;
  alwaysOn?: boolean;
}

const PROVIDERS: ProviderConfig[] = [
  {
    id: "ollama",
    label: "Ollama (Local)",
    icon: Cpu,
    desc: "Run AI models on your RTX 4060 — zero cost, full privacy, offline capable.",
    urlField: { label: "Ollama URL", placeholder: "http://localhost:11434", default: "http://localhost:11434" },
    modelField: { label: "Model", options: ["llama3", "llama3:70b", "mistral", "codellama", "llama3.2", "phi3"] },
    docsUrl: "https://ollama.com",
  },
  {
    id: "openai",
    label: "OpenAI",
    icon: Globe,
    desc: "GPT-4o for complex reasoning, long-form writing, and nuanced proposals.",
    keyField: { label: "API Key", placeholder: "sk-...", envVar: "OPENAI_API_KEY" },
    modelField: { label: "Model", options: ["gpt-4o", "gpt-4-turbo", "gpt-4o-mini", "gpt-3.5-turbo"] },
    docsUrl: "https://platform.openai.com/api-keys",
  },
  {
    id: "anthropic",
    label: "Anthropic",
    icon: Globe,
    desc: "Claude 3.5 Sonnet for contracts, structured writing, and careful analysis.",
    keyField: { label: "API Key", placeholder: "sk-ant-...", envVar: "ANTHROPIC_API_KEY" },
    modelField: { label: "Model", options: ["claude-3-5-sonnet-20241022", "claude-3-haiku-20240307", "claude-3-opus-20240229"] },
    docsUrl: "https://console.anthropic.com/settings/keys",
  },
  {
    id: "gemini",
    label: "Google Gemini",
    icon: Globe,
    desc: "Gemini 1.5 Flash for fast turnaround, creative ideation, and multimodal tasks.",
    keyField: { label: "API Key", placeholder: "AIza...", envVar: "GEMINI_API_KEY" },
    modelField: { label: "Model", options: ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash"] },
    docsUrl: "https://aistudio.google.com/app/apikey",
  },
  {
    id: "offline",
    label: "Offline KB",
    icon: WifiOff,
    desc: "Always-on NED knowledge base — proposals, pricing, ADA specs, 13-step process. Zero config.",
    docsUrl: "",
    alwaysOn: true,
  },
];

function ProviderPanel({ config }: { config: ProviderConfig }) {
  const [url, setUrl] = useState(config.urlField?.default || "");
  const [key, setKey] = useState("");
  const [model, setModel] = useState(config.modelField?.options[0] || "");
  const [enabled, setEnabled] = useState(config.id === "offline");
  const [pingStatus, setPingStatus] = useState<PingStatus>("idle");
  const Icon = config.icon;

  const ping = async () => {
    setPingStatus("checking");
    try {
      const body: Record<string, string> = { provider: config.id };
      if (url) body.url = url;
      if (key) body.key = key;
      if (model) body.model = model;
      const res = await apiRequest("POST", "/api/llm/health", body);
      const data = await res.json();
      setPingStatus(data.status === "ok" ? "ok" : "error");
    } catch {
      setPingStatus("error");
    }
  };

  const downloadEnvTemplate = async () => {
    const res = await apiRequest("GET", "/api/config/env-template");
    const text = await res.text();
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = ".env.template";
    a.click();
  };

  return (
    <div className="saturn-card p-5 space-y-4" data-testid={`provider-panel-${config.id}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(252,163,17,0.1)", border: "1px solid rgba(252,163,17,0.15)" }}>
            <Icon size={14} style={{ color: "#FCA311" }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: "#E8EFF8" }}>{config.label}</h3>
            <p className="text-[10px] mt-0.5" style={{ color: "#4a5a7a" }}>
              {config.alwaysOn ? "Priority 5 · Always active" : `Priority ${PROVIDERS.findIndex(p => p.id === config.id) + 1} in routing order`}
            </p>
          </div>
        </div>
        {config.alwaysOn ? (
          <Badge variant="outline" className="text-[9px] border-green-500/30 text-green-400">Always On</Badge>
        ) : (
          <Switch checked={enabled} onCheckedChange={setEnabled}
            data-testid={`toggle-${config.id}`}
            className="data-[state=checked]:bg-amber-500" />
        )}
      </div>

      <p className="text-[11px]" style={{ color: "#8899bb" }}>{config.desc}</p>

      {!config.alwaysOn && (
        <div className="space-y-3">
          {/* URL field (Ollama only) */}
          {config.urlField && (
            <div>
              <label className="text-[10px] uppercase tracking-wider mb-1 block" style={{ color: "#4a5a7a" }}>
                {config.urlField.label}
              </label>
              <Input
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder={config.urlField.placeholder}
                disabled={!enabled}
                data-testid={`input-${config.id}-url`}
                className="saturn-input font-mono text-xs"
              />
            </div>
          )}

          {/* API key field */}
          {config.keyField && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] uppercase tracking-wider" style={{ color: "#4a5a7a" }}>
                  {config.keyField.label}
                </label>
                <span className="text-[9px] font-mono" style={{ color: "#2e3f66" }}>
                  env: {config.keyField.envVar}
                </span>
              </div>
              <Input
                type="password"
                value={key}
                onChange={e => setKey(e.target.value)}
                placeholder={config.keyField.placeholder}
                disabled={!enabled}
                data-testid={`input-${config.id}-key`}
                className="saturn-input font-mono text-xs"
              />
            </div>
          )}

          {/* Model selector */}
          {config.modelField && (
            <div>
              <label className="text-[10px] uppercase tracking-wider mb-1 block" style={{ color: "#4a5a7a" }}>
                {config.modelField.label}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {config.modelField.options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => enabled && setModel(opt)}
                    disabled={!enabled}
                    data-testid={`model-${config.id}-${opt}`}
                    className="px-2.5 py-1 rounded text-[10px] font-mono transition-all"
                    style={{
                      background: model === opt && enabled ? "rgba(252,163,17,0.15)" : "rgba(255,255,255,0.04)",
                      border: model === opt && enabled ? "1px solid rgba(252,163,17,0.4)" : "1px solid rgba(255,255,255,0.08)",
                      color: model === opt && enabled ? "#FCA311" : "#8899bb",
                      cursor: enabled ? "pointer" : "not-allowed",
                      opacity: enabled ? 1 : 0.5,
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ping test + docs */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <Button
                onClick={ping}
                disabled={!enabled || pingStatus === "checking"}
                variant="outline"
                size="sm"
                data-testid={`btn-ping-${config.id}`}
                className="h-7 text-[10px] border-white/15 text-[var(--saturn-muted)] hover:text-[var(--saturn-text)] gap-1"
              >
                <RefreshCw size={10} className={pingStatus === "checking" ? "animate-spin" : ""} />
                Test Connection
              </Button>
              {pingStatus !== "idle" && (
                <div className={`flex items-center gap-1 text-[10px] ${
                  pingStatus === "ok" ? "text-green-400" : pingStatus === "error" ? "text-red-400" : "text-amber-400"
                }`}>
                  {pingStatus === "ok" ? <CheckCircle2 size={10} /> : pingStatus === "error" ? <XCircle size={10} /> : <RefreshCw size={10} className="animate-spin" />}
                  {pingStatus === "ok" ? "Connected" : pingStatus === "error" ? "Unreachable" : "Checking..."}
                </div>
              )}
            </div>
            {config.docsUrl && (
              <a href={config.docsUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] transition-colors"
                style={{ color: "#4a5a7a" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#FCA311")}
                onMouseLeave={e => (e.currentTarget.style.color = "#4a5a7a")}
              >
                <ExternalLink size={9} /> Get key
              </a>
            )}
          </div>
        </div>
      )}

      {/* Offline KB — special block */}
      {config.alwaysOn && (
        <div className="grid grid-cols-2 gap-2">
          {["NED Proposals", "Pricing Ranges", "ADA Specs", "13-Step Process", "5-App Pipeline", "File Naming"].map(topic => (
            <div key={topic} className="flex items-center gap-2 px-2 py-1.5 rounded"
              style={{ background: "rgba(68,200,120,0.05)", border: "1px solid rgba(68,200,120,0.12)" }}>
              <CheckCircle2 size={10} className="text-green-400 flex-shrink-0" />
              <span style={{ fontSize: "10px", color: "#8899bb" }}>{topic}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Settings() {
  const [systemPrompt, setSystemPrompt] = useState(
    `You are Saturn, the internal operating assistant for New Era Designs. You are concise, premium, technical, controlled, direct, and systems-oriented. Not a hype machine. Chris is the creative director. Your job is to support precision decisions, surface the right information, and keep NED moving at speed.`
  );
  const [activeTab, setActiveTab] = useState<"llm" | "modules" | "integrations" | "identity">("llm");

  const { data: configInfo } = useQuery({
    queryKey: ["/api/config/info"],
    queryFn: () => apiRequest("GET", "/api/config/info").then(r => r.json()),
  });

  const downloadEnvTemplate = async () => {
    const res = await apiRequest("GET", "/api/config/env-template");
    const text = await res.text();
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = ".env.template";
    a.click();
  };

  const tabs = [
    { id: "llm", label: "LLM Config", icon: Cpu },
    { id: "modules", label: "Modules", icon: Package },
    { id: "integrations", label: "Integrations", icon: Globe },
    { id: "identity", label: "Identity", icon: Settings2 },
  ] as const;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[var(--saturn-text)] tracking-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          System Settings
        </h1>
        <p className="text-xs text-[var(--saturn-muted)] mt-0.5">Configure Saturn AI — model, modules, integrations, identity</p>
      </div>

      {/* Tab Nav */}
      <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg border border-white/8 w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            data-testid={`tab-${id}`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
              activeTab === id
                ? "bg-[var(--saturn-amber)] text-[var(--saturn-deep)] shadow-sm"
                : "text-[var(--saturn-muted)] hover:text-[var(--saturn-text)]"
            }`}
          >
            <Icon size={11} />
            {label}
          </button>
        ))}
      </div>

      {/* LLM Config Tab */}
      {activeTab === "llm" && (
        <div className="space-y-4">
          {/* Routing order explainer */}
          <div className="px-4 py-3 rounded-lg flex items-center gap-3"
            style={{ background: "rgba(252,163,17,0.05)", border: "1px solid rgba(252,163,17,0.12)" }}>
            <Zap size={12} style={{ color: "#FCA311", flexShrink: 0 }} />
            <p className="text-[11px]" style={{ color: "#8899bb", lineHeight: 1.5 }}>
              Saturn routes every prompt through this waterfall: <span style={{ color: "#FCA311", fontWeight: 700 }}>Ollama → OpenAI → Anthropic → Gemini → Offline KB</span>.
              Enable providers in priority order. Saturn skips any unconfigured or unreachable provider automatically.
            </p>
          </div>

          {/* Provider panels */}
          {PROVIDERS.map(p => <ProviderPanel key={p.id} config={p} />)}

          {/* .env template download */}
          <div className="saturn-card p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium" style={{ color: "#E8EFF8" }}>.env Configuration File</p>
              <p className="text-[10px] mt-0.5" style={{ color: "#4a5a7a" }}>
                Download a pre-filled template for your saturn-ai/ root folder.
                API keys in this file load automatically on server startup.
              </p>
            </div>
            <Button
              onClick={downloadEnvTemplate}
              variant="outline"
              size="sm"
              data-testid="btn-download-env"
              className="flex items-center gap-1.5 text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10 flex-shrink-0 ml-4"
            >
              <Download size={11} />
              .env Template
            </Button>
          </div>

          {/* Hardware card */}
          <div className="saturn-card p-4 flex items-center gap-4">
            <Monitor size={20} className="text-[var(--saturn-amber)] flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-medium text-[var(--saturn-text)]">Your Hardware</p>
              <p className="text-[10px] text-[var(--saturn-muted)] mt-0.5">Windows Lenovo 5 Desktop · RTX 4060 · 32GB RAM</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-green-400">Ollama-capable</p>
              <p className="text-[10px] text-[var(--saturn-faint)]">8B–13B models recommended</p>
            </div>
          </div>
        </div>
      )}

      {/* Modules Tab */}
      {activeTab === "modules" && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {MODULES.map(mod => {
              const Icon = mod.icon;
              const statusClass = statusColors[mod.status as keyof typeof statusColors] || statusColors.v2;
              return (
                <div key={mod.id} className="saturn-card p-4 flex items-start gap-3" data-testid={`module-${mod.id}`}>
                  <div className="w-8 h-8 rounded-lg bg-[var(--saturn-amber)]/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-[var(--saturn-amber)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-[var(--saturn-text)]">{mod.name}</p>
                      <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${statusClass}`}>
                        {mod.status === "active" ? "V1" : "V2"}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-[var(--saturn-muted)] mt-0.5">{mod.desc}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {mod.status === "active" ? (
                      <CheckCircle2 size={14} className="text-green-400" />
                    ) : (
                      <AlertCircle size={14} className="text-[var(--saturn-faint)]" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-[var(--saturn-faint)] text-center pt-2">
            V2 modules scheduled for next build cycle. Architecture is already wired.
          </p>
        </div>
      )}

      {/* Integrations Tab */}
      {activeTab === "integrations" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {INTEGRATIONS.map(int => (
            <div key={int.id} className="saturn-card p-4 flex items-center gap-3" data-testid={`integration-${int.id}`}>
              <span className="text-2xl">{int.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[var(--saturn-text)]">{int.name}</p>
                <p className="text-[10px] text-[var(--saturn-muted)]">{int.desc}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                data-testid={`btn-connect-${int.id}`}
                className="text-[10px] h-7 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 flex-shrink-0"
              >
                Connect
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Identity Tab */}
      {activeTab === "identity" && (
        <div className="space-y-4">
          {/* System Identity */}
          <div className="saturn-card p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-[var(--saturn-text)] mb-0.5">Saturn System Prompt</h3>
              <p className="text-[10px] text-[var(--saturn-muted)]">Defines Saturn's voice, role, and operating posture across all LLM calls</p>
            </div>
            <textarea
              value={systemPrompt}
              onChange={e => setSystemPrompt(e.target.value)}
              data-testid="textarea-system-prompt"
              className="w-full min-h-[120px] bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-[var(--saturn-text)] outline-none focus:border-amber-500/40 resize-none font-mono leading-relaxed"
            />
            <Button className="saturn-btn-primary text-xs h-8" data-testid="btn-save-prompt">Save Prompt</Button>
          </div>

          {/* NED Identity Card */}
          <div className="saturn-card p-5 space-y-3">
            <h3 className="text-sm font-semibold text-[var(--saturn-text)]">New Era Designs Identity</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
              {[
                ["Studio", "New Era Designs LLC"],
                ["Director", "Chris Edwards"],
                ["Location", "Missouri City, TX / Houston Area"],
                ["Phone", "281-698-7954"],
                ["Email", "chris@neweradesigns.co"],
                ["Website", "neweradesigns.co"],
                ["Proposal Format", "NED-0001, NED-0002..."],
                ["File Naming", "[CLIENT]_[PROJECT]_[PHASE]_[VER]"],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-col">
                  <span className="text-[10px] text-[var(--saturn-faint)] uppercase tracking-wider">{label}</span>
                  <span className="text-[var(--saturn-text)] text-xs mt-0.5">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Brand Colors */}
          <div className="saturn-card p-5">
            <h3 className="text-sm font-semibold text-[var(--saturn-text)] mb-3">Brand Palette</h3>
            <div className="flex gap-3">
              {[
                { name: "Navy", hex: "#16213A" },
                { name: "Deep", hex: "#0d1526" },
                { name: "Amber", hex: "#FCA311" },
                { name: "Muted", hex: "#8899bb" },
                { name: "Text", hex: "#E8EFF8" },
              ].map(({ name, hex }) => (
                <div key={name} className="flex flex-col items-center gap-1.5">
                  <div
                    className="w-10 h-10 rounded-lg border border-white/10"
                    style={{ backgroundColor: hex }}
                  />
                  <span className="text-[9px] text-[var(--saturn-faint)] uppercase tracking-wide">{name}</span>
                  <span className="text-[9px] font-mono text-[var(--saturn-muted)]">{hex}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Version Info */}
          <div className="saturn-card p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[var(--saturn-text)]">Saturn AI</p>
              <p className="text-[10px] text-[var(--saturn-muted)]">Operating System for New Era Designs</p>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-[10px]">V1.0.0</Badge>
              <p className="text-[10px] text-[var(--saturn-faint)] mt-1">Built with Perplexity Computer</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
