import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { healthNotes, insertHealthNoteSchema, healthMetrics, medications, medicationLogs, insertActivityLogSchema, activityLogs, users } from "@db/schema";
import { eq, desc, sql } from "drizzle-orm";

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
      csvContent += "Medication Name,Status,Taken At,Notes\n";
      csvContent += medLogsData.map(m => {
        const medication = medicationsData.find(med => med.id === m.medicationId);
        return `${medication?.name || 'Unknown'},${m.status},${new Date(m.takenAt!).toLocaleDateString()},${m.notes || ''}`;
      }).join("\n");

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

      // Title page
      doc.fontSize(25).text('Health Data Report', {align: 'center'});
      doc.moveDown();
      doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, {align: 'center'});

      const itemsPerPage = 50;

      if (metrics.length > 0) {
        doc.addPage();
        doc.fontSize(20).text('HEALTH METRICS', {align: 'center'});
        doc.moveDown();

        for (let i = 0; i < metrics.length; i++) {
          const metric = metrics[i];
          if (i > 0 && i % itemsPerPage === 0) {
            doc.addPage();
            doc.fontSize(20).text('HEALTH METRICS (continued)', {align: 'center'});
            doc.moveDown();
          }
          doc.fontSize(14).text(new Date(metric.date).toLocaleDateString());
          doc.fontSize(12);
          doc.text(`Blood Sugar: ${metric.bloodSugar || 'N/A'}`);
          doc.text(`Blood Pressure: ${metric.bloodPressureSystolic || 'N/A'}/${metric.bloodPressureDiastolic || 'N/A'}`);
          doc.text(`Cholesterol: ${metric.cholesterol || 'N/A'}`);
          if (metric.medications) doc.text(`Medications: ${metric.medications}`);
          if (metric.mealNotes) doc.text(`Meal Notes: ${metric.mealNotes}`);
          if (metric.doctorNotes) doc.text(`Doctor Notes: ${metric.doctorNotes}`);
          doc.moveDown(2);
        }
      }

      if (meds.length > 0) {
        doc.addPage();
        doc.fontSize(20).text('MEDICATIONS', {align: 'center'});
        doc.moveDown();
        meds.forEach(med => {
          doc.fontSize(14).text(med.name);
          doc.fontSize(12);
          doc.text(`Dosage: ${med.dosage || 'N/A'}`);
          doc.text(`Frequency: ${med.frequency || 'N/A'}`);
          doc.text(`Instructions: ${med.instructions || 'N/A'}`);
          doc.text(`Added: ${new Date(med.createdAt!).toLocaleDateString()}`);
          doc.moveDown(2);
        });
      }

      if (medLogs.length > 0) {
        doc.addPage();
        doc.fontSize(20).text('MEDICATION LOGS', {align: 'center'});
        doc.moveDown();
        for (let i = 0; i < medLogs.length; i++) {
          const log = medLogs[i];
          const medication = meds.find(m => m.id === log.medicationId);

          if (i > 0 && i % itemsPerPage === 0) {
            doc.addPage();
            doc.fontSize(20).text('MEDICATION LOGS (continued)', {align: 'center'});
            doc.moveDown();
          }

          doc.fontSize(14).text(`Medication Log - ${new Date(log.takenAt!).toLocaleDateString()}`);
          doc.fontSize(12);
          doc.text(`Medication: ${medication?.name || 'Unknown'}`);
          doc.text(`Status: ${log.status}`);
          if (log.notes) doc.text(`Notes: ${log.notes}`);
          doc.moveDown(2);
        }
      }

      if (notes.length > 0) {
        doc.addPage();
        doc.fontSize(20).text('HEALTH NOTES', {align: 'center'});
        doc.moveDown();
        notes.forEach(note => {
          doc.fontSize(14).text(note.title);
          doc.fontSize(12);
          doc.text(`Category: ${note.category}`);
          doc.text(`Content: ${note.content}`);
          doc.text(`Created: ${new Date(note.createdAt!).toLocaleDateString()}`);
          doc.moveDown(2);
        });
      }

      if (activities.length > 0) {
        doc.addPage();
        doc.fontSize(20).text('ACTIVITY LOGS', {align: 'center'});
        doc.moveDown();
        activities.forEach(activity => {
          doc.fontSize(14).text(`${activity.type} - ${new Date(activity.date!).toLocaleDateString()}`);
          doc.fontSize(12);
          doc.text(`Value: ${activity.value}`);
          if (activity.duration) doc.text(`Duration: ${activity.duration} minutes`);
          if (activity.notes) doc.text(`Notes: ${activity.notes}`);
          doc.moveDown(2);
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

      // Update streak
      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, req.user!.id))
        .limit(1);

      const now = new Date();
      const today = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

      if (user.lastActivityDate) {
        const lastActivity = new Date(user.lastActivityDate);
        const lastActivityDay = new Date(lastActivity.getUTCFullYear(), lastActivity.getUTCMonth(), lastActivity.getUTCDate());

        // Calculate days between last activity and today
        const diffTime = today.getTime() - lastActivityDay.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Increment streak if last activity was yesterday
          await db.update(users)
            .set({
              currentStreak: user.currentStreak + 1,
              lastActivityDate: today
            })
            .where(eq(users.id, req.user!.id));
        } else if (diffDays > 1) {
          // Reset streak if more than a day has passed
          await db.update(users)
            .set({
              currentStreak: 1,
              lastActivityDate: today
            })
            .where(eq(users.id, req.user!.id));
        }
      } else {
        // First activity, set streak to 1
        await db.update(users)
          .set({
            currentStreak: 1,
            lastActivityDate: today
          })
          .where(eq(users.id, req.user!.id));
      }

      // Fetch updated user data
      const [updatedUser] = await db.select()
        .from(users)
        .where(eq(users.id, req.user!.id))
        .limit(1);

      res.setHeader('Content-Type', 'application/json').json({
        metric,
        streak: updatedUser.currentStreak
      });
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