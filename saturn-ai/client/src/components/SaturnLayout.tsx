import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, FolderOpen, FileText, DollarSign,
  Database, GitBranch, MessageSquare, Settings, Plug,
  ChevronLeft, ChevronRight, Zap, WifiOff, Search
} from "lucide-react";

const NAV_ITEMS = [
  { path: "/", icon: LayoutDashboard, label: "Command Center", tag: "HOME" },
  { path: "/projects", icon: FolderOpen, label: "Projects", tag: "WORK" },
  { path: "/proposals", icon: FileText, label: "Proposal Engine", tag: "DRAFT" },
  { path: "/pricing", icon: DollarSign, label: "Pricing + Scope", tag: "FEES" },
  { path: "/documents", icon: Database, label: "Knowledge Base", tag: "DOCS" },
  { path: "/workflow", icon: GitBranch, label: "Workflow Tracker", tag: "PIPE" },
  { path: "/meetings", icon: MessageSquare, label: "Meeting Notes", tag: "LOG" },
  { path: "/integrations", icon: Plug, label: "Integrations", tag: "INT" },
  { path: "/settings", icon: Settings, label: "Settings", tag: "SYS" },
];

// Saturn ringed-planet SVG logo mark
const SaturnMark = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-label="Saturn AI">
    <circle cx="20" cy="20" r="9" fill="#FCA311" opacity="0.95"/>
    <circle cx="20" cy="20" r="6" fill="#16213A"/>
    <ellipse cx="20" cy="20" rx="18" ry="5" stroke="#FCA311" strokeWidth="1.5" fill="none" opacity="0.7"
      transform="rotate(-20 20 20)"/>
    <circle cx="20" cy="20" r="3" fill="#FCA311" opacity="0.6"/>
  </svg>
);

const ModelStatus = () => (
  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
    style={{ background: "rgba(252,163,17,0.08)", border: "1px solid rgba(252,163,17,0.2)" }}>
    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
    <span style={{ color: "#FCA311", fontWeight: 700, letterSpacing: "0.08em" }}>SATURN V1</span>
  </div>
);

export default function SaturnLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0d1526" }}>

      {/* ── SIDEBAR ── */}
      <aside
        className="flex flex-col flex-shrink-0 transition-all duration-300"
        style={{
          width: collapsed ? "64px" : "220px",
          background: "#0a111f",
          borderRight: "1px solid #1e2d4d",
          position: "relative",
          zIndex: 20,
        }}
      >
        {/* Logo Header */}
        <div className="flex items-center gap-3 px-4 py-5"
          style={{ borderBottom: "1px solid #1e2d4d", minHeight: "64px" }}>
          <SaturnMark size={32} />
          {!collapsed && (
            <div className="flex flex-col leading-tight overflow-hidden">
              <span style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontWeight: 700, fontSize: "15px", color: "#FCA311",
                letterSpacing: "0.04em", whiteSpace: "nowrap"
              }}>SATURN AI</span>
              <span style={{ fontSize: "9px", color: "#4a5a7a", letterSpacing: "0.12em", fontWeight: 700 }}>
                NEW ERA DESIGNS
              </span>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          {NAV_ITEMS.map(({ path, icon: Icon, label, tag }) => {
            const active = location === path;
            return (
              <Link key={path} href={path}>
                <div
                  data-testid={`nav-${tag.toLowerCase()}`}
                  className="flex items-center gap-3 mx-2 mb-1 cursor-pointer transition-all duration-150"
                  style={{
                    padding: "9px 10px",
                    borderRadius: "6px",
                    background: active ? "rgba(252,163,17,0.12)" : "transparent",
                    borderLeft: active ? "2px solid #FCA311" : "2px solid transparent",
                    color: active ? "#FCA311" : "#8899bb",
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                      (e.currentTarget as HTMLElement).style.color = "#fff";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "#8899bb";
                    }
                  }}
                >
                  <Icon size={16} strokeWidth={active ? 2.5 : 1.8} style={{ flexShrink: 0 }} />
                  {!collapsed && (
                    <div className="flex flex-col overflow-hidden">
                      <span style={{ fontSize: "13px", fontWeight: active ? 700 : 400, whiteSpace: "nowrap" }}>
                        {label}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom: version + collapse */}
        <div style={{ borderTop: "1px solid #1e2d4d", padding: "12px 8px" }}>
          {!collapsed && (
            <div className="px-2 mb-3">
              <div style={{ fontSize: "9px", color: "#2e3f66", letterSpacing: "0.1em", fontWeight: 700 }}>
                VERSION
              </div>
              <div style={{ fontSize: "11px", color: "#4a5a7a", marginTop: "2px" }}>
                Saturn V1.5 · Build 2026.03
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-2 rounded transition-colors"
            style={{ color: "#4a5a7a" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#FCA311")}
            onMouseLeave={e => (e.currentTarget.style.color = "#4a5a7a")}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="flex items-center justify-between flex-shrink-0 px-6"
          style={{
            height: "64px",
            background: "#0d1526",
            borderBottom: "1px solid #1e2d4d",
          }}>
          {/* Search */}
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#4a5a7a" }} />
              <input
                data-testid="topbar-search"
                type="search"
                placeholder="Search Saturn knowledge base..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg text-sm"
                style={{
                  background: "#16213A",
                  border: "1px solid #1e2d4d",
                  color: "#fff",
                  outline: "none",
                  fontSize: "13px",
                }}
                onFocus={e => (e.target.style.borderColor = "rgba(252,163,17,0.4)")}
                onBlur={e => (e.target.style.borderColor = "#1e2d4d")}
              />
            </div>
          </div>

          {/* Right: model status + user */}
          <div className="flex items-center gap-4">
            <ModelStatus />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: "rgba(252,163,17,0.2)", color: "#FCA311", border: "1px solid rgba(252,163,17,0.3)" }}>
                CE
              </div>
              {/* Not collapsed: show name */}
              <div className="hidden md:flex flex-col leading-tight">
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#fff" }}>Chris Edwards</span>
                <span style={{ fontSize: "10px", color: "#4a5a7a" }}>New Era Designs, LLC</span>
              </div>
            </div>
          </div>
        </header>

        {/* Offline Banner */}
        {isOffline && (
          <div
            data-testid="offline-banner"
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold"
            style={{ background: "rgba(245,158,11,0.15)", borderBottom: "1px solid rgba(252,163,17,0.35)", color: "#FCA311", letterSpacing: "0.04em" }}
          >
            <WifiOff size={12} />
            OFFLINE MODE — Ollama KB active · Cloud LLMs unavailable · All local data accessible
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto" style={{ background: "#0d1526" }}>
          {children}
        </main>

      </div>
    </div>
  );
}
