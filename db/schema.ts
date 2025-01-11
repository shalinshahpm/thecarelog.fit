import { 
  pgTable, 
  text, 
  serial, 
  timestamp, 
  boolean,
  integer,
  decimal
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  email: text("email").unique().notNull(),
  isPremium: boolean("is_premium").default(false),
  emailReminders: boolean("email_reminders").default(false),
  createdAt: timestamp("created_at").defaultNow()
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

export const healthMetricsRelations = relations(healthMetrics, ({ one }) => ({
  user: one(users, {
    fields: [healthMetrics.userId],
    references: [users.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertHealthMetricSchema = createInsertSchema(healthMetrics);
export const selectHealthMetricSchema = createSelectSchema(healthMetrics);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type HealthMetric = typeof healthMetrics.$inferSelect;
export type NewHealthMetric = typeof healthMetrics.$inferInsert;
