import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { healthMetrics, users } from "@db/schema";
import { eq } from "drizzle-orm";

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

  // Stripe payment endpoint
  app.post("/api/create-payment", async (req, res) => {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).send("Stripe key not configured");
    }

    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 500, // $5.00
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      res.status(500).send("Payment failed");
    }
  });

  });

  const httpServer = createServer(app);
  return httpServer;
}