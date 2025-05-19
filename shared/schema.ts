import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
});

// Mood entries schema
export const moods = pgTable("moods", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  emoji: text("emoji").notNull(),
  label: text("label").notNull(),
  intensity: integer("intensity").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMoodSchema = createInsertSchema(moods).pick({
  userId: true,
  emoji: true,
  label: true,
  intensity: true,
  note: true,
});

// CBT journal entries schema
export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  situation: text("situation").notNull(),
  emotion: text("emotion").notNull(),
  thought: text("thought").notNull(),
  challenge: text("challenge"),
  reframe: text("reframe"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).pick({
  userId: true,
  situation: true,
  emotion: true,
  thought: true,
  challenge: true,
  reframe: true,
});

// Habits schema
export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertHabitSchema = createInsertSchema(habits).pick({
  userId: true,
  name: true,
  description: true,
  icon: true,
});

// Habit completions schema
export const habitCompletions = pgTable("habit_completions", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").notNull().references(() => habits.id),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

export const insertHabitCompletionSchema = createInsertSchema(habitCompletions).pick({
  habitId: true,
});

// Thought patterns schema
export const thoughtPatterns = pgTable("thought_patterns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  examples: json("examples").notNull(),
  reframeStrategies: json("reframe_strategies").notNull(),
});

export const insertThoughtPatternSchema = createInsertSchema(thoughtPatterns).pick({
  name: true,
  description: true,
  examples: true,
  reframeStrategies: true,
});

// Meditation sessions schema
export const meditations = pgTable("meditations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  duration: integer("duration").notNull(), // in seconds
  category: text("category").notNull(),
  audioUrl: text("audio_url"),
});

export const insertMeditationSchema = createInsertSchema(meditations).pick({
  title: true,
  description: true,
  duration: true,
  category: true,
  audioUrl: true,
});

// User meditation completions
export const meditationCompletions = pgTable("meditation_completions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  meditationId: integer("meditation_id").notNull().references(() => meditations.id),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

export const insertMeditationCompletionSchema = createInsertSchema(meditationCompletions).pick({
  userId: true,
  meditationId: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Mood = typeof moods.$inferSelect;
export type InsertMood = z.infer<typeof insertMoodSchema>;

export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;

export type Habit = typeof habits.$inferSelect;
export type InsertHabit = z.infer<typeof insertHabitSchema>;

export type HabitCompletion = typeof habitCompletions.$inferSelect;
export type InsertHabitCompletion = z.infer<typeof insertHabitCompletionSchema>;

export type ThoughtPattern = typeof thoughtPatterns.$inferSelect;
export type InsertThoughtPattern = z.infer<typeof insertThoughtPatternSchema>;

export type Meditation = typeof meditations.$inferSelect;
export type InsertMeditation = z.infer<typeof insertMeditationSchema>;

export type MeditationCompletion = typeof meditationCompletions.$inferSelect;
export type InsertMeditationCompletion = z.infer<typeof insertMeditationCompletionSchema>;
