import { useState } from "react";
import { BreathingExercise } from "@/types";

export function useBreathingExercises() {
  // Default breathing exercises
  const breathingExercises: BreathingExercise[] = [
    {
      id: "4-7-8",
      name: "4-7-8 Breathing",
      description: "Inhale for 4, hold for 7, exhale for 8",
      inhaleTime: 4,
      holdTime: 7,
      exhaleTime: 8,
      cycles: 4
    },
    {
      id: "box",
      name: "Box Breathing",
      description: "Inhale for 4, hold for 4, exhale for 4, hold for 4",
      inhaleTime: 4,
      holdTime: 4,
      exhaleTime: 4,
      cycles: 4
    },
    {
      id: "deep",
      name: "Deep Breathing",
      description: "Slow, deep breaths to calm the nervous system",
      inhaleTime: 5,
      holdTime: 2,
      exhaleTime: 6,
      cycles: 5
    },
    {
      id: "relaxing",
      name: "Relaxing Breath",
      description: "Gentle breaths to promote relaxation",
      inhaleTime: 3,
      holdTime: 0,
      exhaleTime: 6,
      cycles: 6
    }
  ];
  
  // Use the first exercise as the default
  const defaultExercise = breathingExercises[0];
  
  // State to track the currently selected exercise
  const [currentExercise, setCurrentExercise] = useState<BreathingExercise>(defaultExercise);
  
  // Function to get an exercise by ID
  const getExerciseById = (id: string): BreathingExercise => {
    const exercise = breathingExercises.find(ex => ex.id === id);
    return exercise || defaultExercise;
  };
  
  return {
    breathingExercises,
    defaultExercise,
    currentExercise,
    setCurrentExercise,
    getExerciseById
  };
}
