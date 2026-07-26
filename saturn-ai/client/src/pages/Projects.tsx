import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProjectSchema, type Project } from "@shared/schema";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus, FolderOpen, Calendar, DollarSign, ArrowRight,
  Layers, Clock, CheckCircle2, AlertCircle, Pencil, Trash2, User
} from "lucide-react";

const phases = ["Discovery", "Concept", "Development", "Production", "Delivery", "Closeout"];
const statuses = ["active", "on-hold", "completed", "cancelled"];
const statusColors: Record<string, string> = {
  active: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "on-hold": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};
const phaseIndex: Record<string, number> = {};
phases.forEach((p, i) => { phaseIndex[p] = i; });

const formSchema = insertProjectSchema.extend({
  name: z.string().min(2, "Project name required"),
  clientName: z.string().min(1, "Client name required"),
});
type FormValues = z.infer<typeof formSchema>;

function ProjectCard({ project, onEdit, onDelete }: { project: Project; onEdit: (p: Project) => void; onDelete: (id: number) => void }) {
  const phase = project.currentPhase || "Discovery";
  const progress = Math.round(((phaseIndex[phase] ?? 0) / (phases.length - 1)) * 100);
  const statusClass = statusColors[project.status] ?? statusColors.active;
  const budget = project.budget ? `$${Number(project.budget).toLocaleString()}` : "—";

  return (
    <div className="saturn-card p-5 flex flex-col gap-4 group hover:border-amber-500/40 transition-colors" data-testid={`card-project-${project.id}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono text-[var(--saturn-muted)] tracking-widest uppercase">{project.code || "NED-0000"}</span>
            <Badge variant="outline" className={`text-[10px] px-2 py-0 ${statusClass}`}>{project.status}</Badge>
          </div>
          <h3 className="font-semibold text-[var(--saturn-text)] text-base leading-tight truncate">{project.name}</h3>
          <div className="flex items-center gap-1 mt-1 text-xs text-[var(--saturn-muted)]">
            <User size={11} />
            <span>{project.clientName}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(project)} className="p-1.5 rounded hover:bg-white/5 text-[var(--saturn-muted)] hover:text-[var(--saturn-text)] transition-colors" data-testid={`btn-edit-project-${project.id}`}>
            <Pencil size={13} />
          </button>
          <button onClick={() => onDelete(project.id)} className="p-1.5 rounded hover:bg-red-500/10 text-[var(--saturn-muted)] hover:text-red-400 transition-colors" data-testid={`btn-delete-project-${project.id}`}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Phase Progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-[var(--saturn-muted)] uppercase tracking-wider">Phase</span>
          <span className="text-[11px] font-medium text-[var(--saturn-amber)]">{phase}</span>
        </div>
        <Progress value={progress} className="h-1.5 bg-white/5" />
        <div className="flex justify-between mt-1.5">
          {phases.map((p, i) => (
            <div
              key={p}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i <= (phaseIndex[phase] ?? 0)
                  ? "bg-amber-400"
                  : "bg-white/10"
              }`}
              title={p}
            />
          ))}
        </div>
      </div>

      {/* Meta Row */}
      <div className="flex items-center justify-between text-[11px] text-[var(--saturn-muted)] pt-1 border-t border-white/5">
        <div className="flex items-center gap-1">
          <DollarSign size={11} />
          <span>{budget}</span>
        </div>
        {project.deadline && (
          <div className="flex items-center gap-1">
            <Calendar size={11} />
            <span>{new Date(project.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          </div>
        )}
        {project.tags && (
          <div className="flex items-center gap-1">
            <Layers size={11} />
            <span className="truncate max-w-[80px]">{project.tags}</span>
          </div>
        )}
      </div>

      {/* Notes */}
      {project.notes && (
        <p className="text-[11px] text-[var(--saturn-faint)] line-clamp-2 leading-relaxed">{project.notes}</p>
      )}
    </div>
  );
}

