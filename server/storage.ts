import {
  users,
  moods,
  journalEntries,
  habits,
  habitCompletions,
  thoughtPatterns,
  meditations,
  meditationCompletions,
  type User,
  type InsertUser,
  type Mood,
  type InsertMood,
  type JournalEntry,
  type InsertJournalEntry,
  type Habit,
  type InsertHabit,
  type HabitCompletion,
  type InsertHabitCompletion,
  type ThoughtPattern,
  type InsertThoughtPattern,
  type Meditation,
  type InsertMeditation,
  type MeditationCompletion,
  type InsertMeditationCompletion,
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Mood methods
  getMoods(userId: number): Promise<Mood[]>;
  getMoodById(id: number): Promise<Mood | undefined>;
  createMood(mood: InsertMood): Promise<Mood>;
  
  // Journal methods
  getJournalEntries(userId: number): Promise<JournalEntry[]>;
  getJournalEntryById(id: number): Promise<JournalEntry | undefined>;
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  updateJournalEntry(id: number, entry: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined>;
  
  // Habit methods
  getHabits(userId: number): Promise<Habit[]>;
  getHabitById(id: number): Promise<Habit | undefined>;
  createHabit(habit: InsertHabit): Promise<Habit>;
  completeHabit(completion: InsertHabitCompletion): Promise<HabitCompletion>;
  getHabitCompletions(habitId: number): Promise<HabitCompletion[]>;
  
  // Thought pattern methods
  getThoughtPatterns(): Promise<ThoughtPattern[]>;
  getThoughtPatternById(id: number): Promise<ThoughtPattern | undefined>;
  createThoughtPattern(pattern: InsertThoughtPattern): Promise<ThoughtPattern>;
  
  // Meditation methods
  getMeditations(): Promise<Meditation[]>;
  getMeditationById(id: number): Promise<Meditation | undefined>;
  createMeditation(meditation: InsertMeditation): Promise<Meditation>;
  completeMeditation(completion: InsertMeditationCompletion): Promise<MeditationCompletion>;
  getMeditationCompletions(userId: number): Promise<MeditationCompletion[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private moods: Map<number, Mood>;
  private journalEntries: Map<number, JournalEntry>;
  private habits: Map<number, Habit>;
  private habitCompletions: Map<number, HabitCompletion>;
  private thoughtPatterns: Map<number, ThoughtPattern>;
  private meditations: Map<number, Meditation>;
  private meditationCompletions: Map<number, MeditationCompletion>;
  
  private userIdCounter: number;
  private moodIdCounter: number;
  private journalIdCounter: number;
  private habitIdCounter: number;
  private habitCompletionIdCounter: number;
  private thoughtPatternIdCounter: number;
  private meditationIdCounter: number;
  private meditationCompletionIdCounter: number;

  constructor() {
    this.users = new Map();
    this.moods = new Map();
    this.journalEntries = new Map();
    this.habits = new Map();
    this.habitCompletions = new Map();
    this.thoughtPatterns = new Map();
    this.meditations = new Map();
    this.meditationCompletions = new Map();
    
    this.userIdCounter = 1;
    this.moodIdCounter = 1;
    this.journalIdCounter = 1;
    this.habitIdCounter = 1;
    this.habitCompletionIdCounter = 1;
    this.thoughtPatternIdCounter = 1;
    this.meditationIdCounter = 1;
    this.meditationCompletionIdCounter = 1;
    
    // Seed thought patterns
    this.seedThoughtPatterns();
    // Seed meditation sessions
    this.seedMeditations();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Mood methods
  async getMoods(userId: number): Promise<Mood[]> {
    return Array.from(this.moods.values()).filter(
      (mood) => mood.userId === userId,
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getMoodById(id: number): Promise<Mood | undefined> {
    return this.moods.get(id);
  }
  
  async createMood(insertMood: InsertMood): Promise<Mood> {
    const id = this.moodIdCounter++;
    const mood = { 
      ...insertMood, 
      id,
      createdAt: new Date()
    };
    this.moods.set(id, mood);
    return mood;
  }
  
  // Journal methods
  async getJournalEntries(userId: number): Promise<JournalEntry[]> {
    return Array.from(this.journalEntries.values()).filter(
      (entry) => entry.userId === userId,
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getJournalEntryById(id: number): Promise<JournalEntry | undefined> {
    return this.journalEntries.get(id);
  }
  
  async createJournalEntry(insertEntry: InsertJournalEntry): Promise<JournalEntry> {
    const id = this.journalIdCounter++;
    const entry = { 
      ...insertEntry, 
      id,
      createdAt: new Date()
    };
    this.journalEntries.set(id, entry);
    return entry;
  }
  
  async updateJournalEntry(id: number, partialEntry: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined> {
    const existingEntry = this.journalEntries.get(id);
    if (!existingEntry) return undefined;
    
    const updatedEntry = { ...existingEntry, ...partialEntry };
    this.journalEntries.set(id, updatedEntry);
    return updatedEntry;
  }
  
  // Habit methods
  async getHabits(userId: number): Promise<Habit[]> {
    return Array.from(this.habits.values()).filter(
      (habit) => habit.userId === userId,
    );
  }
  
  async getHabitById(id: number): Promise<Habit | undefined> {
    return this.habits.get(id);
  }
  
  async createHabit(insertHabit: InsertHabit): Promise<Habit> {
    const id = this.habitIdCounter++;
    const habit = { 
      ...insertHabit, 
      id,
      createdAt: new Date()
    };
    this.habits.set(id, habit);
    return habit;
  }
  
  async completeHabit(insertCompletion: InsertHabitCompletion): Promise<HabitCompletion> {
    const id = this.habitCompletionIdCounter++;
    const completion = { 
      ...insertCompletion, 
      id,
      completedAt: new Date()
    };
    this.habitCompletions.set(id, completion);
    return completion;
  }
  
  async getHabitCompletions(habitId: number): Promise<HabitCompletion[]> {
    return Array.from(this.habitCompletions.values()).filter(
      (completion) => completion.habitId === habitId,
    ).sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  }
  
  // Thought pattern methods
  async getThoughtPatterns(): Promise<ThoughtPattern[]> {
    return Array.from(this.thoughtPatterns.values());
  }
  
  async getThoughtPatternById(id: number): Promise<ThoughtPattern | undefined> {
    return this.thoughtPatterns.get(id);
  }
  
  async createThoughtPattern(insertPattern: InsertThoughtPattern): Promise<ThoughtPattern> {
    const id = this.thoughtPatternIdCounter++;
    const pattern = { ...insertPattern, id };
    this.thoughtPatterns.set(id, pattern);
    return pattern;
  }
  
  // Meditation methods
  async getMeditations(): Promise<Meditation[]> {
    return Array.from(this.meditations.values());
  }
  
  async getMeditationById(id: number): Promise<Meditation | undefined> {
    return this.meditations.get(id);
  }
  
  async createMeditation(insertMeditation: InsertMeditation): Promise<Meditation> {
    const id = this.meditationIdCounter++;
    const meditation = { ...insertMeditation, id };
    this.meditations.set(id, meditation);
    return meditation;
  }
  
  async completeMeditation(insertCompletion: InsertMeditationCompletion): Promise<MeditationCompletion> {
    const id = this.meditationCompletionIdCounter++;
    const completion = { 
      ...insertCompletion, 
      id,
      completedAt: new Date()
    };
    this.meditationCompletions.set(id, completion);
    return completion;
  }
  
  async getMeditationCompletions(userId: number): Promise<MeditationCompletion[]> {
    return Array.from(this.meditationCompletions.values()).filter(
      (completion) => completion.userId === userId,
    ).sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  }
  
  // Seed data
  private seedThoughtPatterns(): void {
    const patterns: InsertThoughtPattern[] = [
      {
        name: "Catastrophizing",
        description: "Believing something is far worse than it actually is",
        examples: [
          "If I fail this test, my whole future is ruined",
          "My heart is racing, I must be having a heart attack"
        ],
        reframeStrategies: [
          "Consider the actual likelihood of the worst-case scenario",
          "Ask yourself what a friend would say about this situation",
          "Focus on what you can control rather than what you can't"
        ]
      },
      {
        name: "Mind Reading",
        description: "Assuming you know what others are thinking without evidence",
        examples: [
          "She didn't respond to my text, she must be mad at me",
          "Everyone at the party thinks I'm boring"
        ],
        reframeStrategies: [
          "Challenge the assumption by seeking evidence",
          "Consider alternative explanations for the behavior",
          "Ask directly instead of assuming"
        ]
      },
      {
        name: "Black & White Thinking",
        description: "Seeing things in absolute, all-or-nothing terms",
        examples: [
          "Either I do this perfectly or I'm a complete failure",
          "If you're not with me, you're against me"
        ],
        reframeStrategies: [
          "Look for the gray areas and middle ground",
          "Use a scale from 0-100 instead of all-or-nothing",
          "Accept that most things exist on a spectrum"
        ]
      },
      {
        name: "Emotional Reasoning",
        description: "Believing that what you feel must be true",
        examples: [
          "I feel stupid, so I must be stupid",
          "I feel like a burden, so I must be bothering everyone"
        ],
        reframeStrategies: [
          "Identify the emotion and separate it from facts",
          "Ask what evidence exists beyond the feeling",
          "Consider how you'd evaluate the situation without the emotion"
        ]
      }
    ];
    
    patterns.forEach(pattern => {
      const id = this.thoughtPatternIdCounter++;
      this.thoughtPatterns.set(id, { ...pattern, id });
    });
  }
  
  private seedMeditations(): void {
    const meditations: InsertMeditation[] = [
      {
        title: "Sleep Well",
        description: "A gentle meditation to help you drift into restful sleep",
        duration: 300, // 5 minutes
        category: "Sleep",
        audioUrl: null
      },
      {
        title: "Anxiety Relief",
        description: "Calm your mind and reduce anxiety with this short practice",
        duration: 180, // 3 minutes
        category: "Anxiety",
        audioUrl: null
      },
      {
        title: "Morning Focus",
        description: "Start your day with clarity and intention",
        duration: 240, // 4 minutes
        category: "Focus",
        audioUrl: null
      },
      {
        title: "Gratitude Practice",
        description: "Cultivate appreciation for the good in your life",
        duration: 300, // 5 minutes
        category: "Gratitude",
        audioUrl: null
      }
    ];
    
    meditations.forEach(meditation => {
      const id = this.meditationIdCounter++;
      this.meditations.set(id, { ...meditation, id });
    });
  }
}

export const storage = new MemStorage();
