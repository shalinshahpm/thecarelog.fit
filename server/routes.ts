import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { healthMetrics, users } from "@db/schema";
import { eq } from "drizzle-orm";
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
  });

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