import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { healthMetrics, users, medications, medicationLogs, healthNotes, insertHealthNoteSchema } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import Stripe from "stripe";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Health metrics endpoints
  app.post("/api/health-metrics", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const newMetric = await db.insert(healthMetrics)
        .values({
          ...req.body,
          userId: req.user!.id
        })
        .returning();

      // Update user's streak
      const today = new Date();
      const user = req.user!;
      const streak = user.currentStreak || 0;
      if (!user.lastActivityDate || isNewDay(user.lastActivityDate, today)) {
        await db.update(users)
          .set({ 
            currentStreak: streak + 1,
            lastActivityDate: today
          })
          .where(eq(users.id, user.id));
      }

      res.json(newMetric[0]);
    } catch (error) {
      res.status(500).send("Failed to save health metrics");
    }
  });

  app.get("/api/health-metrics", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const metrics = await db.select()
        .from(healthMetrics)
        .where(eq(healthMetrics.userId, req.user!.id))
        .orderBy(healthMetrics.date);

      res.json(metrics);
    } catch (error) {
      res.status(500).send("Failed to fetch health metrics");
    }
  });

  // Health notes endpoints
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
      res.status(500).send("Failed to fetch health notes");
    }
  });

  app.post("/api/health-notes", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const result = insertHealthNoteSchema.safeParse(req.body);
      if (!result.success) {
        return res
          .status(400)
          .send("Invalid input: " + result.error.issues.map(i => i.message).join(", "));
      }

      const { category, title, content } = result.data;
      const now = new Date();
      const newNote = await db.insert(healthNotes)
        .values({
          userId: req.user!.id,
          category,
          title,
          content,
          createdAt: now,
          updatedAt: now
        })
        .returning();

      // Update user's streak
      const user = req.user!;
      const streak = user.currentStreak || 0;
      if (!user.lastActivityDate || isNewDay(user.lastActivityDate, now)) {
        await db.update(users)
          .set({ 
            currentStreak: streak + 1,
            lastActivityDate: now
          })
          .where(eq(users.id, user.id));
      }

      res.json(newNote[0]);
    } catch (error) {
      console.error('Failed to create health note:', error);
      res.status(500).send("Failed to create health note");
    }
  });

  app.put("/api/health-notes/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const noteId = parseInt(req.params.id);
      const [existingNote] = await db.select()
        .from(healthNotes)
        .where(eq(healthNotes.id, noteId))
        .limit(1);

      if (!existingNote) {
        return res.status(404).send("Note not found");
      }

      if (existingNote.userId !== req.user!.id) {
        return res.status(403).send("Not authorized to update this note");
      }

      const [updatedNote] = await db.update(healthNotes)
        .set({
          ...req.body,
          updatedAt: new Date(),
        })
        .where(eq(healthNotes.id, noteId))
        .returning();

      res.json(updatedNote);
    } catch (error) {
      res.status(500).send("Failed to update health note");
    }
  });

  // Medication endpoints
  app.get("/api/medications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const userMedications = await db.select()
        .from(medications)
        .where(eq(medications.userId, req.user!.id))
        .orderBy(medications.name);

      res.json(userMedications);
    } catch (error) {
      res.status(500).send("Failed to fetch medications");
    }
  });

  app.post("/api/medications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const newMedication = await db.insert(medications)
        .values({
          ...req.body,
          userId: req.user!.id
        })
        .returning();

      res.json(newMedication[0]);
    } catch (error) {
      res.status(500).send("Failed to add medication");
    }
  });

  app.post("/api/medications/log", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const newLog = await db.insert(medicationLogs)
        .values({
          ...req.body,
          userId: req.user!.id,
          takenAt: new Date()
        })
        .returning();

      // Update user's streak
      const today = new Date();
      const user = req.user!;
      if (!user.lastActivityDate || isNewDay(user.lastActivityDate, today)) {
        await db.update(users)
          .set({ 
            currentStreak: user.currentStreak + 1,
            lastActivityDate: today
          })
          .where(eq(users.id, user.id));
      }

      res.json(newLog[0]);
    } catch (error) {
      res.status(500).send("Failed to log medication");
    }
  });

  app.get("/api/medications/logs", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const logs = await db.select()
        .from(medicationLogs)
        .where(eq(medicationLogs.userId, req.user!.id))
        .orderBy(desc(medicationLogs.takenAt));

      res.json(logs);
    } catch (error) {
      res.status(500).send("Failed to fetch medication logs");
    }
  });

  // Update subscription status
  app.post("/api/subscribe", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const [updated] = await db
        .update(users)
        .set({ isPremium: true })
        .where(eq(users.id, req.user!.id))
        .returning();

      res.json(updated);
    } catch (error) {
      res.status(500).send("Failed to update subscription");
    }
  });

  // Helper function to check if two dates are different days
  function isNewDay(date1: Date, date2: Date): boolean {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getDate() !== d2.getDate() ||
           d1.getMonth() !== d2.getMonth() ||
           d1.getFullYear() !== d2.getFullYear();
  }

  // Stripe payment endpoint
  app.post("/api/create-payment", async (req, res) => {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("Stripe secret key not configured");
      return res.status(500).send("Payment service is temporarily unavailable");
    }

    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16'
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Health Manager Donation',
                description: 'Thank you for supporting Health Manager!',
              },
              unit_amount: 500, // $5.00
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${req.protocol}://${req.get('host')}/dashboard?donation=success`,
        cancel_url: `${req.protocol}://${req.get('host')}/dashboard`,
      });

      res.json({ clientSecret: session.id });
    } catch (error: any) {
      console.error('Stripe error:', error);
      res.status(500).send("Payment processing failed. Please try again later.");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}