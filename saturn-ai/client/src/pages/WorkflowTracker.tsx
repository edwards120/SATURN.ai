import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { WorkflowStep } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2, Circle, Clock, AlertTriangle,
  RefreshCw, ChevronRight, Layers, RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";

// The NED 5-app creative pipeline
const PIPELINE_APPS = [
  {
    id: "ai",
    name: "Adobe Illustrator",
    abbr: "Ai",
    color: "#FF9A00",
    description: "Vector artwork, logos, identity systems, brand marks",
    phase: "Concept / Identity",
    icon: "Ai",
  },
  {
    id: "skp",
    name: "SketchUp",
    abbr: "SKP",
    color: "#009AD7",
    description: "3D space planning, environmental concepts, spatial layout",
    phase: "3D / Spatial",
    icon: "SKP",
  },
  {
    id: "ecd",
    name: "ECDesign",
    abbr: "ECD",
    color: "#7C4DFF",
    description: "Environmental graphics, wayfinding, large-format concepts",
    phase: "Environmental",
    icon: "ECD",
  },
  {
    id: "ps",
    name: "Adobe Photoshop",
    abbr: "Ps",
    color: "#31A8FF",
    description: "Image retouching, compositing, texture, photo manipulation",
    phase: "Image / Composite",
    icon: "Ps",
  },
  {
    id: "indd",
    name: "Adobe InDesign",
    abbr: "INDD",
    color: "#FF3366",
    description: "Print layout, proposals, multi-page documents, deliverables",
    phase: "Production / Output",
    icon: "INDD",
  },
];

const STEP_STATUSES = ["pending", "in-progress", "complete", "blocked"] as const;
type StepStatus = typeof STEP_STATUSES[number];

const statusConfig: Record<StepStatus, { icon: typeof Circle; color: string; label: string }> = {
  pending: { icon: Circle, color: "text-[var(--saturn-faint)]", label: "Pending" },
  "in-progress": { icon: Clock, color: "text-amber-400", label: "In Progress" },
  complete: { icon: CheckCircle2, color: "text-green-400", label: "Complete" },
  blocked: { icon: AlertTriangle, color: "text-red-400", label: "Blocked" },
};

// Seed default workflow steps if empty
const DEFAULT_STEPS = PIPELINE_APPS.map((app, i) => ({
  appId: app.id,
  appName: app.name,
  description: app.description,
  phase: app.phase,
  order: i + 1,
  status: "pending" as StepStatus,
  notes: "",
  projectId: null,
}));

function AppBadge({ abbr, color }: { abbr: string; color: string }) {
  return (
    <div
      className="w-10 h-10 rounded-lg flex items-center justify-center text-[10px] font-black tracking-tight border"
      style={{ borderColor: color + "40", backgroundColor: color + "15", color }}
    >
      {abbr}
    </div>
  );
}

