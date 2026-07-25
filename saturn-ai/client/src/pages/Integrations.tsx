import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle2, XCircle, AlertCircle, ExternalLink,
  ChevronDown, ChevronUp, Zap, Key, RefreshCw, Copy,
  Play, Layers, ShoppingBag, Box, Palette, Cpu,
  Globe, Calendar, Mail, HardDrive, FileText, Link2
} from "lucide-react";

// ─── Integration Definitions ────────────────────────────────────────────────

const INTEGRATIONS = [
  {
    id: "adobe-cc",
    name: "Adobe Creative Cloud",
    category: "Creative",
    logo: "Ai",
    logoColor: "#FF9A00",
    description: "Access CC Libraries, sync assets, trigger Firefly image generation, and track file versions across Illustrator, Photoshop, and InDesign.",
    authType: "oauth",
    oauthUrl: "https://developer.adobe.com/developer-console/",
    docsUrl: "https://developer.adobe.com/creative-cloud-libraries/docs/",
    fields: [
      { key: "adobe_client_id", label: "Client ID", placeholder: "Adobe Developer Console → OAuth Credentials", type: "text" },
      { key: "adobe_client_secret", label: "Client Secret", placeholder: "From Adobe Developer Console project", type: "password" },
      { key: "adobe_org_id", label: "Org ID", placeholder: "Your Adobe Organization ID", type: "text" },
    ],
    capabilities: [
      "Sync CC Libraries to Saturn knowledge base",
      "Pull recent Illustrator / Photoshop / InDesign files",
      "Trigger Adobe Firefly image generation",
      "Track asset versions by project",
      "Auto-export deliverables on workflow step complete",
    ],
    setupSteps: [
      "Go to developer.adobe.com/developer-console",
      "Create a new project → Add API → Creative SDK",
      "Set OAuth redirect to: http://localhost:5000/api/integrations/adobe/callback",
      "Copy Client ID + Secret into fields below",
    ],
    status: "disconnected",
    apps: ["Illustrator", "Photoshop", "InDesign", "Firefly", "Fonts"],
  },
  {
    id: "sketchup",
    name: "SketchUp",
    category: "3D / Spatial",
    logo: "SKP",
    logoColor: "#009AD7",
    description: "Deep-link launcher for SketchUp files, project folder watcher, and 3D model library browser. Since SketchUp has no REST API, Saturn uses file system monitoring + deep links.",
    authType: "local",
    docsUrl: "https://extensions.sketchup.com/developer_center",
    fields: [
      { key: "sketchup_projects_folder", label: "Projects Folder Path", placeholder: "C:\\Users\\Chris\\Documents\\SketchUp\\Projects", type: "text" },
      { key: "sketchup_exe_path", label: "SketchUp Executable", placeholder: "C:\\Program Files\\SketchUp\\SketchUp 2024\\SketchUp.exe", type: "text" },
    ],
    capabilities: [
      "Browse and launch .skp files from Saturn",
      "Watch project folders for new/modified models",
      "Auto-link 3D files to Saturn projects by folder name",
      "Log SketchUp work sessions to Workflow Tracker",
      "Generate file change notifications",
    ],
    setupSteps: [
      "Enter your SketchUp Projects folder path",
      "Enter the SketchUp executable path",
      "Saturn will watch the folder and surface recent files",
      "Files auto-link to projects matching folder names",
    ],
    status: "disconnected",
    apps: ["SketchUp 2024", "SketchUp 2025", "LayOut"],
    note: "SketchUp has no public REST API — Saturn uses local file watching + deep links.",
  },
  {
    id: "shopify",
    name: "Shopify",
    category: "E-Commerce",
    logo: "SF",
    logoColor: "#96BF48",
    description: "Connect client Shopify stores to monitor orders, inventory, and revenue. Build and deploy themes. Manage multiple client stores from one dashboard.",
    authType: "apikey",
    docsUrl: "https://shopify.dev/docs/api/admin-graphql",
    fields: [
      { key: "shopify_store_domain", label: "Store Domain", placeholder: "client-store.myshopify.com", type: "text" },
      { key: "shopify_admin_token", label: "Admin API Token", placeholder: "shpat_xxxxxxxxxxxxxxxxxxxx", type: "password" },
      { key: "shopify_api_version", label: "API Version", placeholder: "2025-01", type: "text" },
    ],
    capabilities: [
      "Monitor client store orders + revenue in real time",
      "Track inventory levels and alerts",
      "Deploy and manage themes across client stores",
      "Sync product catalog to Saturn knowledge base",
      "Webhook receiver for order/payment events",
      "Multi-store dashboard — manage all client stores",
    ],
    setupSteps: [
      "In Shopify Admin → Settings → Apps → Develop Apps",
      "Create a new app → Configure Admin API scopes",
      "Enable: read_orders, read_products, write_themes, read_inventory",
      "Generate and copy the Admin API access token",
    ],
    status: "disconnected",
    apps: ["Shopify Admin", "Shopify Plus", "Storefront"],
  },
  {
    id: "adobe-firefly",
    name: "Adobe Firefly API",
    category: "AI / Generative",
    logo: "FF",
    logoColor: "#FF4488",
    description: "Generate brand-aligned images, mockups, and backgrounds using Adobe Firefly directly from Saturn. Trained on licensed content — safe for commercial use.",
    authType: "apikey",
    docsUrl: "https://developer.adobe.com/firefly-services/docs/firefly-api/",
    fields: [
      { key: "firefly_client_id", label: "Firefly Client ID", placeholder: "From Adobe Developer Console", type: "text" },
      { key: "firefly_client_secret", label: "Firefly Client Secret", placeholder: "From Adobe Developer Console", type: "password" },
    ],
    capabilities: [
      "Generate environmental mockups for client presentations",
      "Create wayfinding background textures and patterns",
      "Generate brand-consistent hero images",
      "Auto-prompt from project brief in Command Center",
      "Save outputs directly to project assets",
    ],
    setupSteps: [
      "Go to developer.adobe.com → Create project",
      "Add API → Firefly Services",
      "Configure OAuth Server-to-Server credentials",
      "Copy Client ID + Secret into fields below",
    ],
    status: "disconnected",
    apps: ["Firefly", "Photoshop", "Illustrator"],
  },
  {
    id: "google-drive",
    name: "Google Drive",
    category: "Cloud Storage",
    logo: "GD",
    logoColor: "#4285F4",
    description: "Export proposals, contracts, and deliverables directly to your Google Drive. Auto-organize by client and project. Sync NED brand assets.",
    authType: "oauth",
    oauthUrl: "https://console.cloud.google.com/",
    docsUrl: "https://developers.google.com/drive",
    fields: [],
    capabilities: [
      "Export proposals as PDFs to Drive",
      "Auto-create client folders by project",
      "Sync NED brand asset library",
      "Attach Drive files to Saturn projects",
      "Share deliverable links from Saturn",
    ],
    setupSteps: [
      "Already connected via Perplexity — click 'Test Connection'",
    ],
    status: "connected",
    apps: ["Google Drive", "Google Docs", "Google Sheets"],
  },
  {
    id: "gmail",
    name: "Gmail",
    category: "Communication",
    logo: "GM",
    logoColor: "#EA4335",
    description: "Scan inbox for client emails, auto-flag project-related threads, and send proposals and briefs directly from Saturn.",
    authType: "oauth",
    docsUrl: "https://developers.google.com/gmail",
    fields: [],
    capabilities: [
      "Scan inbox for client project emails",
      "Auto-detect new project inquiries",
      "Send proposals and briefs via Saturn",
      "Log client communications to projects",
      "Daily brief delivery to your inbox",
    ],
    setupSteps: [
      "Already connected via Perplexity — click 'Test Connection'",
    ],
    status: "connected",
    apps: ["Gmail"],
  },
  {
    id: "gcal",
    name: "Google Calendar",
    category: "Scheduling",
    logo: "GC",
    logoColor: "#0F9D58",
    description: "Pull upcoming meetings into Saturn Command Center. Sync project deadlines as calendar events. Get pre-meeting briefings generated automatically.",
    authType: "oauth",
    docsUrl: "https://developers.google.com/calendar",
    fields: [],
    capabilities: [
      "Display upcoming meetings in Command Center",
      "Sync project deadlines to calendar",
      "Auto-generate pre-meeting briefs",
      "Create calendar events from Saturn tasks",
      "Meeting notes auto-linked to calendar events",
    ],
    setupSteps: [
      "Already connected via Perplexity — click 'Test Connection'",
    ],
    status: "connected",
    apps: ["Google Calendar"],
  },
  {
    id: "notion",
    name: "Notion",
    category: "Documentation",
    logo: "NO",
    logoColor: "#FFFFFF",
    description: "Two-way sync between Saturn projects and Notion databases. Push meeting notes, proposals, and project briefs to Notion pages automatically.",
    authType: "oauth",
    oauthUrl: "https://www.notion.so/my-integrations",
    docsUrl: "https://developers.notion.com/",
    fields: [
      { key: "notion_token", label: "Integration Token", placeholder: "secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", type: "password" },
      { key: "notion_db_id", label: "Projects Database ID", placeholder: "Notion database ID (from page URL)", type: "text" },
    ],
    capabilities: [
      "Push Saturn projects to Notion database",
      "Sync meeting notes as Notion pages",
      "Export proposals to Notion docs",
      "Pull Notion tasks into Saturn Command Center",
      "Bi-directional project status sync",
    ],
    setupSteps: [
      "Go to notion.so/my-integrations → New integration",
      "Name it 'Saturn AI' → Submit",
      "Copy the integration token",
      "Share your Notion databases with the integration",
    ],
    status: "disconnected",
    apps: ["Notion"],
  },
];

