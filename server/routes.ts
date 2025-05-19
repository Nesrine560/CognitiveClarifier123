import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertMoodSchema, 
  insertJournalEntrySchema,
  insertHabitSchema,
  insertHabitCompletionSchema, 
  insertMeditationCompletionSchema 
} from "@shared/schema";
import { z } from "zod";
import { generateCBTResponse } from "./lib/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Health check endpoint
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });
  
  // User routes
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  
  // Mood routes
  app.get("/api/moods", async (req: Request, res: Response) => {
    try {
      const userId = Number(req.query.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const moods = await storage.getMoods(userId);
      res.json(moods);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch moods" });
    }
  });
  
  app.post("/api/moods", async (req: Request, res: Response) => {
    try {
      const moodData = insertMoodSchema.parse(req.body);
      const mood = await storage.createMood(moodData);
      res.status(201).json(mood);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create mood entry" });
    }
  });
  
  // Journal routes
  app.get("/api/journal", async (req: Request, res: Response) => {
    try {
      const userId = Number(req.query.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const entries = await storage.getJournalEntries(userId);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch journal entries" });
    }
  });
  
  app.get("/api/journal/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }
      
      const entry = await storage.getJournalEntryById(id);
      if (!entry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch journal entry" });
    }
  });
  
  app.post("/api/journal", async (req: Request, res: Response) => {
    try {
      const entryData = insertJournalEntrySchema.parse(req.body);
      const entry = await storage.createJournalEntry(entryData);
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create journal entry" });
    }
  });
  
  app.patch("/api/journal/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }
      
      // Only allow updates to challenge and reframe fields
      const updateData = z.object({
        challenge: z.string().optional(),
        reframe: z.string().optional(),
      }).parse(req.body);
      
      const updatedEntry = await storage.updateJournalEntry(id, updateData);
      if (!updatedEntry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      
      res.json(updatedEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to update journal entry" });
    }
  });
  
  // Habit routes
  app.get("/api/habits", async (req: Request, res: Response) => {
    try {
      const userId = Number(req.query.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const habits = await storage.getHabits(userId);
      
      // Add completions for each habit
      const habitsWithCompletions = await Promise.all(habits.map(async (habit) => {
        const completions = await storage.getHabitCompletions(habit.id);
        return {
          ...habit,
          completions
        };
      }));
      
      res.json(habitsWithCompletions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch habits" });
    }
  });
  
  app.post("/api/habits", async (req: Request, res: Response) => {
    try {
      const habitData = insertHabitSchema.parse(req.body);
      const habit = await storage.createHabit(habitData);
      res.status(201).json(habit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create habit" });
    }
  });
  
  app.post("/api/habits/:id/complete", async (req: Request, res: Response) => {
    try {
      const habitId = Number(req.params.id);
      if (isNaN(habitId)) {
        return res.status(400).json({ message: "Invalid habit ID" });
      }
      
      const habit = await storage.getHabitById(habitId);
      if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      const completion = await storage.completeHabit({ habitId });
      res.status(201).json(completion);
    } catch (error) {
      res.status(500).json({ message: "Failed to complete habit" });
    }
  });
  
  // Thought pattern routes
  app.get("/api/thought-patterns", async (_req: Request, res: Response) => {
    try {
      const patterns = await storage.getThoughtPatterns();
      res.json(patterns);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch thought patterns" });
    }
  });
  
  app.get("/api/thought-patterns/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid pattern ID" });
      }
      
      const pattern = await storage.getThoughtPatternById(id);
      if (!pattern) {
        return res.status(404).json({ message: "Thought pattern not found" });
      }
      
      res.json(pattern);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch thought pattern" });
    }
  });
  
  // Meditation routes
  app.get("/api/meditations", async (_req: Request, res: Response) => {
    try {
      const meditations = await storage.getMeditations();
      res.json(meditations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meditations" });
    }
  });
  
  app.get("/api/meditations/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid meditation ID" });
      }
      
      const meditation = await storage.getMeditationById(id);
      if (!meditation) {
        return res.status(404).json({ message: "Meditation not found" });
      }
      
      res.json(meditation);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meditation" });
    }
  });
  
  app.post("/api/meditations/:id/complete", async (req: Request, res: Response) => {
    try {
      const meditationId = Number(req.params.id);
      if (isNaN(meditationId)) {
        return res.status(400).json({ message: "Invalid meditation ID" });
      }
      
      const completionData = insertMeditationCompletionSchema.parse({
        ...req.body,
        meditationId
      });
      
      const meditation = await storage.getMeditationById(meditationId);
      if (!meditation) {
        return res.status(404).json({ message: "Meditation not found" });
      }
      
      const completion = await storage.completeMeditation(completionData);
      res.status(201).json(completion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to complete meditation" });
    }
  });
  
  // AI assistance for CBT
  app.post("/api/cbt/analyze", async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        situation: z.string(),
        emotion: z.string(),
        thought: z.string()
      });
      
      const { situation, emotion, thought } = schema.parse(req.body);
      
      const aiResponse = await generateCBTResponse(situation, emotion, thought);
      
      res.json(aiResponse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to generate AI response" });
    }
  });

  return httpServer;
}
