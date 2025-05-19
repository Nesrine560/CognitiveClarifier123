import { useState, useRef } from "react";
import { User } from "@/types";
import MoodTracker from "@/components/MoodTracker";
import MoodChart from "@/components/MoodChart";
import { BreathingCard } from "@/components/BreathingExercise";
import BreathingExerciseModal from "@/components/BreathingExercise";
import { HabitCard } from "@/components/HabitTracker";
import HabitTracker from "@/components/HabitTracker";
import ThoughtPatterns from "@/components/ThoughtPatterns";
import CBTJournal from "@/components/CBTJournal";
import Meditation from "@/components/Meditation";
import GroundingExercise from "@/components/GroundingExercise";
import AICopilot from "@/components/AICopilot";
import { useBreathingExercises } from "@/hooks/use-breathing-exercises";

interface HomeProps {
  user: User;
}

export default function Home({ user }: HomeProps) {
  const { defaultExercise } = useBreathingExercises();
  const [isBreathingModalOpen, setIsBreathingModalOpen] = useState(false);
  const habitsSectionRef = useRef<HTMLDivElement>(null);

  const scrollToHabits = () => {
    habitsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <section className="mb-8">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold text-gray-800">Bonjour, {user.name}</h1>
          <p className="text-gray-600">Comment vous sentez-vous aujourd'hui?</p>
        </div>
        
        <MoodTracker user={user} />
      </section>
      
      {/* Nouveau graphique d'évolution de l'humeur */}
      <section className="mb-8">
        <MoodChart user={user} />
      </section>
      
      <section className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BreathingCard onOpenExercise={() => setIsBreathingModalOpen(true)} />
          <HabitCard openHabitsSection={scrollToHabits} />
        </div>
        
        <div className="space-y-5">
          <CBTJournal user={user} />
          <Meditation user={user} />
          <GroundingExercise />
          <ThoughtPatterns />
          
          <div ref={habitsSectionRef}>
            <HabitTracker user={user} />
          </div>
        </div>
      </section>
      
      <AICopilot user={user} />
      
      <BreathingExerciseModal 
        isOpen={isBreathingModalOpen}
        onClose={() => setIsBreathingModalOpen(false)}
        exercise={defaultExercise}
      />
    </>
  );
}