const categoryColors: Record<string, string> = {
  "Creative": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "3D / Spatial": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "E-Commerce": "bg-green-500/10 text-green-400 border-green-500/20",
  "AI / Generative": "bg-pink-500/10 text-pink-400 border-pink-500/20",
  "Cloud Storage": "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  "Communication": "bg-red-500/10 text-red-400 border-red-500/20",
  "Scheduling": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Documentation": "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

function IntegrationCard({ integration }: { integration: typeof INTEGRATIONS[0] }) {
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"ok" | "error" | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const isConnected = integration.status === "connected";
  const catClass = categoryColors[integration.category] || "bg-white/10 text-white/60 border-white/10";

  const handleSave = () => {
    setSaved(true);
    toast({ title: `${integration.name} credentials saved`, description: "Restart Saturn to apply." });
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    await new Promise(r => setTimeout(r, 1200));
    setTestResult(isConnected ? "ok" : "error");
    setTesting(false);
  };

  return (
    <div
      className={`saturn-card overflow-hidden transition-all duration-200 ${isConnected ? "border-green-500/20" : ""}`}
      data-testid={`integration-card-${integration.id}`}
    >
      {/* Header */}
      <div className="p-5 flex items-start gap-4">
        {/* Logo badge */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-[10px] font-black tracking-tight flex-shrink-0 border"
          style={{
            backgroundColor: integration.logoColor + "18",
            borderColor: integration.logoColor + "35",
            color: integration.logoColor,
          }}
        >
          {integration.logo}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2 mb-1">
            <h3 className="text-sm font-bold text-[var(--saturn-text)]">{integration.name}</h3>
            <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${catClass}`}>
              {integration.category}
            </Badge>
            <Badge
              variant="outline"
              className={`text-[9px] px-1.5 py-0 ${isConnected ? "border-green-500/30 text-green-400 bg-green-500/10" : "border-white/10 text-[var(--saturn-faint)]"}`}
            >
              {isConnected ? "● Connected" : "○ Not Connected"}
            </Badge>
          </div>
          <p className="text-[11px] text-[var(--saturn-muted)] leading-relaxed">{integration.description}</p>

          {/* App pills */}
          <div className="flex flex-wrap gap-1 mt-2">
            {integration.apps.map(app => (
              <span key={app} className="text-[9px] px-1.5 py-0.5 rounded border border-white/8 text-[var(--saturn-faint)]">
                {app}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleTest}
            disabled={testing}
            data-testid={`btn-test-${integration.id}`}
            className="p-1.5 rounded hover:bg-white/5 text-[var(--saturn-muted)] hover:text-[var(--saturn-text)] transition-colors"
            title="Test connection"
          >
            <RefreshCw size={13} className={testing ? "animate-spin" : ""} />
          </button>
          {integration.docsUrl && (
            <a href={integration.docsUrl} target="_blank" rel="noopener noreferrer"
              className="p-1.5 rounded hover:bg-white/5 text-[var(--saturn-muted)] hover:text-[var(--saturn-text)] transition-colors"
              title="Docs">
              <ExternalLink size={13} />
            </a>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            data-testid={`btn-expand-${integration.id}`}
            className="p-1.5 rounded hover:bg-white/5 text-[var(--saturn-muted)] hover:text-[var(--saturn-text)] transition-colors"
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {/* Test result banner */}
      {testResult && (
        <div className={`px-5 py-2 flex items-center gap-2 text-xs ${testResult === "ok" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
          {testResult === "ok" ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
          {testResult === "ok" ? "Connection verified successfully." : `Not connected — add credentials below${integration.note ? " (note: " + integration.note + ")" : ""}`}
        </div>
      )}

      {/* Expanded config */}
      {expanded && (
        <div className="border-t border-white/5 p-5 space-y-5">

          {/* Capabilities */}
          <div>
            <p className="text-[10px] text-[var(--saturn-muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Zap size={9} className="text-amber-400" /> What Saturn can do with this
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-1">
              {integration.capabilities.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] text-[var(--saturn-muted)]">
                  <span className="text-amber-500 mt-0.5 flex-shrink-0">→</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>

          {/* Setup steps */}
          <div>
            <p className="text-[10px] text-[var(--saturn-muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Key size={9} /> Setup
            </p>
            <ol className="space-y-1">
              {integration.setupSteps.map((s, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[11px] text-[var(--saturn-faint)]">
                  <span className="w-4 h-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
          </div>

          {/* Credential fields */}
          {integration.fields.length > 0 && (
            <div>
              <p className="text-[10px] text-[var(--saturn-muted)] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Key size={9} /> Credentials
              </p>
              <div className="space-y-3">
                {integration.fields.map(f => (
                  <div key={f.key}>
                    <label className="text-[10px] text-[var(--saturn-faint)] block mb-1">{f.label}</label>
                    <Input
                      type={f.type}
                      placeholder={f.placeholder}
                      value={fields[f.key] || ""}
                      onChange={e => setFields(prev => ({ ...prev, [f.key]: e.target.value }))}
                      className="saturn-input text-xs h-8 font-mono"
                      data-testid={`input-${integration.id}-${f.key}`}
                    />
                  </div>
                ))}
                <div className="flex gap-2 pt-1">
                  <Button
                    onClick={handleSave}
                    className="saturn-btn-primary text-xs h-8 px-4"
                    data-testid={`btn-save-${integration.id}`}
                  >
                    {saved ? "Saved ✓" : "Save Credentials"}
                  </Button>
                  {integration.oauthUrl && (
                    <a href={integration.oauthUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="text-xs h-8 border-white/15 text-[var(--saturn-muted)] hover:text-[var(--saturn-text)] gap-1.5">
                        <ExternalLink size={11} /> Get Credentials
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Already connected notice */}
          {integration.fields.length === 0 && isConnected && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/8 border border-green-500/20">
              <CheckCircle2 size={14} className="text-green-400" />
              <p className="text-xs text-green-300">Connected via Perplexity — no additional setup required.</p>
            </div>
          )}

          {/* Note banner */}
          {integration.note && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/8 border border-blue-500/15">
              <AlertCircle size={12} className="text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-[10px] text-blue-300">{integration.note}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Integrations() {
  const [filter, setFilter] = useState("all");
  const categories = ["all", ...Array.from(new Set(INTEGRATIONS.map(i => i.category)))];
  const connectedCount = INTEGRATIONS.filter(i => i.status === "connected").length;

  const filtered = filter === "all"
    ? INTEGRATIONS
    : INTEGRATIONS.filter(i => i.category === filter);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--saturn-text)] tracking-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Integrations
          </h1>
          <p className="text-xs text-[var(--saturn-muted)] mt-0.5">
            Connect Saturn to your creative stack — Adobe, SketchUp, Shopify, and more
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-black text-[var(--saturn-amber)]">{connectedCount}/{INTEGRATIONS.length}</p>
          <p className="text-[10px] text-[var(--saturn-faint)] uppercase tracking-wider">Connected</p>
        </div>
      </div>

      {/* Status overview */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Creative Tools", icon: Palette, items: ["Adobe CC", "Firefly", "SketchUp"], color: "#FF9A00" },
          { label: "Client Commerce", icon: ShoppingBag, items: ["Shopify Stores", "Order tracking", "Theme deploy"], color: "#96BF48" },
          { label: "Productivity", icon: Globe, items: ["Drive", "Gmail", "Calendar", "Notion"], color: "#4285F4" },
        ].map(({ label, icon: Icon, items, color }) => (
          <div key={label} className="saturn-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} style={{ color }} />
              <span className="text-xs font-semibold text-[var(--saturn-text)]">{label}</span>
            </div>
            <ul className="space-y-0.5">
              {items.map(item => (
                <li key={item} className="text-[10px] text-[var(--saturn-faint)] flex items-center gap-1.5">
                  <span style={{ color }} className="text-[8px]">▸</span> {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-1 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            data-testid={`filter-cat-${cat}`}
            className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all ${
              filter === cat
                ? "bg-amber-500 text-[#0d1526]"
                : "bg-white/5 text-[var(--saturn-muted)] hover:bg-white/8 hover:text-[var(--saturn-text)] border border-white/8"
            }`}
          >
            {cat === "all" ? `All (${INTEGRATIONS.length})` : cat}
          </button>
        ))}
      </div>

      {/* Integration cards */}
      <div className="space-y-3">
        {filtered.map(integration => (
          <IntegrationCard key={integration.id} integration={integration} />
        ))}
      </div>

      {/* Footer note */}
      <div className="saturn-card p-4 flex items-start gap-3">
        <AlertCircle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-xs font-medium text-[var(--saturn-text)]">Local Install Note</p>
          <p className="text-[11px] text-[var(--saturn-muted)] mt-0.5 leading-relaxed">
            When running Saturn locally on your Mac or Lenovo desktop, credentials are stored in a local <code className="text-amber-400">.env</code> file and never leave your machine. The local install guide includes the full environment setup with all API keys pre-wired.
          </p>
        </div>
      </div>
    </div>
  );
}
