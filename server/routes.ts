import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { healthNotes, insertHealthNoteSchema } from "@db/schema";
import { eq, desc } from "drizzle-orm";
// Assuming medications schema is defined elsewhere, import it here.  Replace with your actual import.
import { medications } from "@db/schema";


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
      res.setHeader('Content-Type', 'application/json').json(newNote);
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

      res.setHeader('Content-Type', 'application/json').json(notes);
    } catch (error) {
      console.error('Failed to fetch health notes:', error);
      res.status(500).send("Failed to fetch health notes");
    }
  });

  app.post("/api/medications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const { name, dosage, frequency, instructions } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Medication name is required" });
      }

      const [medication] = await db.insert(medications)
        .values({
          userId: req.user!.id,
          name,
          dosage,
          frequency,
          instructions,
          createdAt: new Date()
        })
        .returning();

      res.setHeader('Content-Type', 'application/json').json(medication);
    } catch (error) {
      console.error('Failed to add medication:', error);
      res.status(500).json({ error: "Failed to add medication" });
    }
  });

  app.get("/api/medications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }
    try {
      const medicationsList = await db.select().from(medications).where(eq(medications.userId, req.user!.id));
      res.setHeader('Content-Type', 'application/json').json(medicationsList);
    } catch (error) {
      console.error('Failed to fetch medications:', error);
      res.status(500).json({ error: "Failed to fetch medications" });
    }
  });

  app.post("/api/health-metrics", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const { bloodSugar, bloodPressureSystolic, bloodPressureDiastolic, cholesterol, medications, mealNotes, doctorNotes } = req.body;
      
      const [metric] = await db.insert(healthMetrics)
        .values({
          userId: req.user!.id,
          bloodSugar: bloodSugar || null,
          bloodPressureSystolic: bloodPressureSystolic || null,
          bloodPressureDiastolic: bloodPressureDiastolic || null,
          cholesterol: cholesterol || null,
          medications: medications || null,
          mealNotes: mealNotes || null,
          doctorNotes: doctorNotes || null,
          date: new Date()
        })
        .returning();

      res.setHeader('Content-Type', 'application/json').json(metric);
    } catch (error) {
      console.error('Failed to save health metrics:', error);
      res.status(500).json({ error: "Failed to save health metrics" });
    }
  });


  const httpServer = createServer(app);
  return httpServer;
}