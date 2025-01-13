import { 
  pgTable, 
  text, 
  serial, 
  timestamp, 
  boolean,
  integer,
  decimal,
  date,
  json
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  email: text("email").unique().notNull(),
  isPremium: boolean("is_premium").default(false),
  emailReminders: boolean("email_reminders").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  currentStreak: integer("current_streak").default(0),
  lastActivityDate: date("last_activity_date"),
});

export const healthMetrics = pgTable("health_metrics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  bloodSugar: decimal("blood_sugar", { precision: 5, scale: 1 }),
  bloodPressureSystolic: integer("blood_pressure_systolic"),
  bloodPressureDiastolic: integer("blood_pressure_diastolic"),
  cholesterol: decimal("cholesterol", { precision: 5, scale: 1 }),
  medications: text("medications"),
  mealNotes: text("meal_notes"),
  doctorNotes: text("doctor_notes"),
  date: timestamp("date").defaultNow(),
});

export const medications = pgTable("medications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  dosage: text("dosage"),
  frequency: text("frequency"),
  instructions: text("instructions"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const medicationLogs = pgTable("medication_logs", {
  id: serial("id").primaryKey(),
  medicationId: integer("medication_id").references(() => medications.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  status: text("status").notNull(), // "taken" or "skipped"
  takenAt: timestamp("taken_at").defaultNow(),
  notes: text("notes"),
});

export const healthNotes = pgTable("health_notes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  category: text("category").notNull(), // "Diet Tips", "Next Visit Questions", "Test Results"
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const savedSearches = pgTable("saved_searches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  query: text("query").notNull(),
  category: text("category").notNull(), // "Diet", "Exercise", "Doctor Advice"
  url: text("url").notNull(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // "steps", "walking", "exercise"
  value: integer("value").notNull(),
  duration: integer("duration"), // in minutes
  notes: text("notes"),
  date: date("date").defaultNow(),
});

// Relations
export const healthMetricsRelations = relations(healthMetrics, ({ one }) => ({
  user: one(users, {
    fields: [healthMetrics.userId],
    references: [users.id],
  }),
}));

export const medicationsRelations = relations(medications, ({ one, many }) => ({
  user: one(users, {
    fields: [medications.userId],
    references: [users.id],
  }),
  logs: many(medicationLogs),
}));

export const medicationLogsRelations = relations(medicationLogs, ({ one }) => ({
  medication: one(medications, {
    fields: [medicationLogs.medicationId],
    references: [medications.id],
  }),
  user: one(users, {
    fields: [medicationLogs.userId],
    references: [users.id],
  }),
}));

export const healthNotesRelations = relations(healthNotes, ({ one }) => ({
  user: one(users, {
    fields: [healthNotes.userId],
    references: [users.id],
  }),
}));

export const savedSearchesRelations = relations(savedSearches, ({ one }) => ({
  user: one(users, {
    fields: [savedSearches.userId],
    references: [users.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertHealthMetricSchema = createInsertSchema(healthMetrics);
export const selectHealthMetricSchema = createSelectSchema(healthMetrics);
export const insertMedicationSchema = createInsertSchema(medications);
export const selectMedicationSchema = createSelectSchema(medications);
export const insertMedicationLogSchema = createInsertSchema(medicationLogs);
export const selectMedicationLogSchema = createSelectSchema(medicationLogs);
export const insertHealthNoteSchema = createInsertSchema(healthNotes, {
  category: z.enum(["Diet Tips", "Next Visit Questions", "Test Results"]),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});
export const selectHealthNoteSchema = createSelectSchema(healthNotes);
export const insertSavedSearchSchema = createInsertSchema(savedSearches);
export const selectSavedSearchSchema = createSelectSchema(savedSearches);
export const insertActivityLogSchema = createInsertSchema(activityLogs, {
  type: z.enum(["steps", "walking", "exercise"]),
  value: z.number().min(0, "Value must be positive"),
  duration: z.number().min(0, "Duration must be positive").optional(),
});
export const selectActivityLogSchema = createSelectSchema(activityLogs);

// Login schema that only requires username and password
export const loginUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type HealthMetric = typeof healthMetrics.$inferSelect;
export type NewHealthMetric = typeof healthMetrics.$inferInsert;
export type Medication = typeof medications.$inferSelect;
export type NewMedication = typeof medications.$inferInsert;
export type MedicationLog = typeof medicationLogs.$inferSelect;
export type NewMedicationLog = typeof medicationLogs.$inferInsert;
export type HealthNote = typeof healthNotes.$inferSelect;
export type NewHealthNote = typeof healthNotes.$inferInsert;
export type SavedSearch = typeof savedSearches.$inferSelect;
export type NewSavedSearch = typeof savedSearches.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;