import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BreathingExercise as BreathingExerciseType } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

interface BreathingExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: BreathingExerciseType;
}

export default function BreathingExerciseModal({ isOpen, onClose, exercise }: BreathingExerciseModalProps) {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [timeLeft, setTimeLeft] = useState(exercise.inhaleTime);
  const [currentCycle, setCurrentCycle] = useState(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Reset timer when exercise changes or modal closes
  useEffect(() => {
    resetExercise();
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [exercise, isOpen]);
  
  const resetExercise = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsActive(false);
    setPhase("inhale");
    setTimeLeft(exercise.inhaleTime);
    setCurrentCycle(1);
  };
  
  const startExercise = () => {
    setIsActive(true);
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time for this phase is up, move to next phase
          if (phase === "inhale") {
            setPhase("hold");
            return exercise.holdTime;
          } else if (phase === "hold") {
            setPhase("exhale");
            return exercise.exhaleTime;
          } else {
            // Exhale complete, check if we need to start a new cycle
            if (currentCycle < exercise.cycles) {
              setCurrentCycle((prev) => prev + 1);
              setPhase("inhale");
              return exercise.inhaleTime;
            } else {
              // Exercise complete
              if (timerRef.current) {
                clearInterval(timerRef.current);
              }
              setIsActive(false);
              return 0;
            }
          }
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  const circleVariants = {
    inhale: {
      scale: 1,
      opacity: 1,
      transition: { duration: exercise.inhaleTime / 10, ease: "easeInOut" }
    },
    hold: {
      scale: 1,
      opacity: 1,
      transition: { duration: exercise.holdTime / 10 }
    },
    exhale: {
      scale: 0.8,
      opacity: 0.7,
      transition: { duration: exercise.exhaleTime / 10, ease: "easeInOut" }
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Breathing Exercise</DialogTitle>
          <DialogClose className="absolute right-4 top-4 text-gray-500 hover:text-gray-700" />
        </DialogHeader>
        
        <div className="text-center py-5">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-primary-800 mb-1">{exercise.name}</h3>
            <p className="text-gray-600 text-sm">{exercise.description}</p>
          </div>
          
          <div className="relative flex justify-center">
            <AnimatePresence>
              <motion.div
                className="w-40 h-40 rounded-full bg-primary-100 flex items-center justify-center"
                variants={circleVariants}
                animate={isActive ? phase : "inhale"}
                initial="inhale"
              >
                <motion.div
                  className="w-32 h-32 rounded-full bg-primary-200 flex items-center justify-center"
                  variants={circleVariants}
                  animate={isActive ? phase : "inhale"}
                  initial="inhale"
                >
                  <motion.div
                    className="w-24 h-24 rounded-full bg-primary-300 flex items-center justify-center"
                    variants={circleVariants}
                    animate={isActive ? phase : "inhale"}
                    initial="inhale"
                  >
                    <div className="text-primary-800 font-medium capitalize">{phase}</div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
          
          <div className="mt-8 flex flex-col items-center">
            <div className="text-3xl font-semibold text-primary-800 mb-2">{timeLeft}</div>
            <div className="text-sm text-gray-600 mb-4">
              Cycle {currentCycle} of {exercise.cycles}
            </div>
            <Button 
              onClick={isActive ? resetExercise : startExercise} 
              variant={isActive ? "outline" : "default"}
              className={isActive ? "bg-gray-100 hover:bg-gray-200" : ""}
            >
              {isActive ? "Reset" : "Start"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Quick access card for breathing exercises
interface BreathingCardProps {
  onOpenExercise: () => void;
}

export function BreathingCard({ onOpenExercise }: BreathingCardProps) {
  return (
    <div 
      className="bg-primary-50 rounded-xl p-4 shadow-soft relative overflow-hidden flex flex-col justify-between cursor-pointer"
      onClick={onOpenExercise}
    >
      <div className="relative z-10">
        <h3 className="text-primary-900 font-medium">Breathing</h3>
        <p className="text-sm text-primary-700 mt-1">Calm your mind</p>
      </div>
      <div className="w-16 h-16 mt-2 self-end">
        <i className="ri-contrast-2-line text-4xl text-primary-400"></i>
      </div>
    </div>
  );
}
