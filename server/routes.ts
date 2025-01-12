import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { healthNotes, insertHealthNoteSchema } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  // First set up auth
  setupAuth(app);

  // Health notes endpoints
  app.post("/api/health-notes", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    try {
      console.log('Received health note data:', req.body); // Debug log
      const result = insertHealthNoteSchema.safeParse({
        ...req.body,
        userId: req.user!.id
      });
      if (!result.success) {
        console.error('Validation error:', result.error.issues); // Debug log
        return res
          .status(400)
          .send("Invalid input: " + result.error.issues.map(i => i.message).join(", "));
      }

      const { category, title, content } = result.data;
      const now = new Date();
      const [newNote] = await db.insert(healthNotes)
        .values({
          userId: req.user!.id,
          category,
          title,
          content,
          createdAt: now,
          updatedAt: now
        })
        .returning();

      console.log('Created new note:', newNote); // Debug log
      res.json(newNote);
    } catch (error) {
      console.error('Failed to create health note:', error);
      res.status(500).send("Failed to create health note");
    }
  });

  app.get("/api/health-notes", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const notes = await db.select()
        .from(healthNotes)
        .where(eq(healthNotes.userId, req.user!.id))
        .orderBy(desc(healthNotes.updatedAt));

      res.json(notes);
    } catch (error) {
      console.error('Failed to fetch health notes:', error);
      res.status(500).send("Failed to fetch health notes");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}