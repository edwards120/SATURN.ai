import { useState } from "react";
import { DollarSign, Calculator, Info } from "lucide-react";

const FEE_TABLE = [
  { service: "Discovery & Site Review", unit: "Per session", range: "$800 – $1,500", notes: "Kick-off call or site walk" },
  { service: "Wayfinding System Design", unit: "Per project", range: "$8,500 – $25,000", notes: "Full sign family + placement logic" },
  { service: "Brand Systems", unit: "Per project", range: "$4,500 – $15,000", notes: "Identity system + standards" },
  { service: "Environmental Graphics", unit: "Per project", range: "$5,000 – $18,000", notes: "Space-based graphic system" },
  { service: "3D Visualization / Mockups", unit: "Per deliverable set", range: "$1,200 – $4,500", notes: "SketchUp + ECDesign renders" },
  { service: "Criteria / Standards Manual", unit: "Per manual", range: "$6,000 – $20,000", notes: "Multi-property documentation" },
  { service: "Signage Program", unit: "Per project", range: "$3,500 – $12,000", notes: "Sign count + type variety" },
  { service: "Vendor Coordination", unit: "Per phase", range: "$1,500 – $5,000", notes: "Bid packages, RFQ, shop drawing review" },
  { service: "Project Management", unit: "% of project fee", range: "15% – 25%", notes: "Full PM scope" },
  { service: "Retainer — Base", unit: "Per month", range: "$1,500 – $2,500/mo", notes: "Up to ~15 hrs/mo" },
  { service: "Retainer — Premium", unit: "Per month", range: "$3,000 – $4,500/mo", notes: "Up to ~30 hrs/mo" },
  { service: "Rush Fee", unit: "Added to project fee", range: "+20% – +35%", notes: "Compressed timeline" },
  { service: "Additional Revision Round", unit: "Per round", range: "$400 – $1,200", notes: "Beyond scope included" },
  { service: "Travel (if required)", unit: "At cost + 10%", range: "Varies", notes: "Billed at cost plus markup" },
];

const SCOPE_FACTORS = [
  { factor: "Complexity of Environment", impact: "High", description: "Decision points, zones, levels, wayfinding challenges" },
  { factor: "Number of Sign Types", impact: "High", description: "5 types vs 15 types across multiple buildings" },
  { factor: "Site Size / Physical Scope", impact: "High", description: "Sq ft, number of buildings, geographic spread" },
  { factor: "Deliverable Set", impact: "Medium", description: "Concept presentation vs fabrication-ready package" },
  { factor: "Revision Rounds", impact: "Medium", description: "Standard 2 rounds; additional = change order" },
  { factor: "Project Management Level", impact: "Medium", description: "Coordination-only vs full PM scope" },
  { factor: "Multi-Site Rollout", impact: "High", description: "System thinking, phasing, standards development" },
  { factor: "Stakeholder Complexity", impact: "Medium", description: "Landlords, municipalities, brand standards" },
  { factor: "Rush Schedule", impact: "Adds 20-35%", description: "Priority scheduling, extended hours" },
];

const INCLUDED = [
  "Discovery & strategy sessions",
  "Scope definition and planning",
  "Sign family design and hierarchy",
  "Concept visuals and 3D mockups",
  "Message schedule and placement plans",
  "Material direction and specifications",
  "Production intent drawings",
  "Vendor bid package preparation",
  "Standards / criteria documentation",
  "Shop drawing review (if in scope)",
  "Project management (if in scope)",
  "Up to [X] revision rounds per scope",
  "Final file delivery and packaging",
];

const SEPARATE = [
  "Sign fabrication by vendor",
  "Installation labor and materials",
  "Permitting fees (city/county)",
  "Engineering or structural stamps",
  "Electrical work (conduit, power)",
  "Site survey by licensed surveyor",
  "Freight and shipping costs",
  "Sales tax on fabricated goods",
  "Photography of installed work",
  "Travel expenses (billed at cost + 10%)",
  "Municipal permit filing fees",
  "Additional revision rounds (change order)",
  "Ongoing maintenance post-closeout",
];

const ESTIMATE_TYPES = [
  { type: "Small Single-Tenant Retail", signs: "3–8 types", sqft: "Under 5,000", est: "$3,500 – $8,000" },
  { type: "Fitness Center / Gym", signs: "5–10 types", sqft: "5,000 – 20,000", est: "$8,000 – $18,000" },
  { type: "Multi-Tenant Strip Center", signs: "6–12 types", sqft: "20,000 – 60,000", est: "$12,000 – $28,000" },
  { type: "Mixed-Use Development", signs: "10–18 types", sqft: "50,000+", est: "$22,000 – $55,000" },
  { type: "Country Club / Private Club", signs: "8–15 types", sqft: "20,000 – 80,000", est: "$15,000 – $40,000" },
  { type: "Corporate Campus / Office Park", signs: "10–20 types", sqft: "50,000+", est: "$25,000 – $60,000" },
];

