import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Zap, FolderOpen, FileText, Clock,
  AlertCircle, CheckCircle2, Send, RefreshCw,
  Cpu, Globe, Wifi, WifiOff
} from "lucide-react";

// Sagittarius archer SVG — NED brand mark, contained within header
const SagittariusArcher = () => (
  <svg viewBox="0 0 180 220" width="88" height="108" className="select-none pointer-events-none" style={{ opacity: 0.07 }} aria-hidden>
    <g fill="#FCA311">
      <ellipse cx="85" cy="38" rx="12" ry="14"/>
      <rect x="70" y="52" width="28" height="60" rx="8"/>
      <rect x="40" y="75" width="35" height="5" rx="2" transform="rotate(-15 40 75)"/>
      <rect x="98" y="70" width="40" height="5" rx="2" transform="rotate(8 98 70)"/>
      <path d="M38 55 Q20 90 40 125" stroke="#FCA311" strokeWidth="4" fill="none"/>
      <line x1="38" y1="55" x2="40" y2="125" stroke="#FCA311" strokeWidth="1.5" opacity="0.6"/>
      <rect x="100" y="71" width="52" height="3" rx="1.5"/>
      <polygon points="152,70 160,72.5 152,75"/>
      <rect x="72" y="108" width="14" height="55" rx="6" transform="rotate(-5 72 108)"/>
      <rect x="84" y="108" width="14" height="55" rx="6" transform="rotate(8 84 108)"/>
    </g>
  </svg>
);

const QUICK_PROMPTS = [
  "Draft a proposal for a retail wayfinding project",
  "What's the standard fee for a multi-tenant signage system?",
  "Create a scope of work for a gym environmental graphics project",
  "Summarize the NED process from discovery to closeout",
  "What ADA requirements apply to interior directional signs?",
  "Generate a project brief for a CRE portfolio client",
];

const STATS = [
  { label: "Active Projects", value: "0", icon: FolderOpen, color: "#FCA311" },
  { label: "Open Proposals", value: "0", icon: FileText, color: "#5b9bd5" },
  { label: "Pending Tasks", value: "0", icon: AlertCircle, color: "#ff643c" },
  { label: "Completed This Month", value: "0", icon: CheckCircle2, color: "#44c878" },
];

// ── LLM Health Widget ──────────────────────────────────────────────────────
interface ProviderHealth {
  provider: string;
  status: "ok" | "error" | "unconfigured";
  latency?: number;
  model?: string;
}

const PROVIDER_META: Record<string, { label: string; desc: string; icon: typeof Cpu }> = {
  ollama: { label: "Ollama", desc: "Local · localhost:11434", icon: Cpu },
  openai: { label: "OpenAI", desc: "GPT-4o · API key required", icon: Globe },
  anthropic: { label: "Anthropic", desc: "Claude 3.5 · API key required", icon: Globe },
  gemini: { label: "Gemini", desc: "1.5 Flash · API key required", icon: Globe },
  offline: { label: "Offline KB", desc: "Always available · NED knowledge", icon: WifiOff },
};

