/**
 * Saturn AI — Integration Layer
 * Proxies Gmail, Google Calendar, and Google Drive through the backend
 * so the frontend never touches auth tokens directly.
 *
 * In the deployed web version, these endpoints call Perplexity's connected
 * tool layer. In the local install, they can be swapped for direct OAuth.
 */

import type { Express } from "express";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SaturnEmail {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  date: string;
  labels: string[];
  isUnread: boolean;
  isImportant: boolean;
}

export interface SaturnCalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: string;
  description?: string;
  attendees?: string[];
}

export interface SaturnBrief {
  generatedAt: string;
  unreadCount: number;
  upcomingEvents: SaturnCalendarEvent[];
  importantEmails: SaturnEmail[];
  actionItems: string[];
}

// ─── Register Integration Routes ─────────────────────────────────────────────

export function registerIntegrationRoutes(app: Express) {

  /**
   * GET /api/integrations/status
   * Returns which integrations are configured
   */
  app.get("/api/integrations/status", (_req, res) => {
    res.json({
      gmail: { connected: false, label: "Gmail", description: "Scan inbox for client emails" },
      gcal: { connected: false, label: "Google Calendar", description: "Sync meetings and deadlines" },
      gdrive: { connected: false, label: "Google Drive", description: "Export proposals and deliverables" },
      ollama: { connected: false, label: "Ollama (Local LLM)", description: "AI responses via local model" },
      slack: { connected: false, label: "Slack", description: "Client and team notifications" },
      notion: { connected: false, label: "Notion", description: "Sync project documentation" },
    });
  });

  /**
   * POST /api/integrations/gmail/scan
   * Scans inbox for client-relevant emails
   * Body: { query?: string, maxResults?: number }
   */
  app.post("/api/integrations/gmail/scan", async (req, res) => {
    // In local install: swap this for direct Gmail OAuth API call
    // In deployed version: Saturn uses Perplexity's connected Gmail tool
    res.json({
      status: "not_configured",
      message: "Connect Gmail in Settings → Integrations to enable inbox scanning.",
      emails: [],
    });
  });

  /**
   * GET /api/integrations/calendar/upcoming
   * Returns upcoming calendar events (next 7 days)
   */
  app.get("/api/integrations/calendar/upcoming", async (_req, res) => {
    res.json({
      status: "not_configured",
      message: "Connect Google Calendar in Settings → Integrations to see your schedule.",
      events: [],
    });
  });

  /**
   * POST /api/integrations/drive/export
   * Exports a file (proposal, doc) to Google Drive
   * Body: { type: "proposal" | "document", id: number, filename: string }
   */
  app.post("/api/integrations/drive/export", async (req, res) => {
    const { type, id, filename } = req.body;
    if (!type || !id || !filename) {
      return res.status(400).json({ error: "type, id, and filename required" });
    }
    res.json({
      status: "not_configured",
      message: "Connect Google Drive in Settings → Integrations to export files.",
    });
  });

  /**
   * GET /api/integrations/brief
   * Returns Saturn's daily brief — emails + calendar + tasks combined
   */
  app.get("/api/integrations/brief", async (_req, res) => {
    const brief: SaturnBrief = {
      generatedAt: new Date().toISOString(),
      unreadCount: 0,
      upcomingEvents: [],
      importantEmails: [],
      actionItems: [
        "Connect Gmail to scan client inbox",
        "Connect Google Calendar to sync meetings",
        "Configure Ollama in Settings for AI responses",
      ],
    };
    res.json(brief);
  });

  /**
   * POST /api/integrations/brief/send
   * Sends the daily brief to Chris's email
   */
  app.post("/api/integrations/brief/send", async (_req, res) => {
    res.json({
      status: "not_configured",
      message: "Connect Gmail to enable automated daily brief delivery.",
    });
  });
}