export default function PricingScope() {
  const [activeTab, setActiveTab] = useState<"rates" | "calculator" | "breakdown">("rates");
  const [calcInputs, setCalcInputs] = useState({
    envType: "Fitness Center / Gym", signTypes: 8, sqft: 15000,
    pmLevel: "coordination", rush: false, revisions: 2,
  });

  const baseEstimate = () => {
    const e = ESTIMATE_TYPES.find(e => e.type === calcInputs.envType);
    const [low, high] = e?.est?.replace(/\$|,/g, "").split(" – ").map(Number) || [5000, 15000];
    let mid = (low + high) / 2;
    if (calcInputs.rush) mid *= 1.25;
    if (calcInputs.revisions > 2) mid += (calcInputs.revisions - 2) * 800;
    return `$${mid.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  };

  const tabs = [
    { id: "rates", label: "Fee Schedule" },
    { id: "calculator", label: "Scope Calculator" },
    { id: "breakdown", label: "Inclusions" },
  ];

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="mb-6">
        <div className="saturn-label mb-1">PRICING + SCOPE</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "32px", fontWeight: 700, color: "#fff" }}>
          Investment Guide
        </h1>
        <p style={{ fontSize: "13px", color: "#8899bb", marginTop: "4px" }}>
          New Era Designs fee structure · March 2026
        </p>
      </div>
      <div className="saturn-rule mb-6" />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-lg" style={{ background: "#16213A", width: "fit-content" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)}
            className="px-4 py-2 rounded-md text-sm font-bold transition-all"
            style={{
              background: activeTab === t.id ? "#FCA311" : "transparent",
              color: activeTab === t.id ? "#0d1526" : "#8899bb",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Fee Schedule */}
      {activeTab === "rates" && (
        <div className="flex flex-col gap-6">
          <div className="saturn-card overflow-hidden">
            <div className="p-4 flex items-center gap-2" style={{ borderBottom: "1px solid #1e2d4d" }}>
              <DollarSign size={16} style={{ color: "#FCA311" }} />
              <span className="saturn-label">STANDARD FEE SCHEDULE · NED 2026</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#16213A" }}>
                    {["Service", "Billing Unit", "Fee Range", "Notes"].map(h => (
                      <th key={h} className="text-left px-4 py-3" style={{ fontSize: "10px", color: "#FCA311", letterSpacing: "0.1em", fontWeight: 700 }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FEE_TABLE.map((row, i) => (
                    <tr key={row.service} style={{ borderBottom: "1px solid #1e2d4d", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                      <td className="px-4 py-3" style={{ fontSize: "13px", color: "#fff", fontWeight: 600 }}>{row.service}</td>
                      <td className="px-4 py-3" style={{ fontSize: "12px", color: "#8899bb" }}>{row.unit}</td>
                      <td className="px-4 py-3" style={{ fontSize: "13px", color: "#FCA311", fontWeight: 700 }}>{row.range}</td>
                      <td className="px-4 py-3" style={{ fontSize: "12px", color: "#4a5a7a" }}>{row.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Scope Factors */}
          <div className="saturn-card p-5">
            <div className="saturn-label mb-4">PRIMARY PRICING FACTORS</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SCOPE_FACTORS.map(f => (
                <div key={f.factor} className="p-3 rounded-lg flex items-start gap-3"
                  style={{ background: "#16213A", border: "1px solid #1e2d4d" }}>
                  <div className="px-1.5 py-0.5 rounded text-xs font-bold flex-shrink-0 mt-0.5"
                    style={{ background: f.impact.includes("High") || f.impact.includes("Adds") ? "rgba(252,163,17,0.15)" : "rgba(136,153,187,0.15)",
                      color: f.impact.includes("High") || f.impact.includes("Adds") ? "#FCA311" : "#8899bb" }}>
                    {f.impact}
                  </div>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>{f.factor}</p>
                    <p style={{ fontSize: "12px", color: "#8899bb", marginTop: "2px" }}>{f.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Calculator */}
      {activeTab === "calculator" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="saturn-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calculator size={16} style={{ color: "#FCA311" }} />
              <span className="saturn-label">SCOPE ESTIMATOR</span>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="saturn-label block mb-1.5">ENVIRONMENT TYPE</label>
                <select value={calcInputs.envType} onChange={e => setCalcInputs(c => ({ ...c, envType: e.target.value }))}
                  className="w-full p-2.5 rounded-lg text-sm" style={{ background: "#16213A", border: "1px solid #1e2d4d", color: "#fff" }}>
                  {ESTIMATE_TYPES.map(e => <option key={e.type}>{e.type}</option>)}
                </select>
              </div>
              <div>
                <label className="saturn-label block mb-1.5">NUMBER OF SIGN TYPES</label>
                <input type="number" min={1} max={30} value={calcInputs.signTypes}
                  onChange={e => setCalcInputs(c => ({ ...c, signTypes: +e.target.value }))}
                  className="w-full p-2.5 rounded-lg text-sm" style={{ background: "#16213A", border: "1px solid #1e2d4d", color: "#fff" }} />
              </div>
              <div>
                <label className="saturn-label block mb-1.5">REVISION ROUNDS (standard = 2)</label>
                <input type="number" min={1} max={8} value={calcInputs.revisions}
                  onChange={e => setCalcInputs(c => ({ ...c, revisions: +e.target.value }))}
                  className="w-full p-2.5 rounded-lg text-sm" style={{ background: "#16213A", border: "1px solid #1e2d4d", color: "#fff" }} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: "#16213A", border: "1px solid #1e2d4d" }}>
                <label className="saturn-label">RUSH SCHEDULE (+25%)</label>
                <button onClick={() => setCalcInputs(c => ({ ...c, rush: !c.rush }))}
                  className="w-10 h-6 rounded-full transition-all relative"
                  style={{ background: calcInputs.rush ? "#FCA311" : "#2e3f66" }}>
                  <div className="w-4 h-4 rounded-full bg-white absolute top-1 transition-all"
                    style={{ left: calcInputs.rush ? "22px" : "4px" }} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="saturn-card p-5" style={{ background: "rgba(252,163,17,0.06)", borderColor: "rgba(252,163,17,0.2)" }}>
              <div className="saturn-label mb-2">ESTIMATED FEE</div>
              <div style={{ fontSize: "48px", fontWeight: 900, color: "#FCA311", lineHeight: 1 }}>{baseEstimate()}</div>
              <p style={{ fontSize: "12px", color: "#8899bb", marginTop: "8px" }}>
                Estimate based on {calcInputs.envType} · {calcInputs.signTypes} sign types · {calcInputs.revisions} revision rounds
                {calcInputs.rush ? " · Rush schedule" : ""}
              </p>
              <p style={{ fontSize: "11px", color: "#4a5a7a", marginTop: "8px" }}>
                All estimates are ballpark only. Final fee is based on written scope of work.
                Pricing excludes fabrication, installation, permitting, and engineering.
              </p>
            </div>

            <div className="saturn-card p-5">
              <div className="saturn-label mb-3">TYPICAL RANGES BY PROJECT TYPE</div>
              <div className="flex flex-col gap-2">
                {ESTIMATE_TYPES.map(e => (
                  <div key={e.type} className="flex items-center justify-between py-2"
                    style={{ borderBottom: "1px solid #1e2d4d" }}>
                    <span style={{ fontSize: "12px", color: "#8899bb" }}>{e.type}</span>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: calcInputs.envType === e.type ? "#FCA311" : "#fff" }}>{e.est}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inclusions */}
      {activeTab === "breakdown" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="saturn-card p-5">
            <div className="saturn-label mb-4" style={{ color: "#44c878" }}>INCLUDED IN NED FEE</div>
            <ul className="flex flex-col gap-2">
              {INCLUDED.map(item => (
                <li key={item} className="flex items-start gap-2 py-2" style={{ borderBottom: "1px solid #1e2d4d", fontSize: "13px", color: "#ccd5e8" }}>
                  <span style={{ color: "#44c878", marginTop: "1px", flexShrink: 0 }}>✓</span>{item}
                </li>
              ))}
            </ul>
          </div>
          <div className="saturn-card p-5">
            <div className="saturn-label mb-4" style={{ color: "#8899bb" }}>TYPICALLY SEPARATE / ADDITIONAL</div>
            <ul className="flex flex-col gap-2">
              {SEPARATE.map(item => (
                <li key={item} className="flex items-start gap-2 py-2" style={{ borderBottom: "1px solid #1e2d4d", fontSize: "13px", color: "#8899bb" }}>
                  <span style={{ color: "#4a5a7a", marginTop: "1px", flexShrink: 0 }}>·</span>{item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