function LLMHealthWidget() {
  const { data, isLoading, refetch, isRefetching } = useQuery<ProviderHealth[]>({
    queryKey: ["/api/llm/health"],
    queryFn: () => apiRequest("GET", "/api/llm/health").then(r => r.json()),
    refetchInterval: 30_000,
    staleTime: 20_000,
  });

  const providers = data || [];

  const statusDot = (s: string) => {
    if (s === "ok") return "#44c878";
    if (s === "error") return "#ff643c";
    return "#4a5a7a"; // unconfigured
  };

  const statusText = (s: string) => {
    if (s === "ok") return "online";
    if (s === "error") return "unreachable";
    return "not configured";
  };

  return (
    <div className="saturn-card p-5" data-testid="llm-health-widget">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wifi size={14} style={{ color: "#FCA311" }} />
          <span className="saturn-label">LLM PROVIDER HEALTH</span>
        </div>
        <button
          onClick={() => refetch()}
          data-testid="btn-refresh-health"
          className="flex items-center gap-1 text-xs transition-colors"
          style={{ color: "#4a5a7a", background: "none", border: "none", cursor: "pointer" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#FCA311")}
          onMouseLeave={e => (e.currentTarget.style.color = "#4a5a7a")}
        >
          <RefreshCw size={11} className={isRefetching ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-10 rounded-lg animate-pulse" style={{ background: "#16213A" }} />
          ))}
        </div>
      ) : providers.length === 0 ? (
        <div className="py-4 text-center" style={{ color: "#4a5a7a", fontSize: "12px" }}>
          Health data unavailable. Start the Saturn server.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {providers.map((p) => {
            const meta = PROVIDER_META[p.provider] || { label: p.provider, desc: "", icon: Globe };
            const color = statusDot(p.status);
            return (
              <div key={p.provider}
                data-testid={`health-row-${p.provider}`}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg"
                style={{ background: "#16213A", border: `1px solid ${p.status === "ok" ? "rgba(68,200,120,0.15)" : "#1e2d4d"}` }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: color, boxShadow: p.status === "ok" ? `0 0 6px ${color}` : "none" }} />
                  <div>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: p.status === "ok" ? "#fff" : "#8899bb" }}>
                      {meta.label}
                    </span>
                    {p.model && (
                      <span style={{ fontSize: "10px", color: "#4a5a7a", marginLeft: "6px" }}>{p.model}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {p.latency !== undefined && p.status === "ok" && (
                    <span style={{ fontSize: "10px", color: "#4a5a7a", fontFamily: "monospace" }}>
                      {p.latency}ms
                    </span>
                  )}
                  <span style={{ fontSize: "10px", color, fontWeight: 600, letterSpacing: "0.04em" }}>
                    {statusText(p.status)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <a href="#/settings" className="block mt-4 text-center text-xs font-bold py-2 rounded-lg transition-all"
        style={{ background: "rgba(252,163,17,0.08)", color: "#FCA311", border: "1px solid rgba(252,163,17,0.18)" }}>
        Configure Providers →
      </a>
    </div>
  );
}

export default function CommandCenter() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: projects } = useQuery({
    queryKey: ["/api/projects"],
    queryFn: () => apiRequest("GET", "/api/projects").then(r => r.json()),
  });

  const { data: tasks } = useQuery({
    queryKey: ["/api/tasks"],
    queryFn: () => apiRequest("GET", "/api/tasks").then(r => r.json()),
  });

  const { data: proposals } = useQuery({
    queryKey: ["/api/proposals"],
    queryFn: () => apiRequest("GET", "/api/proposals").then(r => r.json()),
  });

  const activeProjects = Array.isArray(projects) ? projects.filter((p: any) => p.status === "active" || p.status === "in-progress") : [];
  const pendingTasks = Array.isArray(tasks) ? tasks.filter((t: any) => t.status === "pending") : [];
  const openProposals = Array.isArray(proposals) ? proposals.filter((p: any) => p.status === "draft" || p.status === "sent") : [];

  const stats = [
    { label: "Active Projects", value: activeProjects.length, icon: FolderOpen, color: "#FCA311" },
    { label: "Open Proposals", value: openProposals.length, icon: FileText, color: "#5b9bd5" },
    { label: "Pending Tasks", value: pendingTasks.length, icon: AlertCircle, color: "#ff643c" },
    { label: "Completed", value: 0, icon: CheckCircle2, color: "#44c878" },
  ];

  const handleSend = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResponse("");
    try {
      const res = await apiRequest("POST", "/api/saturn/prompt", { prompt });
      const data = await res.json();
      setResponse(data.response || data.message || "Saturn processed your request.");
    } catch {
      setResponse("Saturn V1 is ready. Connect your local Ollama instance in Settings to enable AI responses. In the meantime, use the modules below for proposals, pricing, and project management.");
    }
    setLoading(false);
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="p-6 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex-1">
          <div className="saturn-label mb-1">COMMAND CENTER</div>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(28px, 3vw, 42px)",
            fontWeight: 700, color: "#fff", lineHeight: 1.1
          }}>
            Good {now.getHours() < 12 ? "Morning" : now.getHours() < 18 ? "Afternoon" : "Evening"}, Chris.
          </h1>
          <p style={{ color: "#8899bb", fontSize: "14px", marginTop: "6px" }}>{dateStr} · {timeStr}</p>
        </div>
        <div className="hidden lg:flex items-end overflow-hidden" style={{ width: 88, height: 90, marginBottom: "-8px", flexShrink: 0 }}>
          <SagittariusArcher />
        </div>
      </div>

      <div className="saturn-rule mb-8" />

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="saturn-card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="saturn-label">{label}</span>
              <Icon size={16} style={{ color }} />
            </div>
            <div style={{ fontSize: "32px", fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Saturn Prompt — left, wide */}
        <div className="lg:col-span-3 flex flex-col gap-6">

          {/* Prompt Input */}
          <div className="saturn-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={16} style={{ color: "#FCA311" }} />
              <span className="saturn-label">SATURN PROMPT</span>
            </div>
            <textarea
              data-testid="saturn-prompt-input"
              rows={3}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Ask Saturn anything about proposals, pricing, ADA specs, project workflow, client briefs..."
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              className="w-full rounded-lg p-3 text-sm resize-none mb-3"
              style={{
                background: "#16213A", border: "1px solid #1e2d4d",
                color: "#fff", fontFamily: "'Lato', sans-serif", lineHeight: 1.6,
              }}
            />
            <div className="flex items-center justify-between">
              <span style={{ fontSize: "11px", color: "#4a5a7a" }}>Shift+Enter for new line · Enter to send</span>
              <button
                data-testid="saturn-send-btn"
                onClick={handleSend}
                disabled={loading || !prompt.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all"
                style={{
                  background: loading || !prompt.trim() ? "#1e2d4d" : "#FCA311",
                  color: loading || !prompt.trim() ? "#4a5a7a" : "#0d1526",
                  cursor: loading || !prompt.trim() ? "not-allowed" : "pointer",
                }}
              >
                {loading ? (
                  <span className="animate-spin">◌</span>
                ) : (
                  <Send size={14} />
                )}
                {loading ? "Processing..." : "Ask Saturn"}
              </button>
            </div>

            {/* Response */}
            {response && (
              <div className="mt-4 p-4 rounded-lg" style={{ background: "rgba(252,163,17,0.06)", border: "1px solid rgba(252,163,17,0.15)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#FCA311" }}>
                    <span style={{ fontSize: "9px", fontWeight: 900, color: "#0d1526" }}>S</span>
                  </div>
                  <span className="saturn-label">SATURN RESPONSE</span>
                </div>
                <p style={{ fontSize: "13px", color: "#ccd5e8", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{response}</p>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="saturn-card p-5">
            <div className="saturn-label mb-4">QUICK ACTIONS</div>
            <div className="grid grid-cols-1 gap-2">
              {QUICK_PROMPTS.map(q => (
                <button
                  key={q}
                  onClick={() => { setPrompt(q); }}
                  className="text-left px-3 py-2.5 rounded-lg text-sm transition-all"
                  style={{
                    background: "#16213A", border: "1px solid #1e2d4d",
                    color: "#8899bb", fontSize: "12px",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(252,163,17,0.3)";
                    (e.currentTarget as HTMLElement).style.color = "#fff";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "#1e2d4d";
                    (e.currentTarget as HTMLElement).style.color = "#8899bb";
                  }}
                >
                  <span style={{ color: "#FCA311", marginRight: "8px" }}>→</span>{q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Active Projects */}
          <div className="saturn-card p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="saturn-label">ACTIVE PROJECTS</span>
              <a href="#/projects" style={{ fontSize: "11px", color: "#FCA311" }}>View All →</a>
            </div>
            {activeProjects.length === 0 ? (
              <div className="py-6 text-center">
                <FolderOpen size={24} style={{ color: "#2e3f66", margin: "0 auto 8px" }} />
                <p style={{ fontSize: "12px", color: "#4a5a7a" }}>No active projects.<br />Start one from Projects.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {activeProjects.slice(0, 4).map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-lg"
                    style={{ background: "#16213A", border: "1px solid #1e2d4d" }}>
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>{p.name}</p>
                      <p style={{ fontSize: "11px", color: "#8899bb" }}>{p.client}</p>
                    </div>
                    <span className={`status-active px-2 py-0.5 rounded text-xs font-bold`}>{p.phase}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Tasks */}
          <div className="saturn-card p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="saturn-label">PENDING TASKS</span>
              <Clock size={14} style={{ color: "#4a5a7a" }} />
            </div>
            {pendingTasks.length === 0 ? (
              <div className="py-6 text-center">
                <CheckCircle2 size={24} style={{ color: "#2e3f66", margin: "0 auto 8px" }} />
                <p style={{ fontSize: "12px", color: "#4a5a7a" }}>All clear. No pending tasks.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {pendingTasks.slice(0, 5).map((t: any) => (
                  <div key={t.id} className="flex items-start gap-3 p-3 rounded-lg"
                    style={{ background: "#16213A", border: "1px solid #1e2d4d" }}>
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                      style={{ background: t.priority === "high" ? "#ff643c" : t.priority === "medium" ? "#FCA311" : "#8899bb" }} />
                    <div>
                      <p style={{ fontSize: "13px", color: "#fff" }}>{t.title}</p>
                      {t.dueDate && <p style={{ fontSize: "11px", color: "#4a5a7a" }}>Due {t.dueDate}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* LLM Health Widget */}
          <LLMHealthWidget />

        </div>
      </div>
    </div>
  );
}
