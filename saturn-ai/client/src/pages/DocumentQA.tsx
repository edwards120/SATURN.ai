import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Database, Plus, Search, FileText, Trash2, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = ["pricing", "process", "template", "project", "notes", "standards", "contracts", "branding"];

const SEED_DOCS = [
  {
    title: "NED Pricing Philosophy",
    category: "pricing",
    content: "New Era Designs prices by scope, complexity, and delivered value — not by the hour as a default. Physical environment design is contextual. Primary pricing factors: complexity of the environment, number and variety of sign types, site size and physical scope, number of revision rounds, deliverables required, level of project management, fabrication coordination needs, multi-site rollout vs. single project, rush schedule, and stakeholder complexity.",
    tags: JSON.stringify(["pricing", "fees", "scope"]),
  },
  {
    title: "NED Process — Discovery to Closeout",
    category: "process",
    content: "13-step process: 01 Discovery/Site Review, 02 Scope Definition, 03 Concept Design, 04 Messaging Hierarchy/Sign Family Planning, 05 Schematic Layouts/Mockups/Visualization, 06 Budget Alignment, 07 Fabricator Outreach/Bid Support, 08 Material and Production Coordination, 09 Shop Drawings/Engineering/Permitting, 10 Production, 11 Shipping/Logistics, 12 Installation, 13 Punch List/Closeout/Rollout Documentation.",
    tags: JSON.stringify(["process", "workflow", "installation"]),
  },
  {
    title: "ADA Sign Requirements Summary",
    category: "standards",
    content: "Interior signs: tactile characters required at 5/8 inch minimum height, Grade 2 Braille below tactile text. Mounting height: 60 inches AFF to centerline for overhead signs, 48–60 inches for wall-mounted tactile signs. Color contrast: minimum 70% contrast between text and background. Non-glare finish required. Room identification signs mounted on latch side of door. Directional signs: no tactile required. Overhead clearance minimum 80 inches.",
    tags: JSON.stringify(["ADA", "compliance", "standards", "signs"]),
  },
  {
    title: "NED Role in the Process",
    category: "process",
    content: "New Era Designs operates upstream of fabrication. We are the strategic and design layer — the team that converts a property's operational and brand requirements into organized, decision-ready visual systems that fabricators can build and installers can execute. Roles: Strategic Design Lead, Wayfinding & Environmental Brand Systems Designer, Design Translator, Project Manager/Coordination Support, Standards & Consistency Lead. NOT the fabricator or installer — unless through managed partners.",
    tags: JSON.stringify(["role", "positioning", "process"]),
  },
  {
    title: "Proposal Template Structure",
    category: "template",
    content: "Short Proposal Template: Executive Summary (3-5 sentences, lead with business objective), Project Objectives (Business Objective, Visual Scope, Operational Impact), Proposed Scope (4-6 bullets), Key Deliverables (3-4 items), Timeline (Phase 01, 02, 03 + Duration), Investment Summary (Base fee, add-ons, estimated total, payment structure), Assumptions + Notes, Next Steps (1. Confirm scope 2. Approve proposal 3. Begin discovery), Approval block.",
    tags: JSON.stringify(["proposal", "template", "structure"]),
  },
  {
    title: "Naming Convention — NED File System",
    category: "standards",
    content: "Project files: [CLIENTCODE]_[PROJECTNAME]_[PHASE]_[VERSION].[ext]. Example: RUB01_WESTPARK_CONCEPT_v1.ai. Photography: [CLIENTCODE]_[LOCATION]_[SHOTTYPE]_[DATE].jpg. Example: RUB01_LOBBY_001_20260311.jpg. Proposals: NED-[####]_[CLIENT]_[DATE].pdf. Sign IDs: [CLIENTCODE]-[TYPE]-[###]. Types: EXT (exterior), DIR (directional), ID (suite/room ID), MON (monument), WAY (wayfinding), ADA (ADA compliant).",
    tags: JSON.stringify(["naming", "files", "conventions"]),
  },
];

