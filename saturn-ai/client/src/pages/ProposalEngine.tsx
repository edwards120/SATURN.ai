import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { FileText, Plus, ChevronDown, ChevronUp, Copy, Download, Send, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PROJECT_TYPES = ["Wayfinding System", "Brand Systems", "Environmental Graphics", "Signage Program", "Criteria Manual", "Retainer"];
const PAYMENT_OPTIONS = ["50% upfront / 50% at final delivery", "33% / 33% / 33% milestone", "100% upfront (small projects)", "Net-30 invoicing (retainer clients)"];

const SCOPE_TEMPLATES: Record<string, string[]> = {
  "Wayfinding System": [
    "Discovery, site review, and stakeholder alignment",
    "Message hierarchy planning and sign family definition",
    "Concept design — form, material direction, typography, color",
    "Schematic layouts, 3D mockups, and annotated placement views",
    "Production intent drawings and vendor documentation",
    "Up to 2 rounds of revisions per phase",
  ],
  "Brand Systems": [
    "Brand audit and strategic alignment session",
    "Visual identity system development (logo, color, type, pattern)",
    "Brand standards and usage documentation",
    "Application templates for print and digital",
    "Final file delivery package (AI, PDF, PNG, brand guidelines)",
  ],
  "Environmental Graphics": [
    "Space assessment and concept direction",
    "Environmental graphic system design",
    "Material direction and specification",
    "Production-ready artwork files",
    "Vendor coordination support",
  ],
  "Criteria Manual": [
    "Existing conditions audit and documentation",
    "Sign type inventory and classification",
    "Design standards and specification writing",
    "ADA + code compliance review",
    "Final criteria manual (PDF + editable files)",
  ],
};

const DELIVERABLE_TEMPLATES: Record<string, string[]> = {
  "Wayfinding System": ["Sign Family Design Package", "3D Visualization Deck", "Message Schedule + Placement Plan", "Production Intent Drawings"],
  "Brand Systems": ["Brand Identity System", "Brand Standards Guide", "Application Templates"],
  "Environmental Graphics": ["Environmental Graphic System", "Production Artwork Files", "Material Specification Sheet"],
  "Criteria Manual": ["Sign Criteria Manual (PDF)", "ADA Compliance Checklist", "Standards Reference Document"],
};

const FEE_RANGES: Record<string, { base: string; notes: string }> = {
  "Wayfinding System": { base: "$8,500 – $25,000", notes: "Complexity, sign count, and PM level drive fee." },
  "Brand Systems": { base: "$4,500 – $15,000", notes: "Based on scope of identity development." },
  "Environmental Graphics": { base: "$5,000 – $18,000", notes: "Space scale and material complexity." },
  "Criteria Manual": { base: "$6,000 – $20,000", notes: "Property count and documentation depth." },
  "Signage Program": { base: "$3,500 – $12,000", notes: "Sign count, type variety, ADA requirements." },
  "Retainer": { base: "$1,500 – $4,500/mo", notes: "Based on monthly deliverable scope." },
};

function ProposalCard({ proposal, onDelete }: { proposal: any; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();
  const statusClass = proposal.status === "approved" ? "status-complete" : proposal.status === "sent" ? "status-active" : "status-draft";

  const copyText = () => {
    const text = `NEW ERA DESIGNS — ${proposal.projectName}\nPrepared for: ${proposal.client}\nProposal ID: ${proposal.proposalId}\n\nEXECUTIVE SUMMARY\n${proposal.executiveSummary}\n\nESTIMATED TOTAL: ${proposal.estimatedTotal}\nPAYMENT: ${proposal.paymentStructure}`;
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  return (
    <div className="saturn-card">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span style={{ fontSize: "10px", color: "#FCA311", fontWeight: 700, letterSpacing: "0.1em" }}>{proposal.proposalId}</span>
              <span className={`${statusClass} px-2 py-0.5 rounded text-xs font-bold`}>{proposal.status}</span>
            </div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}>{proposal.projectName}</h3>
            <p style={{ fontSize: "12px", color: "#8899bb" }}>{proposal.client} · {proposal.projectType}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={copyText} className="p-1.5 rounded transition-colors" style={{ color: "#4a5a7a" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#FCA311")}
              onMouseLeave={e => (e.currentTarget.style.color = "#4a5a7a")}>
              <Copy size={14} />
            </button>
            <button onClick={onDelete} className="p-1.5 rounded transition-colors" style={{ color: "#4a5a7a" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#ff643c")}
              onMouseLeave={e => (e.currentTarget.style.color = "#4a5a7a")}>
              <Trash2 size={14} />
            </button>
            <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded" style={{ color: "#8899bb" }}>
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {proposal.estimatedTotal && (
          <div className="mt-2 flex items-center gap-2">
            <span style={{ fontSize: "18px", fontWeight: 900, color: "#FCA311" }}>{proposal.estimatedTotal}</span>
            <span style={{ fontSize: "11px", color: "#4a5a7a" }}>{proposal.paymentStructure}</span>
          </div>
        )}
      </div>

      {expanded && (
        <div className="border-t px-4 pb-4 pt-4 flex flex-col gap-3" style={{ borderColor: "#1e2d4d" }}>
          {proposal.executiveSummary && (
            <div>
              <div className="saturn-label mb-1">EXECUTIVE SUMMARY</div>
              <p style={{ fontSize: "13px", color: "#ccd5e8", lineHeight: 1.7 }}>{proposal.executiveSummary}</p>
            </div>
          )}
          {proposal.proposedScope && (
            <div>
              <div className="saturn-label mb-1">SCOPE</div>
              <ul className="flex flex-col gap-1">
                {JSON.parse(proposal.proposedScope || "[]").map((s: string, i: number) => (
                  <li key={i} style={{ fontSize: "12px", color: "#8899bb" }}>
                    <span style={{ color: "#FCA311", marginRight: "6px" }}>·</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {proposal.deliverables && (
            <div>
              <div className="saturn-label mb-1">DELIVERABLES</div>
              <ul className="flex flex-col gap-1">
                {JSON.parse(proposal.deliverables || "[]").map((d: string, i: number) => (
                  <li key={i} style={{ fontSize: "12px", color: "#8899bb" }}>
                    <span style={{ color: "#44c878", marginRight: "6px" }}>✓</span>{d}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="grid grid-cols-3 gap-3 mt-1">
            {proposal.phase1 && <div>
              <div className="saturn-label mb-1">PHASE 01</div>
              <p style={{ fontSize: "12px", color: "#8899bb" }}>{proposal.phase1}</p>
            </div>}
            {proposal.phase2 && <div>
              <div className="saturn-label mb-1">PHASE 02</div>
              <p style={{ fontSize: "12px", color: "#8899bb" }}>{proposal.phase2}</p>
            </div>}
            {proposal.phase3 && <div>
              <div className="saturn-label mb-1">PHASE 03</div>
              <p style={{ fontSize: "12px", color: "#8899bb" }}>{proposal.phase3}</p>
            </div>}
          </div>
          {proposal.assumptions && (
            <div>
              <div className="saturn-label mb-1">ASSUMPTIONS</div>
              <p style={{ fontSize: "12px", color: "#8899bb", lineHeight: 1.6 }}>{proposal.assumptions}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProposalEngine() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    client: "", projectName: "", projectType: "Wayfinding System",
    executiveSummary: "", businessObjective: "", visualScope: "", operationalImpact: "",
    proposedScope: "[]", deliverables: "[]",
    phase1: "Discovery & direction", phase2: "Design development", phase3: "Refinement & final delivery",
    durationWeeks: "4–8 weeks", baseFee: "", addOns: "", estimatedTotal: "",
    paymentStructure: "50% upfront / 50% at final delivery",
    assumptions: "Pricing excludes fabrication, installation, permitting, and engineering. Standard engagement includes 2 revision rounds per phase.",
    status: "draft",
  });

  const { data: proposals = [] } = useQuery<any[]>({
    queryKey: ["/api/proposals"],
    queryFn: () => apiRequest("GET", "/api/proposals").then(r => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/proposals", data).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/proposals"] }); setShowForm(false); toast({ title: "Proposal created." }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/proposals/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/proposals"] }),
  });

  const autoFill = (type: string) => {
    const scope = SCOPE_TEMPLATES[type] || [];
    const deliverables = DELIVERABLE_TEMPLATES[type] || [];
    const fee = FEE_RANGES[type];
    setForm(f => ({
      ...f,
      projectType: type,
      proposedScope: JSON.stringify(scope),
      deliverables: JSON.stringify(deliverables),
      estimatedTotal: fee?.base || "",
    }));
  };

  const nextId = `NED-${String((proposals.length || 0) + 1).padStart(4, "0")}`;

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="saturn-label mb-1">PROPOSAL ENGINE</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "32px", fontWeight: 700, color: "#fff" }}>
            Proposals
          </h1>
          <p style={{ fontSize: "13px", color: "#8899bb", marginTop: "4px" }}>
            Draft, structure, and track New Era Designs proposals
          </p>
        </div>
        <button
          data-testid="new-proposal-btn"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all"
          style={{ background: "#FCA311", color: "#0d1526" }}>
          <Plus size={16} /> New Proposal
        </button>
      </div>

      <div className="saturn-rule mb-6" />

      {/* New Proposal Form */}
      {showForm && (
        <div className="saturn-card p-6 mb-6">
          <div className="saturn-label mb-4">NEW PROPOSAL · {nextId}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="saturn-label block mb-1">CLIENT NAME</label>
              <input data-testid="proposal-client" value={form.client} onChange={e => setForm(f => ({ ...f, client: e.target.value }))}
                className="w-full p-2.5 rounded-lg text-sm" placeholder="Rubicon Realty Group"
                style={{ background: "#16213A", border: "1px solid #1e2d4d", color: "#fff" }} />
            </div>
            <div>
              <label className="saturn-label block mb-1">PROJECT NAME</label>
              <input data-testid="proposal-project" value={form.projectName} onChange={e => setForm(f => ({ ...f, projectName: e.target.value }))}
                className="w-full p-2.5 rounded-lg text-sm" placeholder="Westpark Commons Wayfinding System"
                style={{ background: "#16213A", border: "1px solid #1e2d4d", color: "#fff" }} />
            </div>
            <div>
              <label className="saturn-label block mb-1">PROJECT TYPE</label>
              <select data-testid="proposal-type" value={form.projectType}
                onChange={e => { setForm(f => ({ ...f, projectType: e.target.value })); autoFill(e.target.value); }}
                className="w-full p-2.5 rounded-lg text-sm" style={{ background: "#16213A", border: "1px solid #1e2d4d", color: "#fff" }}>
                {PROJECT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="saturn-label block mb-1">ESTIMATED TOTAL</label>
              <input value={form.estimatedTotal} onChange={e => setForm(f => ({ ...f, estimatedTotal: e.target.value }))}
                className="w-full p-2.5 rounded-lg text-sm" placeholder="$12,500"
                style={{ background: "#16213A", border: "1px solid #1e2d4d", color: "#fff" }} />
              {FEE_RANGES[form.projectType] && (
                <p style={{ fontSize: "11px", color: "#4a5a7a", marginTop: "4px" }}>
                  Typical range: {FEE_RANGES[form.projectType].base}
                </p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="saturn-label block mb-1">EXECUTIVE SUMMARY</label>
            <textarea rows={3} value={form.executiveSummary}
              onChange={e => setForm(f => ({ ...f, executiveSummary: e.target.value }))}
              placeholder="State what the client needs, what problem the work is solving, and what outcome the proposal is designed to support..."
              className="w-full p-2.5 rounded-lg text-sm resize-none"
              style={{ background: "#16213A", border: "1px solid #1e2d4d", color: "#fff", lineHeight: 1.6 }} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="saturn-label block mb-1">PHASE 01</label>
              <input value={form.phase1} onChange={e => setForm(f => ({ ...f, phase1: e.target.value }))}
                className="w-full p-2.5 rounded-lg text-sm" style={{ background: "#16213A", border: "1px solid #1e2d4d", color: "#fff" }} />
            </div>
            <div>
              <label className="saturn-label block mb-1">PHASE 02</label>
              <input value={form.phase2} onChange={e => setForm(f => ({ ...f, phase2: e.target.value }))}
                className="w-full p-2.5 rounded-lg text-sm" style={{ background: "#16213A", border: "1px solid #1e2d4d", color: "#fff" }} />
            </div>
            <div>
              <label className="saturn-label block mb-1">PHASE 03</label>
              <input value={form.phase3} onChange={e => setForm(f => ({ ...f, phase3: e.target.value }))}
                className="w-full p-2.5 rounded-lg text-sm" style={{ background: "#16213A", border: "1px solid #1e2d4d", color: "#fff" }} />
            </div>
          </div>

          <div className="mb-4">
            <label className="saturn-label block mb-1">PAYMENT STRUCTURE</label>
            <select value={form.paymentStructure} onChange={e => setForm(f => ({ ...f, paymentStructure: e.target.value }))}
              className="w-full p-2.5 rounded-lg text-sm" style={{ background: "#16213A", border: "1px solid #1e2d4d", color: "#fff" }}>
              {PAYMENT_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-3 justify-end">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm rounded-lg"
              style={{ background: "#16213A", color: "#8899bb", border: "1px solid #1e2d4d" }}>
              Cancel
            </button>
            <button
              data-testid="create-proposal-btn"
              onClick={() => createMutation.mutate({ ...form, proposalId: nextId })}
              disabled={!form.client || !form.projectName}
              className="px-5 py-2 text-sm font-bold rounded-lg"
              style={{ background: (!form.client || !form.projectName) ? "#1e2d4d" : "#FCA311", color: "#0d1526" }}>
              {createMutation.isPending ? "Creating..." : "Create Proposal"}
            </button>
          </div>
        </div>
      )}

      {/* Proposals List */}
      {proposals.length === 0 ? (
        <div className="saturn-card p-12 text-center">
          <FileText size={40} style={{ color: "#2e3f66", margin: "0 auto 12px" }} />
          <h3 style={{ color: "#fff", fontSize: "16px", fontWeight: 700, marginBottom: "6px" }}>No proposals yet</h3>
          <p style={{ color: "#4a5a7a", fontSize: "13px" }}>Create your first proposal above.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {proposals.map((p: any) => (
            <ProposalCard key={p.id} proposal={p} onDelete={() => deleteMutation.mutate(p.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