function StepCard({
  step,
  app,
  index,
  isLast,
  onStatusChange,
  onNotesChange,
}: {
  step: WorkflowStep | null;
  app: typeof PIPELINE_APPS[0];
  index: number;
  isLast: boolean;
  onStatusChange: (appId: string, status: StepStatus) => void;
  onNotesChange: (appId: string, notes: string) => void;
}) {
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(step?.notes || "");
  const status = (step?.status as StepStatus) ?? "pending";
  const { icon: Icon, color, label } = statusConfig[status];

  const cycleStatus = () => {
    const idx = STEP_STATUSES.indexOf(status);
    const next = STEP_STATUSES[(idx + 1) % STEP_STATUSES.length];
    onStatusChange(app.id, next);
  };

  return (
    <div className="flex items-stretch gap-0">
      {/* Step Card */}
      <div className={`saturn-card flex-1 p-4 transition-colors ${status === "in-progress" ? "border-amber-500/40 bg-amber-500/3" : status === "complete" ? "border-green-500/30 bg-green-500/3" : status === "blocked" ? "border-red-500/30" : ""}`} data-testid={`card-step-${app.id}`}>
        <div className="flex items-start gap-3">
          <AppBadge abbr={app.abbr} color={app.color} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <div>
                <span className="text-[10px] text-[var(--saturn-faint)] uppercase tracking-wider">{app.phase}</span>
                <h3 className="text-sm font-semibold text-[var(--saturn-text)] leading-tight">{app.name}</h3>
              </div>
              {/* Status toggle */}
              <button
                onClick={cycleStatus}
                data-testid={`btn-status-${app.id}`}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-medium transition-all hover:scale-105 ${
                  status === "in-progress" ? "bg-amber-500/15 border-amber-500/30 text-amber-400" :
                  status === "complete" ? "bg-green-500/15 border-green-500/30 text-green-400" :
                  status === "blocked" ? "bg-red-500/15 border-red-500/30 text-red-400" :
                  "bg-white/5 border-white/10 text-[var(--saturn-muted)]"
                }`}
                title="Click to cycle status"
              >
                <Icon size={10} />
                {label}
              </button>
            </div>
            <p className="text-[11px] text-[var(--saturn-muted)] mt-1">{app.description}</p>

            {/* Notes */}
            <div className="mt-2">
              {editingNotes ? (
                <div className="flex gap-2">
                  <input
                    className="flex-1 text-xs bg-white/5 border border-white/10 rounded px-2 py-1 text-[var(--saturn-text)] outline-none focus:border-amber-500/40"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Add notes..."
                    data-testid={`input-notes-${app.id}`}
                    autoFocus
                  />
                  <button
                    className="text-[10px] text-amber-400 hover:text-amber-300 px-2"
                    onClick={() => { onNotesChange(app.id, notes); setEditingNotes(false); }}
                  >Save</button>
                  <button className="text-[10px] text-[var(--saturn-muted)] px-1" onClick={() => setEditingNotes(false)}>✕</button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingNotes(true)}
                  className="text-[10px] text-[var(--saturn-faint)] hover:text-[var(--saturn-muted)] text-left w-full"
                  data-testid={`btn-notes-${app.id}`}
                >
                  {notes || <span className="italic">+ add step notes</span>}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Arrow connector */}
      {!isLast && (
        <div className="flex items-center px-1">
          <ChevronRight size={16} className="text-[var(--saturn-faint)]" />
        </div>
      )}
    </div>
  );
}

export default function WorkflowTracker() {
  const { data: steps = [], isLoading } = useQuery<WorkflowStep[]>({
    queryKey: ["/api/workflow-steps"],
  });

  const updateMutation = useMutation({
    mutationFn: ({ appId, data }: { appId: string; data: Partial<WorkflowStep> }) =>
      apiRequest("PATCH", `/api/workflow-steps/${appId}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/workflow-steps"] }),
  });

  const resetMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/workflow-steps/reset"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/workflow-steps"] }),
  });

  const seedMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/workflow-steps/seed", DEFAULT_STEPS),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/workflow-steps"] }),
  });

  // Merge pipeline definition with live step data
  const mergedSteps = PIPELINE_APPS.map(app => ({
    app,
    step: steps.find(s => s.appId === app.id) || null,
  }));

  const completedCount = mergedSteps.filter(({ step }) => step?.status === "complete").length;
  const inProgressCount = mergedSteps.filter(({ step }) => step?.status === "in-progress").length;
  const blockedCount = mergedSteps.filter(({ step }) => step?.status === "blocked").length;
  const progressPct = Math.round((completedCount / PIPELINE_APPS.length) * 100);

  const handleStatusChange = (appId: string, status: StepStatus) => {
    const existing = steps.find(s => s.appId === appId);
    if (existing) {
      updateMutation.mutate({ appId, data: { status } });
    } else {
      seedMutation.mutate();
    }
  };

  const handleNotesChange = (appId: string, notes: string) => {
    updateMutation.mutate({ appId, data: { notes } });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--saturn-text)] tracking-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Workflow Tracker
          </h1>
          <p className="text-xs text-[var(--saturn-muted)] mt-0.5">NED production pipeline — Ai → SKP → ECD → Ps → INDD</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => resetMutation.mutate()}
          disabled={resetMutation.isPending}
          data-testid="btn-reset-workflow"
          className="text-[var(--saturn-muted)] hover:text-[var(--saturn-text)] text-xs gap-1.5"
        >
          <RotateCcw size={12} />
          Reset
        </Button>
      </div>

      {/* Progress Summary */}
      <div className="saturn-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-black text-[var(--saturn-amber)]">{progressPct}%</p>
              <p className="text-[10px] text-[var(--saturn-muted)] uppercase tracking-wider">Complete</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <Clock size={11} className="text-amber-400" />
                <span className="text-[var(--saturn-muted)]">{inProgressCount} In Progress</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={11} className="text-green-400" />
                <span className="text-[var(--saturn-muted)]">{completedCount} Complete</span>
              </div>
              {blockedCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <AlertTriangle size={11} className="text-red-400" />
                  <span className="text-red-400">{blockedCount} Blocked</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            {PIPELINE_APPS.map((app, i) => {
              const step = steps.find(s => s.appId === app.id);
              const status = (step?.status as StepStatus) ?? "pending";
              return (
                <div
                  key={app.id}
                  className="w-6 h-6 rounded flex items-center justify-center text-[8px] font-black"
                  style={{
                    backgroundColor: status === "complete" ? "#22c55e20" : status === "in-progress" ? app.color + "20" : "rgba(255,255,255,0.05)",
                    color: status === "complete" ? "#22c55e" : status === "in-progress" ? app.color : "var(--saturn-faint)",
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderColor: status === "complete" ? "#22c55e40" : status === "in-progress" ? app.color + "40" : "rgba(255,255,255,0.08)",
                  }}
                  title={app.name}
                >
                  {app.abbr.slice(0, 2)}
                </div>
              );
            })}
          </div>
        </div>
        <Progress value={progressPct} className="h-1.5 bg-white/5" />
      </div>

      {/* Pipeline Steps */}
      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-24 bg-white/5 rounded-lg" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {mergedSteps.map(({ app, step }, index) => (
            <StepCard
              key={app.id}
              step={step}
              app={app}
              index={index}
              isLast={index === PIPELINE_APPS.length - 1}
              onStatusChange={handleStatusChange}
              onNotesChange={handleNotesChange}
            />
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="saturn-card p-4">
        <p className="text-[10px] text-[var(--saturn-muted)] uppercase tracking-wider mb-2">Status Guide</p>
        <div className="flex flex-wrap gap-4">
          {STEP_STATUSES.map(s => {
            const { icon: Icon, color, label } = statusConfig[s];
            return (
              <div key={s} className="flex items-center gap-1.5 text-xs text-[var(--saturn-muted)]">
                <Icon size={11} className={color} />
                {label} — click the badge to cycle status
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
