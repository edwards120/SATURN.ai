import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMeetingNoteSchema, type MeetingNote } from "@shared/schema";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Plus, FileText, Calendar, User, ChevronDown, ChevronUp,
  Trash2, CheckCircle2, AlertCircle, Pencil
} from "lucide-react";

const formSchema = insertMeetingNoteSchema.extend({
  title: z.string().min(2, "Meeting title required"),
  rawNotes: z.string().min(5, "Notes required"),
});
type FormValues = z.infer<typeof formSchema>;

function parseTasks(rawNotes: string): string[] {
  const lines = rawNotes.split("\n");
  return lines
    .filter(l => /^[-*•]\s+/i.test(l.trim()) || /^(action|todo|task):/i.test(l.trim()))
    .map(l => l.replace(/^[-*•]\s+/, "").replace(/^(action|todo|task):\s*/i, "").trim())
    .filter(Boolean)
    .slice(0, 10);
}

function parseDecisions(rawNotes: string): string[] {
  const lines = rawNotes.split("\n");
  return lines
    .filter(l => /^(decision|decided|agreed|approved):/i.test(l.trim()) || /✓/.test(l))
    .map(l => l.replace(/^(decision|decided|agreed|approved):\s*/i, "").replace(/✓\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 10);
}

function NoteCard({ note, onDelete, onEdit }: { note: MeetingNote; onDelete: (id: number) => void; onEdit: (n: MeetingNote) => void }) {
  const [expanded, setExpanded] = useState(false);
  const tasks = note.actionItems ? (JSON.parse(note.actionItems) as string[]) : parseTasks(note.rawNotes || "");
  const decisions = note.decisions ? (JSON.parse(note.decisions) as string[]) : parseDecisions(note.rawNotes || "");

  return (
    <div className="saturn-card overflow-hidden group" data-testid={`card-note-${note.id}`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[var(--saturn-text)] text-sm leading-tight">{note.title}</h3>
            <div className="flex items-center gap-3 mt-1 text-[10px] text-[var(--saturn-muted)]">
              {note.date && (
                <span className="flex items-center gap-1">
                  <Calendar size={9} />
                  {new Date(note.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              )}
              {note.attendees && (
                <span className="flex items-center gap-1">
                  <User size={9} />
                  {note.attendees}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(note)} className="p-1.5 rounded hover:bg-white/5 text-[var(--saturn-muted)] hover:text-[var(--saturn-text)] transition-colors" data-testid={`btn-edit-note-${note.id}`}>
              <Pencil size={12} />
            </button>
            <button onClick={() => onDelete(note.id)} className="p-1.5 rounded hover:bg-red-500/10 text-[var(--saturn-muted)] hover:text-red-400 transition-colors" data-testid={`btn-delete-note-${note.id}`}>
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {/* Action Items */}
        {tasks.length > 0 && (
          <div className="mb-2">
            <p className="text-[10px] text-[var(--saturn-muted)] uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <CheckCircle2 size={9} className="text-amber-400" /> Action Items
            </p>
            <ul className="space-y-1">
              {tasks.slice(0, expanded ? undefined : 3).map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] text-[var(--saturn-text)]">
                  <span className="w-3.5 h-3.5 mt-0.5 rounded-sm border border-amber-500/30 flex-shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Decisions */}
        {decisions.length > 0 && expanded && (
          <div className="mb-2">
            <p className="text-[10px] text-[var(--saturn-muted)] uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <AlertCircle size={9} className="text-blue-400" /> Decisions
            </p>
            <ul className="space-y-1">
              {decisions.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] text-[var(--saturn-text)]">
                  <span className="text-blue-400 mt-0.5">→</span>
                  {d}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Raw notes */}
        {expanded && note.rawNotes && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <p className="text-[10px] text-[var(--saturn-muted)] uppercase tracking-wider mb-1.5">Raw Notes</p>
            <p className="text-[11px] text-[var(--saturn-muted)] leading-relaxed whitespace-pre-wrap">{note.rawNotes}</p>
          </div>
        )}

        {/* Expand toggle */}
        {(tasks.length > 3 || decisions.length > 0 || note.rawNotes) && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 flex items-center gap-1 text-[10px] text-[var(--saturn-faint)] hover:text-[var(--saturn-muted)] transition-colors"
            data-testid={`btn-expand-note-${note.id}`}
          >
            {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            {expanded ? "Collapse" : `Show all${tasks.length > 3 ? ` (${tasks.length} actions)` : ""}`}
          </button>
        )}
      </div>

      {/* Tags */}
      {note.tags && (
        <div className="px-4 pb-3 flex flex-wrap gap-1">
          {note.tags.split(",").map(t => (
            <Badge key={t} variant="outline" className="text-[9px] px-1.5 py-0 border-white/10 text-[var(--saturn-faint)]">
              {t.trim()}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function NoteForm({ defaultValues, onSubmit, onCancel, isLoading }: {
  defaultValues?: Partial<FormValues>;
  onSubmit: (data: FormValues) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      rawNotes: "",
      date: new Date().toISOString().slice(0, 10),
      attendees: "",
      tags: "",
      projectId: null,
      ...defaultValues,
    },
  });

  const rawNotes = form.watch("rawNotes");
  const previewTasks = rawNotes ? parseTasks(rawNotes) : [];
  const previewDecisions = rawNotes ? parseDecisions(rawNotes) : [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="title" render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel className="text-xs text-[var(--saturn-muted)]">Meeting Title</FormLabel>
              <FormControl><Input data-testid="input-note-title" placeholder="Brand Discovery — Client Name" {...field} className="saturn-input" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="date" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-[var(--saturn-muted)]">Date</FormLabel>
              <FormControl><Input data-testid="input-note-date" type="date" {...field} value={field.value ?? ""} className="saturn-input" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="attendees" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-[var(--saturn-muted)]">Attendees</FormLabel>
              <FormControl><Input data-testid="input-note-attendees" placeholder="Chris, Client Name" {...field} value={field.value ?? ""} className="saturn-input" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="rawNotes" render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel className="text-xs text-[var(--saturn-muted)]">
                Raw Notes
                <span className="text-[var(--saturn-faint)] ml-2 font-normal">Use "- " for action items, "Decision: " for decisions</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  data-testid="input-raw-notes"
                  placeholder={`- Follow up on logo revisions\n- Send contract by EOD\nDecision: Navy colorway approved\n- Schedule kickoff for next week`}
                  {...field}
                  className="saturn-input min-h-[120px] font-mono text-xs"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="tags" render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel className="text-xs text-[var(--saturn-muted)]">Tags</FormLabel>
              <FormControl><Input data-testid="input-note-tags" placeholder="discovery, branding, kickoff" {...field} value={field.value ?? ""} className="saturn-input" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* Live parse preview */}
        {(previewTasks.length > 0 || previewDecisions.length > 0) && (
          <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/15 space-y-2">
            <p className="text-[10px] text-amber-400 uppercase tracking-wider">Saturn parsed:</p>
            {previewTasks.length > 0 && (
              <div>
                <p className="text-[10px] text-[var(--saturn-muted)] mb-1">{previewTasks.length} action items detected</p>
                <ul className="space-y-0.5">
                  {previewTasks.slice(0, 3).map((t, i) => (
                    <li key={i} className="text-[10px] text-[var(--saturn-text)] flex items-center gap-1.5">
                      <CheckCircle2 size={9} className="text-amber-400" /> {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {previewDecisions.length > 0 && (
              <div>
                <p className="text-[10px] text-[var(--saturn-muted)] mb-1">{previewDecisions.length} decision(s) detected</p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onCancel} className="text-[var(--saturn-muted)] hover:text-[var(--saturn-text)]">Cancel</Button>
          <Button type="submit" disabled={isLoading} data-testid="btn-submit-note" className="saturn-btn-primary">
            {isLoading ? "Saving..." : "Save Notes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function MeetingNotes() {
  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<MeetingNote | null>(null);
  const [search, setSearch] = useState("");

  const { data: notes = [], isLoading } = useQuery<MeetingNote[]>({
    queryKey: ["/api/meeting-notes"],
  });

  const createMutation = useMutation({
    mutationFn: (data: FormValues) => {
      const tasks = parseTasks(data.rawNotes || "");
      const decisions = parseDecisions(data.rawNotes || "");
      return apiRequest("POST", "/api/meeting-notes", {
        ...data,
        actionItems: JSON.stringify(tasks),
        decisions: JSON.stringify(decisions),
      });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/meeting-notes"] }); setOpen(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<FormValues> }) => {
      const tasks = parseTasks(data.rawNotes || "");
      const decisions = parseDecisions(data.rawNotes || "");
      return apiRequest("PATCH", `/api/meeting-notes/${id}`, {
        ...data,
        actionItems: JSON.stringify(tasks),
        decisions: JSON.stringify(decisions),
      });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/meeting-notes"] }); setEditTarget(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/meeting-notes/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/meeting-notes"] }),
  });

  const filtered = notes.filter(n =>
    !search || n.title.toLowerCase().includes(search.toLowerCase()) || (n.rawNotes || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--saturn-text)] tracking-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Meeting Notes
          </h1>
          <p className="text-xs text-[var(--saturn-muted)] mt-0.5">Raw notes → structured actions &amp; decisions</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search notes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="saturn-input h-8 text-xs w-48"
            data-testid="input-search-notes"
          />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button data-testid="btn-new-note" className="saturn-btn-primary text-xs h-8 px-3 gap-1.5">
                <Plus size={13} /> New Meeting
              </Button>
            </DialogTrigger>
            <DialogContent className="saturn-dialog max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-[var(--saturn-text)]">New Meeting Notes</DialogTitle>
              </DialogHeader>
              <NoteForm
                onSubmit={(data) => createMutation.mutate(data)}
                onCancel={() => setOpen(false)}
                isLoading={createMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Meetings", value: notes.length, icon: FileText },
          { label: "Action Items", value: notes.reduce((acc, n) => { try { return acc + (JSON.parse(n.actionItems || "[]") as string[]).length; } catch { return acc; } }, 0), icon: CheckCircle2 },
          { label: "Decisions Logged", value: notes.reduce((acc, n) => { try { return acc + (JSON.parse(n.decisions || "[]") as string[]).length; } catch { return acc; } }, 0), icon: AlertCircle },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="saturn-card p-4 flex items-center gap-3">
            <Icon size={16} className="text-[var(--saturn-amber)]" />
            <div>
              <p className="text-lg font-bold text-[var(--saturn-text)]">{value}</p>
              <p className="text-[10px] text-[var(--saturn-muted)] uppercase tracking-wider">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Notes List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-32 bg-white/5 rounded-lg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="saturn-card p-12 flex flex-col items-center gap-3 text-center">
          <FileText size={36} className="text-[var(--saturn-faint)]" />
          <p className="text-[var(--saturn-muted)] text-sm">{search ? "No matching notes." : "No meeting notes yet."}</p>
          <p className="text-[var(--saturn-faint)] text-xs">Log a meeting and Saturn extracts action items automatically.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              onDelete={(id) => deleteMutation.mutate(id)}
              onEdit={setEditTarget}
            />
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(v) => { if (!v) setEditTarget(null); }}>
        <DialogContent className="saturn-dialog max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[var(--saturn-text)]">Edit Notes</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <NoteForm
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
