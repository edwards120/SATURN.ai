import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { routePrompt, checkProviderHealth } from "./llm";
import { getLLMConfig, ENV_TEMPLATE } from "./config";
import {
  insertProjectSchema,
  insertProposalSchema,
  insertDocumentSchema,
  insertTaskSchema,
  insertWorkflowStepSchema,
  insertMeetingNoteSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // ─── Projects ─────────────────────────────────────────────────────────────
  app.get("/api/projects", (_req, res) => {
    res.json(storage.getProjects());
  });

  app.get("/api/projects/:id", (req, res) => {
    const project = storage.getProject(Number(req.params.id));
    if (!project) return res.status(404).json({ error: "Not found" });
    res.json(project);
  });

  app.post("/api/projects", (req, res) => {
    const parsed = insertProjectSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    res.json(storage.createProject(parsed.data));
  });

  app.patch("/api/projects/:id", (req, res) => {
    const updated = storage.updateProject(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  });

  app.delete("/api/projects/:id", (req, res) => {
    storage.deleteProject(Number(req.params.id));
    res.json({ ok: true });
  });

  // ─── Proposals ────────────────────────────────────────────────────────────
  app.get("/api/proposals", (_req, res) => {
    res.json(storage.getProposals());
  });

  app.get("/api/proposals/:id", (req, res) => {
    const item = storage.getProposal(Number(req.params.id));
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  });

  app.post("/api/proposals", (req, res) => {
    const parsed = insertProposalSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    res.json(storage.createProposal(parsed.data));
  });

  app.patch("/api/proposals/:id", (req, res) => {
    const updated = storage.updateProposal(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  });

  app.delete("/api/proposals/:id", (req, res) => {
    storage.deleteProposal(Number(req.params.id));
    res.json({ ok: true });
  });

  // ─── Documents / Knowledge Base ───────────────────────────────────────────
  app.get("/api/documents", (_req, res) => {
    res.json(storage.getDocuments());
  });

  app.get("/api/documents/:id", (req, res) => {
    const item = storage.getDocument(Number(req.params.id));
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  });

  app.post("/api/documents", (req, res) => {
    const parsed = insertDocumentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    res.json(storage.createDocument(parsed.data));
  });

  app.patch("/api/documents/:id", (req, res) => {
    const updated = storage.updateDocument(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  });

  app.delete("/api/documents/:id", (req, res) => {
    storage.deleteDocument(Number(req.params.id));
    res.json({ ok: true });
  });

  // ─── Tasks ────────────────────────────────────────────────────────────────
  app.get("/api/tasks", (_req, res) => {
    res.json(storage.getTasks());
  });

  app.get("/api/tasks/:id", (req, res) => {
    const item = storage.getTask(Number(req.params.id));
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  });

  app.post("/api/tasks", (req, res) => {
    const parsed = insertTaskSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    res.json(storage.createTask(parsed.data));
  });

  app.patch("/api/tasks/:id", (req, res) => {
    const updated = storage.updateTask(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  });

  app.delete("/api/tasks/:id", (req, res) => {
    storage.deleteTask(Number(req.params.id));
    res.json({ ok: true });
  });

  // ─── Workflow Steps ───────────────────────────────────────────────────────
  app.get("/api/workflow-steps", (_req, res) => {
    res.json(storage.getWorkflowSteps());
  });

  // Seed default steps if none exist
  app.post("/api/workflow-steps/seed", (req, res) => {
    const steps = z.array(insertWorkflowStepSchema).safeParse(req.body);
    if (!steps.success) return res.status(400).json({ error: steps.error });
    res.json(storage.seedWorkflowSteps(steps.data));
  });

  // Reset all statuses to pending
  app.post("/api/workflow-steps/reset", (_req, res) => {
    storage.resetWorkflowSteps();
    res.json(storage.getWorkflowSteps());
  });

  // Patch by appId (string, not int)
  app.patch("/api/workflow-steps/:appId", (req, res) => {
    const updated = storage.upsertWorkflowStep(req.params.appId, req.body);
    res.json(updated);
  });

  // ─── Meeting Notes ────────────────────────────────────────────────────────
  app.get("/api/meeting-notes", (_req, res) => {
    res.json(storage.getMeetingNotes());
  });

  app.get("/api/meeting-notes/:id", (req, res) => {
    const item = storage.getMeetingNote(Number(req.params.id));
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  });

  app.post("/api/meeting-notes", (req, res) => {
    const parsed = insertMeetingNoteSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    res.json(storage.createMeetingNote(parsed.data));
  });

  app.patch("/api/meeting-notes/:id", (req, res) => {
    const updated = storage.updateMeetingNote(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  });

  app.delete("/api/meeting-notes/:id", (req, res) => {
    storage.deleteMeetingNote(Number(req.params.id));
    res.json({ ok: true });
  });

  // ─── Saturn AI Prompt Endpoint (Multi-LLM Router) ───────────────────────────
  app.post("/api/saturn/prompt", async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "prompt required" });

    try {
      const config = getLLMConfig();
      const result = await routePrompt(prompt, config);
      res.json({
        response: result.text,
        provider: result.provider,
        model: result.model,
        offline: result.offline,
        latencyMs: result.latencyMs,
      });
    } catch (err) {
      res.status(500).json({
        error: "LLM router error",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    }
  });

  // ─── LLM Health Check ─────────────────────────────────────────────────────
  app.get("/api/llm/health", async (_req, res) => {
    try {
      const config = getLLMConfig();
      const statuses = await checkProviderHealth(config);
      const online = typeof navigator !== "undefined" ? navigator.onLine : true;
      res.json({ statuses, online });
    } catch (err) {
      res.status(500).json({ error: "Health check failed", message: err instanceof Error ? err.message : "Unknown" });
    }
  });

  // ─── .env Template Download ───────────────────────────────────────────────
  app.get("/api/config/env-template", (_req, res) => {
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Content-Disposition", 'attachment; filename=".env"');
    res.send(ENV_TEMPLATE);
  });

  // ─── Config — current provider info (no secrets) ──────────────────────────
  app.get("/api/config/info", (_req, res) => {
    const config = getLLMConfig();
    res.json({
      provider: config.provider,
      ollamaUrl: config.ollamaUrl,
      ollamaModel: config.ollamaModel,
      openaiModel: config.openaiModel,
      anthropicModel: config.anthropicModel,
      geminiModel: config.geminiModel,
      hasOpenAI: !!config.openaiKey,
      hasAnthropic: !!config.anthropicKey,
      hasGemini: !!config.geminiKey,
    });
  });

  return httpServer;
}
