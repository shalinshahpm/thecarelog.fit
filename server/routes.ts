import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { healthNotes, insertHealthNoteSchema, healthMetrics, medications, medicationLogs, insertActivityLogSchema, activityLogs } from "@db/schema";
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

  app.get("/api/activity-logs", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const logs = await db.select()
        .from(activityLogs)
        .where(eq(activityLogs.userId, req.user!.id))
        .orderBy(desc(activityLogs.date));

      res.json(logs);
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
      res.status(500).json({ error: "Failed to fetch activity logs" });
    }
  });

  app.post("/api/activity-logs", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const result = insertActivityLogSchema.safeParse({
        ...req.body,
        userId: req.user!.id
      });

      if (!result.success) {
        return res.status(400).json({ error: result.error.issues });
      }

      const [log] = await db.insert(activityLogs)
        .values({
          ...result.data,
          date: new Date()
        })
        .returning();

      res.json(log);
    } catch (error) {
      console.error('Failed to create activity log:', error);
      res.status(500).json({ error: "Failed to create activity log" });
    }
  });

  app.get("/api/export/csv", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const [metricsData, medicationsData, medLogsData, notesData, activityData] = await Promise.all([
        db.select().from(healthMetrics).where(eq(healthMetrics.userId, req.user!.id)).orderBy(desc(healthMetrics.date)),
        db.select().from(medications).where(eq(medications.userId, req.user!.id)),
        db.select().from(medicationLogs).where(eq(medicationLogs.userId, req.user!.id)).orderBy(desc(medicationLogs.takenAt)),
        db.select().from(healthNotes).where(eq(healthNotes.userId, req.user!.id)).orderBy(desc(healthNotes.createdAt)),
        db.select().from(activityLogs).where(eq(activityLogs.userId, req.user!.id)).orderBy(desc(activityLogs.date))
      ]);

      let csvContent = "HEALTH METRICS\n";
      csvContent += "Date,Blood Sugar,Blood Pressure Systolic,Blood Pressure Diastolic,Cholesterol,Medications,Meal Notes,Doctor Notes\n";
      csvContent += metricsData.map(m => 
        `${new Date(m.date).toLocaleDateString()},${m.bloodSugar || ''},${m.bloodPressureSystolic || ''},${m.bloodPressureDiastolic || ''},${m.cholesterol || ''},${m.medications || ''},${m.mealNotes || ''},${m.doctorNotes || ''}`
      ).join("\n");

      csvContent += "\n\nMEDICATIONS\n";
      csvContent += "Name,Dosage,Frequency,Instructions,Created At\n";
      csvContent += medicationsData.map(m =>
        `${m.name},${m.dosage || ''},${m.frequency || ''},${m.instructions || ''},${new Date(m.createdAt!).toLocaleDateString()}`
      ).join("\n");

      csvContent += "\n\nMEDICATION LOGS\n";
      csvContent += "Medication ID,Status,Taken At,Notes\n";
      csvContent += medLogsData.map(m =>
        `${m.medicationId},${m.status},${new Date(m.takenAt!).toLocaleDateString()},${m.notes || ''}`
      ).join("\n");

      csvContent += "\n\nHEALTH NOTES\n";
      csvContent += "Category,Title,Content,Created At\n";
      csvContent += notesData.map(n =>
        `${n.category},${n.title},${n.content},${new Date(n.createdAt!).toLocaleDateString()}`
      ).join("\n");

      csvContent += "\n\nACTIVITY LOGS\n";
      csvContent += "Type,Value,Duration (minutes),Notes,Date\n";
      csvContent += activityData.map(a =>
        `${a.type},${a.value},${a.duration || ''},${a.notes || ''},${new Date(a.date!).toLocaleDateString()}`
      ).join("\n");

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=health-data.csv');
      res.send(csvContent);
    } catch (error) {
      console.error('Failed to export CSV:', error);
      res.status(500).json({ error: "Failed to export data" });
    }
  });

  app.get("/api/export/pdf", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const PDFDocument = await import('pdfkit');
      const doc = new PDFDocument.default();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=health-data.pdf');

      doc.pipe(res);

      // Title
      doc.fontSize(25).text('Health Data Report', 100, 100);
      let y = 150;

      const [metrics, meds, medLogs, notes, activities] = await Promise.all([
        db.select().from(healthMetrics).where(eq(healthMetrics.userId, req.user!.id)).orderBy(desc(healthMetrics.date)),
        db.select().from(medications).where(eq(medications.userId, req.user!.id)),
        db.select().from(medicationLogs).where(eq(medicationLogs.userId, req.user!.id)).orderBy(desc(medicationLogs.takenAt)),
        db.select().from(healthNotes).where(eq(healthNotes.userId, req.user!.id)).orderBy(desc(healthNotes.createdAt)),
        db.select().from(activityLogs).where(eq(activityLogs.userId, req.user!.id)).orderBy(desc(activityLogs.date))
      ]);

      if (metrics.length > 0) {
        doc.fontSize(16).text('Health Metrics', 100, y);
        y += 30;
        doc.fontSize(12);
        metrics.forEach(metric => {
          doc.text(`Date: ${new Date(metric.date).toLocaleDateString()}`, 100, y);
          doc.text(`Blood Sugar: ${metric.bloodSugar || 'N/A'}`, 100, y + 20);
          doc.text(`Blood Pressure: ${metric.bloodPressureSystolic || 'N/A'}/${metric.bloodPressureDiastolic || 'N/A'}`, 100, y + 40);
          doc.text(`Cholesterol: ${metric.cholesterol || 'N/A'}`, 100, y + 60);
          if (metric.medications) doc.text(`Medications: ${metric.medications}`, 100, y + 80);
          if (metric.mealNotes) doc.text(`Meal Notes: ${metric.mealNotes}`, 100, y + 100);
          if (metric.doctorNotes) doc.text(`Doctor Notes: ${metric.doctorNotes}`, 100, y + 120);
          y += 160;
        });
      }

      if (meds.length > 0) {
        doc.addPage();
        y = 50;
        doc.fontSize(16).text('Medications', 100, y);
        y += 30;
        doc.fontSize(12);
        meds.forEach(med => {
          doc.text(`Name: ${med.name}`, 100, y);
          doc.text(`Dosage: ${med.dosage || 'N/A'}`, 100, y + 20);
          doc.text(`Frequency: ${med.frequency || 'N/A'}`, 100, y + 40);
          doc.text(`Instructions: ${med.instructions || 'N/A'}`, 100, y + 60);
          doc.text(`Added: ${new Date(med.createdAt!).toLocaleDateString()}`, 100, y + 80);
          y += 120;
        });
      }

      if (medLogs.length > 0) {
        doc.addPage();
        y = 50;
        doc.fontSize(16).text('Medication Logs', 100, y);
        y += 30;
        doc.fontSize(12);
        medLogs.forEach(log => {
          doc.text(`Medication ID: ${log.medicationId}`, 100, y);
          doc.text(`Status: ${log.status}`, 100, y + 20);
          doc.text(`Taken At: ${new Date(log.takenAt!).toLocaleDateString()}`, 100, y + 40);
          if (log.notes) doc.text(`Notes: ${log.notes}`, 100, y + 60);
          y += 100;
        });
      }

      if (notes.length > 0) {
        doc.addPage();
        y = 50;
        doc.fontSize(16).text('Health Notes', 100, y);
        y += 30;
        doc.fontSize(12);
        notes.forEach(note => {
          doc.text(`Category: ${note.category}`, 100, y);
          doc.text(`Title: ${note.title}`, 100, y + 20);
          doc.text(`Content: ${note.content}`, 100, y + 40);
          doc.text(`Created: ${new Date(note.createdAt!).toLocaleDateString()}`, 100, y + 60);
          y += 100;
        });
      }

      if (activities.length > 0) {
        doc.addPage();
        y = 50;
        doc.fontSize(16).text('Activity Logs', 100, y);
        y += 30;
        doc.fontSize(12);
        activities.forEach(activity => {
          doc.text(`Type: ${activity.type}`, 100, y);
          doc.text(`Value: ${activity.value}`, 100, y + 20);
          if (activity.duration) doc.text(`Duration: ${activity.duration} minutes`, 100, y + 40);
          if (activity.notes) doc.text(`Notes: ${activity.notes}`, 100, y + 60);
          doc.text(`Date: ${new Date(activity.date!).toLocaleDateString()}`, 100, y + 80);
          y += 120;
        });
      }

      doc.end();
    } catch (error) {
      console.error('Failed to export PDF:', error);
      res.status(500).json({ error: "Failed to export data" });
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

  app.get("/api/medications/logs", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const logs = await db.select()
        .from(medicationLogs)
        .where(eq(medicationLogs.userId, req.user!.id))
        .orderBy(desc(medicationLogs.takenAt));
      res.json(logs);
    } catch (error) {
      console.error('Failed to fetch medication logs:', error);
      res.status(500).json({ error: "Failed to fetch medication logs" });
    }
  });

  app.post("/api/medications/log", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const { medicationId, status } = req.body;
      const [log] = await db.insert(medicationLogs)
        .values({
          userId: req.user!.id,
          medicationId,
          status,
          takenAt: new Date()
        })
        .returning();
      res.json(log);
    } catch (error) {
      console.error('Failed to log medication:', error);
      res.status(500).json({ error: "Failed to log medication" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}