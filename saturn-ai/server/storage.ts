import { db } from "./db";
import {
  projects, proposals, documents, tasks, workflowSteps, meetingNotes,
  type Project, type InsertProject,
  type Proposal, type InsertProposal,
  type Document, type InsertDocument,
  type Task, type InsertTask,
  type WorkflowStep, type InsertWorkflowStep,
  type MeetingNote, type InsertMeetingNote,
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Projects
  getProjects(): Project[];
  getProject(id: number): Project | undefined;
  createProject(data: InsertProject): Project;
  updateProject(id: number, data: Partial<InsertProject>): Project | undefined;
  deleteProject(id: number): void;

  // Proposals
  getProposals(): Proposal[];
  getProposal(id: number): Proposal | undefined;
  createProposal(data: InsertProposal): Proposal;
  updateProposal(id: number, data: Partial<InsertProposal>): Proposal | undefined;
  deleteProposal(id: number): void;

  // Documents
  getDocuments(): Document[];
  getDocument(id: number): Document | undefined;
  createDocument(data: InsertDocument): Document;
  updateDocument(id: number, data: Partial<InsertDocument>): Document | undefined;
  deleteDocument(id: number): void;

  // Tasks
  getTasks(): Task[];
  getTask(id: number): Task | undefined;
  createTask(data: InsertTask): Task;
  updateTask(id: number, data: Partial<InsertTask>): Task | undefined;
  deleteTask(id: number): void;

  // Workflow Steps
  getWorkflowSteps(): WorkflowStep[];
  getWorkflowStep(appId: string): WorkflowStep | undefined;
  upsertWorkflowStep(appId: string, data: Partial<InsertWorkflowStep>): WorkflowStep;
  seedWorkflowSteps(steps: InsertWorkflowStep[]): WorkflowStep[];
  resetWorkflowSteps(): void;

  // Meeting Notes
  getMeetingNotes(): MeetingNote[];
  getMeetingNote(id: number): MeetingNote | undefined;
  createMeetingNote(data: InsertMeetingNote): MeetingNote;
  updateMeetingNote(id: number, data: Partial<InsertMeetingNote>): MeetingNote | undefined;
  deleteMeetingNote(id: number): void;
}

export class DatabaseStorage implements IStorage {
  // ─── Projects ────────────────────────────────────────────────────────────
  getProjects(): Project[] {
    return db.select().from(projects).all();
  }
  getProject(id: number): Project | undefined {
    return db.select().from(projects).where(eq(projects.id, id)).get();
  }
  createProject(data: InsertProject): Project {
    return db.insert(projects).values(data).returning().get();
  }
  updateProject(id: number, data: Partial<InsertProject>): Project | undefined {
    return db.update(projects).set(data).where(eq(projects.id, id)).returning().get();
  }
  deleteProject(id: number): void {
    db.delete(projects).where(eq(projects.id, id)).run();
  }

  // ─── Proposals ───────────────────────────────────────────────────────────
  getProposals(): Proposal[] {
    return db.select().from(proposals).all();
  }
  getProposal(id: number): Proposal | undefined {
    return db.select().from(proposals).where(eq(proposals.id, id)).get();
  }
  createProposal(data: InsertProposal): Proposal {
    return db.insert(proposals).values(data).returning().get();
  }
  updateProposal(id: number, data: Partial<InsertProposal>): Proposal | undefined {
    return db.update(proposals).set(data).where(eq(proposals.id, id)).returning().get();
  }
  deleteProposal(id: number): void {
    db.delete(proposals).where(eq(proposals.id, id)).run();
  }

  // ─── Documents ───────────────────────────────────────────────────────────
  getDocuments(): Document[] {
    return db.select().from(documents).all();
  }
  getDocument(id: number): Document | undefined {
    return db.select().from(documents).where(eq(documents.id, id)).get();
  }
  createDocument(data: InsertDocument): Document {
    return db.insert(documents).values(data).returning().get();
  }
  updateDocument(id: number, data: Partial<InsertDocument>): Document | undefined {
    return db.update(documents).set(data).where(eq(documents.id, id)).returning().get();
  }
  deleteDocument(id: number): void {
    db.delete(documents).where(eq(documents.id, id)).run();
  }

  // ─── Tasks ───────────────────────────────────────────────────────────────
  getTasks(): Task[] {
    return db.select().from(tasks).all();
  }
  getTask(id: number): Task | undefined {
    return db.select().from(tasks).where(eq(tasks.id, id)).get();
  }
  createTask(data: InsertTask): Task {
    return db.insert(tasks).values(data).returning().get();
  }
  updateTask(id: number, data: Partial<InsertTask>): Task | undefined {
    return db.update(tasks).set(data).where(eq(tasks.id, id)).returning().get();
  }
  deleteTask(id: number): void {
    db.delete(tasks).where(eq(tasks.id, id)).run();
  }

  // ─── Workflow Steps ───────────────────────────────────────────────────────
  getWorkflowSteps(): WorkflowStep[] {
    return db.select().from(workflowSteps).all();
  }
  getWorkflowStep(appId: string): WorkflowStep | undefined {
    return db.select().from(workflowSteps).where(eq(workflowSteps.appId, appId)).get();
  }
  upsertWorkflowStep(appId: string, data: Partial<InsertWorkflowStep>): WorkflowStep {
    const existing = this.getWorkflowStep(appId);
    if (existing) {
      return db.update(workflowSteps).set(data).where(eq(workflowSteps.appId, appId)).returning().get()!;
    }
    return db.insert(workflowSteps).values({ appId, appName: appId, order: 0, ...data } as InsertWorkflowStep).returning().get();
  }
  seedWorkflowSteps(steps: InsertWorkflowStep[]): WorkflowStep[] {
    const result: WorkflowStep[] = [];
    for (const step of steps) {
      const existing = this.getWorkflowStep(step.appId);
      if (!existing) {
        result.push(db.insert(workflowSteps).values(step).returning().get());
      } else {
        result.push(existing);
      }
    }
    return result;
  }
  resetWorkflowSteps(): void {
    db.update(workflowSteps).set({ status: "pending", notes: "", completedAt: null }).run();
  }

  // ─── Meeting Notes ────────────────────────────────────────────────────────
  getMeetingNotes(): MeetingNote[] {
    return db.select().from(meetingNotes).all();
  }
  getMeetingNote(id: number): MeetingNote | undefined {
    return db.select().from(meetingNotes).where(eq(meetingNotes.id, id)).get();
  }
  createMeetingNote(data: InsertMeetingNote): MeetingNote {
    return db.insert(meetingNotes).values(data).returning().get();
  }
  updateMeetingNote(id: number, data: Partial<InsertMeetingNote>): MeetingNote | undefined {
    return db.update(meetingNotes).set(data).where(eq(meetingNotes.id, id)).returning().get();
  }
  deleteMeetingNote(id: number): void {
    db.delete(meetingNotes).where(eq(meetingNotes.id, id)).run();
  }
}

export const storage = new DatabaseStorage();
