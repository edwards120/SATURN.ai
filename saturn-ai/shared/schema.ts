import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ─── Projects ───────────────────────────────────────────────────────────────
export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  clientName: text("client_name").notNull(),
  code: text("code"), // NED-0001
  status: text("status").notNull().default("active"), // active, on-hold, completed, cancelled
  currentPhase: text("current_phase").default("Discovery"), // Discovery, Concept, Development, Production, Delivery, Closeout
  budget: real("budget"),
  deadline: text("deadline"),
  tags: text("tags"),
  notes: text("notes"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true });
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// ─── Proposals ──────────────────────────────────────────────────────────────
export const proposals = sqliteTable("proposals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  proposalId: text("proposal_id").notNull(), // NED-0001
  client: text("client").notNull(),
  projectName: text("project_name").notNull(),
  projectType: text("project_type").notNull(),
  executiveSummary: text("executive_summary"),
  businessObjective: text("business_objective"),
  visualScope: text("visual_scope"),
  operationalImpact: text("operational_impact"),
  proposedScope: text("proposed_scope"), // JSON array
  deliverables: text("deliverables"), // JSON array
  phase1: text("phase1"),
  phase2: text("phase2"),
  phase3: text("phase3"),
  durationWeeks: text("duration_weeks"),
  baseFee: text("base_fee"),
  addOns: text("add_ons"),
  estimatedTotal: text("estimated_total"),
  paymentStructure: text("payment_structure").default("50% upfront / 50% at final delivery"),
  assumptions: text("assumptions"),
  status: text("status").notNull().default("draft"), // draft, sent, approved, declined
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const insertProposalSchema = createInsertSchema(proposals).omit({ id: true, createdAt: true });
export type InsertProposal = z.infer<typeof insertProposalSchema>;
export type Proposal = typeof proposals.$inferSelect;

// ─── Documents / Knowledge Base ─────────────────────────────────────────────
export const documents = sqliteTable("documents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  category: text("category").notNull(), // pricing, process, template, project, notes, standards
  content: text("content").notNull(),
  tags: text("tags"),
  projectId: integer("project_id"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, createdAt: true });
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

// ─── Tasks ──────────────────────────────────────────────────────────────────
export const tasks = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").notNull().default("medium"), // high, medium, low
  status: text("status").notNull().default("pending"), // pending, in-progress, complete
  projectId: integer("project_id"),
  dueDate: text("due_date"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true });
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// ─── Workflow Steps (5-App Pipeline) ────────────────────────────────────────
export const workflowSteps = sqliteTable("workflow_steps", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  appId: text("app_id").notNull(), // ai, skp, ecd, ps, indd
  appName: text("app_name").notNull(),
  description: text("description"),
  phase: text("phase"),
  order: integer("order").notNull().default(0),
  status: text("status").notNull().default("pending"), // pending, in-progress, complete, blocked
  notes: text("notes"),
  projectId: integer("project_id"),
  completedAt: text("completed_at"),
});

export const insertWorkflowStepSchema = createInsertSchema(workflowSteps).omit({ id: true });
export type InsertWorkflowStep = z.infer<typeof insertWorkflowStepSchema>;
export type WorkflowStep = typeof workflowSteps.$inferSelect;

// ─── Meeting Notes ───────────────────────────────────────────────────────────
export const meetingNotes = sqliteTable("meeting_notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  rawNotes: text("raw_notes"),
  actionItems: text("action_items"), // JSON array
  decisions: text("decisions"), // JSON array
  attendees: text("attendees"),
  date: text("date"),
  tags: text("tags"),
  projectId: integer("project_id"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const insertMeetingNoteSchema = createInsertSchema(meetingNotes).omit({ id: true, createdAt: true });
export type InsertMeetingNote = z.infer<typeof insertMeetingNoteSchema>;
export type MeetingNote = typeof meetingNotes.$inferSelect;