function ProjectForm({ defaultValues, onSubmit, onCancel, isLoading }: {
  defaultValues?: Partial<FormValues>;
  onSubmit: (data: FormValues) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      clientName: "",
      code: "",
      status: "active",
      currentPhase: "Discovery",
      budget: undefined,
      deadline: "",
      tags: "",
      notes: "",
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel className="text-xs text-[var(--saturn-muted)]">Project Name</FormLabel>
              <FormControl><Input data-testid="input-project-name" placeholder="Brand Identity System" {...field} className="saturn-input" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="clientName" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-[var(--saturn-muted)]">Client</FormLabel>
              <FormControl><Input data-testid="input-client-name" placeholder="Acme Corp" {...field} className="saturn-input" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="code" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-[var(--saturn-muted)]">Project Code</FormLabel>
              <FormControl><Input data-testid="input-project-code" placeholder="NED-0001" {...field} value={field.value ?? ''} className="saturn-input" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-[var(--saturn-muted)]">Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value ?? "active"}>
                <FormControl><SelectTrigger data-testid="select-status" className="saturn-input"><SelectValue /></SelectTrigger></FormControl>
                <SelectContent className="saturn-popover">
                  {statuses.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="currentPhase" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-[var(--saturn-muted)]">Current Phase</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value ?? "Discovery"}>
                <FormControl><SelectTrigger data-testid="select-phase" className="saturn-input"><SelectValue /></SelectTrigger></FormControl>
                <SelectContent className="saturn-popover">
                  {phases.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="budget" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-[var(--saturn-muted)]">Budget ($)</FormLabel>
              <FormControl>
                <Input
                  data-testid="input-budget"
                  type="number"
                  placeholder="5000"
                  {...field}
                  value={field.value ?? ""}
                  onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  className="saturn-input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="deadline" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-[var(--saturn-muted)]">Deadline</FormLabel>
              <FormControl><Input data-testid="input-deadline" type="date" {...field} value={field.value ?? ""} className="saturn-input" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="tags" render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel className="text-xs text-[var(--saturn-muted)]">Tags / Service Type</FormLabel>
              <FormControl><Input data-testid="input-tags" placeholder="Branding, Print, Identity" {...field} value={field.value ?? ""} className="saturn-input" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="notes" render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel className="text-xs text-[var(--saturn-muted)]">Notes</FormLabel>
              <FormControl><Textarea data-testid="input-notes" placeholder="Project context, special requirements..." {...field} value={field.value ?? ""} className="saturn-input min-h-[80px]" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onCancel} className="text-[var(--saturn-muted)] hover:text-[var(--saturn-text)]">Cancel</Button>
          <Button type="submit" disabled={isLoading} data-testid="btn-submit-project" className="saturn-btn-primary">
            {isLoading ? "Saving..." : "Save Project"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function Projects() {
  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Project | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const createMutation = useMutation({
    mutationFn: (data: FormValues) => apiRequest("POST", "/api/projects", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/projects"] }); setOpen(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<FormValues> }) => apiRequest("PATCH", `/api/projects/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/projects"] }); setEditTarget(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/projects/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/projects"] }),
  });

  const filtered = filter === "all" ? projects : projects.filter(p => p.status === filter);
  const counts = statuses.reduce((acc, s) => ({ ...acc, [s]: projects.filter(p => p.status === s).length }), {} as Record<string, number>);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--saturn-text)] tracking-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Project Memory
          </h1>
          <p className="text-xs text-[var(--saturn-muted)] mt-0.5">Active engagements, phases &amp; client records</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="btn-new-project" className="saturn-btn-primary text-xs h-8 px-3 gap-1.5">
              <Plus size={13} /> New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="saturn-dialog max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-[var(--saturn-text)]">New Project</DialogTitle>
            </DialogHeader>
            <ProjectForm
              onSubmit={(data) => createMutation.mutate(data)}
              onCancel={() => setOpen(false)}
              isLoading={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-5 gap-3">
        {[{ label: "All", value: "all", count: projects.length, icon: FolderOpen },
          { label: "Active", value: "active", count: counts.active || 0, icon: CheckCircle2 },
          { label: "On Hold", value: "on-hold", count: counts["on-hold"] || 0, icon: Clock },
          { label: "Completed", value: "completed", count: counts.completed || 0, icon: ArrowRight },
          { label: "Cancelled", value: "cancelled", count: counts.cancelled || 0, icon: AlertCircle }
        ].map(({ label, value, count, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            data-testid={`filter-${value}`}
            className={`saturn-card p-3 text-left transition-colors ${filter === value ? "border-amber-500/50 bg-amber-500/5" : "hover:border-white/15"}`}
          >
            <div className="flex items-center justify-between mb-1">
              <Icon size={12} className={filter === value ? "text-amber-400" : "text-[var(--saturn-muted)]"} />
              <span className={`text-lg font-bold ${filter === value ? "text-amber-400" : "text-[var(--saturn-text)]"}`}>{count}</span>
            </div>
            <p className="text-[10px] text-[var(--saturn-muted)] uppercase tracking-wider">{label}</p>
          </button>
        ))}
      </div>

      {/* Project Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-48 bg-white/5 rounded-lg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="saturn-card p-12 flex flex-col items-center gap-3 text-center">
          <FolderOpen size={36} className="text-[var(--saturn-faint)]" />
          <p className="text-[var(--saturn-muted)] text-sm">No projects yet.</p>
          <p className="text-[var(--saturn-faint)] text-xs">Every engagement starts here. Add your first project above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => (
            <ProjectCard
              key={p.id}
              project={p}
              onEdit={setEditTarget}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(v) => { if (!v) setEditTarget(null); }}>
        <DialogContent className="saturn-dialog max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[var(--saturn-text)]">Edit Project</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <ProjectForm
              defaultValues={editTarget as Partial<FormValues>}
              onSubmit={(data) => updateMutation.mutate({ id: editTarget.id, data })}
              onCancel={() => setEditTarget(null)}
              isLoading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