export default function DocumentQA() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [form, setForm] = useState({ title: "", category: "notes", content: "", tags: "" });
  const [qaQuery, setQaQuery] = useState("");
  const [qaResult, setQaResult] = useState("");
  const [qaLoading, setQaLoading] = useState(false);

  const { data: docs = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/documents"],
    queryFn: () => apiRequest("GET", "/api/documents").then(r => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/documents", data).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/documents"] }); setShowForm(false); toast({ title: "Document added to Saturn KB." }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/documents/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/documents"] }),
  });

  const seedMutation = useMutation({
    mutationFn: async () => {
      for (const doc of SEED_DOCS) {
        await apiRequest("POST", "/api/documents", doc).then(r => r.json());
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/documents"] }); toast({ title: `Saturn KB seeded with ${SEED_DOCS.length} NED documents.` }); },
  });

  const handleSearch = async () => {
    if (!qaQuery.trim()) return;
    setQaLoading(true);
    setQaResult("");
    // Local keyword search across all docs
    const searchTerms = qaQuery.toLowerCase().split(" ").filter(w => w.length > 2);
    const matches = docs.filter((d: any) => {
      const text = `${d.title} ${d.content} ${d.tags || ""}`.toLowerCase();
      return searchTerms.some(term => text.includes(term));
    });
    if (matches.length > 0) {
      const result = matches.slice(0, 3).map((d: any) =>
        `📄 ${d.title.toUpperCase()}\n${d.content.slice(0, 400)}${d.content.length > 400 ? "..." : ""}`
      ).join("\n\n---\n\n");
      setQaResult(result);
    } else {
      setQaResult("No matching documents found in Saturn KB. Try adding more documents or connect your local Ollama instance in Settings for AI-powered search.");
    }
    setQaLoading(false);
  };

  const filtered = docs.filter((d: any) => {
    const matchCat = activeCategory === "all" || d.category === activeCategory;
    const matchSearch = !search || d.title.toLowerCase().includes(search.toLowerCase()) || d.content.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="saturn-label mb-1">KNOWLEDGE BASE</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "32px", fontWeight: 700, color: "#fff" }}>
            Document Q&A
          </h1>
          <p style={{ fontSize: "13px", color: "#8899bb", marginTop: "4px" }}>{docs.length} documents indexed</p>
        </div>
        <div className="flex items-center gap-2">
          {docs.length === 0 && (
            <button onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold"
              style={{ background: "rgba(252,163,17,0.15)", color: "#FCA311", border: "1px solid rgba(252,163,17,0.3)" }}>
              {seedMutation.isPending ? "Seeding..." : "Seed NED Documents"}
            </button>
          )}
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold"
            style={{ background: "#FCA311", color: "#0d1526" }}>
            <Plus size={16} /> Add Document
          </button>
        </div>
      </div>
      <div className="saturn-rule mb-6" />

      {/* QA Interface */}
      <div className="saturn-card p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Search size={16} style={{ color: "#FCA311" }} />
          <span className="saturn-label">SEARCH KNOWLEDGE BASE</span>
        </div>
        <div className="flex gap-3">
          <input
            data-testid="kb-search-input"
            value={qaQuery}
            onChange={e => setQaQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder="Ask a question or search... e.g. ADA mounting height, revision round fees, proposal template"
            className="flex-1 p-2.5 rounded-lg text-sm"
            style={{ background: "#16213A", border: "1px solid #1e2d4d", color: "#fff" }}
          />
          <button onClick={handleSearch} disabled={qaLoading || !qaQuery.trim()}
            className="px-4 py-2.5 rounded-lg text-sm font-bold"
            style={{ background: qaLoading || !qaQuery.trim() ? "#1e2d4d" : "#FCA311", color: "#0d1526" }}>
            {qaLoading ? "Searching..." : "Search"}
          </button>
        </div>
        {qaResult && (
          <div className="mt-4 p-4 rounded-lg" style={{ background: "rgba(252,163,17,0.05)", border: "1px solid rgba(252,163,17,0.15)" }}>
            <pre style={{ fontSize: "12px", color: "#ccd5e8", lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: "'Lato', sans-serif" }}>
              {qaResult}
            </pre>
          </div>
        )}
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="saturn-card p-5 mb-6">
          <div className="saturn-label mb-4">ADD DOCUMENT TO SATURN KB</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="saturn-label block mb-1.5">DOCUMENT TITLE</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full p-2.5 rounded-lg text-sm" placeholder="NED ADA Standards Summary"
                style={{ background: "#16213A", border: "1px solid #1e2d4d", color: "#fff" }} />
            </div>
            <div>
              <label className="saturn-label block mb-1.5">CATEGORY</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full p-2.5 rounded-lg text-sm" style={{ background: "#16213A", border: "1px solid #1e2d4d", color: "#fff" }}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="saturn-label block mb-1.5">CONTENT</label>
            <textarea rows={5} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder="Paste document content, notes, standards, pricing logic, or any business knowledge..."
              className="w-full p-2.5 rounded-lg text-sm resize-none"
              style={{ background: "#16213A", border: "1px solid #1e2d4d", color: "#fff", lineHeight: 1.6 }} />
          </div>
          <div className="mb-4">
            <label className="saturn-label block mb-1.5">TAGS (comma separated)</label>
            <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              placeholder="ADA, signage, retail, pricing"
              className="w-full p-2.5 rounded-lg text-sm" style={{ background: "#16213A", border: "1px solid #1e2d4d", color: "#fff" }} />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm rounded-lg"
              style={{ background: "#16213A", color: "#8899bb", border: "1px solid #1e2d4d" }}>Cancel</button>
            <button onClick={() => createMutation.mutate({ ...form, tags: JSON.stringify(form.tags.split(",").map(t => t.trim()).filter(Boolean)) })}
              disabled={!form.title || !form.content}
              className="px-5 py-2 text-sm font-bold rounded-lg"
              style={{ background: !form.title || !form.content ? "#1e2d4d" : "#FCA311", color: "#0d1526" }}>
              Add to KB
            </button>
          </div>
        </div>
      )}

      {/* Filter row */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#4a5a7a" }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Filter documents..." className="pl-8 pr-3 py-2 rounded-lg text-sm"
            style={{ background: "#16213A", border: "1px solid #1e2d4d", color: "#fff", fontSize: "12px" }} />
        </div>
        <div className="flex gap-1 flex-wrap">
          {["all", ...CATEGORIES].map(c => (
            <button key={c} onClick={() => setActiveCategory(c)}
              className="px-3 py-1.5 rounded text-xs font-bold transition-all"
              style={{
                background: activeCategory === c ? "rgba(252,163,17,0.15)" : "#16213A",
                color: activeCategory === c ? "#FCA311" : "#8899bb",
                border: `1px solid ${activeCategory === c ? "rgba(252,163,17,0.3)" : "#1e2d4d"}`,
              }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Documents grid */}
      {isLoading ? (
        <div className="text-center py-12"><div className="animate-spin text-2xl">◌</div></div>
      ) : filtered.length === 0 ? (
        <div className="saturn-card p-12 text-center">
          <Database size={40} style={{ color: "#2e3f66", margin: "0 auto 12px" }} />
          <h3 style={{ color: "#fff", fontSize: "16px", fontWeight: 700, marginBottom: "6px" }}>Saturn KB is empty</h3>
          <p style={{ color: "#4a5a7a", fontSize: "13px" }}>Seed NED documents above or add your own.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((doc: any) => (
            <div key={doc.id} className="saturn-card p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="status-draft px-2 py-0.5 rounded text-xs font-bold">{doc.category}</span>
                  </div>
                  <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>{doc.title}</h3>
                </div>
                <button onClick={() => deleteMutation.mutate(doc.id)} className="p-1.5" style={{ color: "#4a5a7a" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#ff643c")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#4a5a7a")}>
                  <Trash2 size={13} />
                </button>
              </div>
              <p style={{ fontSize: "12px", color: "#8899bb", lineHeight: 1.6 }}>
                {doc.content.slice(0, 160)}{doc.content.length > 160 ? "..." : ""}
              </p>
              {doc.tags && JSON.parse(doc.tags || "[]").length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {JSON.parse(doc.tags).slice(0, 4).map((tag: string) => (
                    <span key={tag} className="px-2 py-0.5 rounded text-xs"
                      style={{ background: "rgba(252,163,17,0.08)", color: "#FCA311", border: "1px solid rgba(252,163,17,0.15)" }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
