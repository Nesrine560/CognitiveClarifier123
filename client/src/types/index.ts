// User types
export interface User {
  id: number;
  username: string;
  name?: string;
  email?: string;
}

// Mood types
export interface Mood {
  id: number;
  userId: number;
  emoji: string;
  label: string;
  intensity: number;
  note?: string;
  createdAt: string | Date;
}

export type MoodOption = {
  emoji: string;
  label: string;
};

// Journal types
export interface JournalEntry {
  id: number;
  userId: number;
  situation: string;
  emotion: string;
  thought: string;
  challenge?: string;
  reframe?: string;
  createdAt: string | Date;
}

// Habit types
export interface Habit {
  id: number;
  userId: number;
  name: string;
  description?: string;
  icon?: string;
  createdAt: string | Date;
  completions?: HabitCompletion[];
}

export interface HabitCompletion {
  id: number;
  habitId: number;
  completedAt: string | Date;
}

// Thought pattern types
export interface ThoughtPattern {
  id: number;
  name: string;
  description: string;
  examples: string[];
  reframeStrategies: string[];
}

// Meditation types
export interface Meditation {
  id: number;
  title: string;
  description: string;
  duration: number;
  category: string;
  audioUrl?: string;
}

export interface MeditationCompletion {
  id: number;
  userId: number;
  meditationId: number;
  completedAt: string | Date;
}

// Breathing exercise types
export interface BreathingExercise {
  id: string;
  name: string;
  description: string;
  inhaleTime: number;
  holdTime: number;
  exhaleTime: number;
  cycles: number;
}

// CBT AI response
export interface CBTAnalysisResponse {
  thoughtPattern: string;
  patternExplanation: string;
  challenge: string;
  reframe: string;
}
