import { useState } from "react";
import { motion } from "framer-motion";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface OnboardingProps {
  user: User;
  onComplete: () => void;
}

export default function Onboarding({ user, onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    {
      title: "Bienvenue sur MindJourney",
      description: "Nous sommes ravis de vous accompagner dans votre parcours de bien-être mental. Découvrons ensemble les fonctionnalités qui vous aideront à prendre soin de vous.",
      image: "✨",
    },
    {
      title: "Suivi de votre humeur",
      description: "Prenez un moment chaque jour pour noter votre humeur. Cela vous aidera à identifier des tendances et à mieux comprendre vos émotions au fil du temps.",
      image: "📊",
    },
    {
      title: "Restructuration des pensées",
      description: "Notre outil de TCC (Thérapie Cognitive Comportementale) vous aide à transformer vos pensées négatives en perspectives plus équilibrées.",
      image: "🧠",
    },
    {
      title: "Votre coach IA personnel",
      description: "Notre assistant IA est disponible 24/7 pour vous guider, répondre à vos questions et vous accompagner dans vos exercices de bien-être mental.",
      image: "🤖",
    },
    {
      title: "Fixez vos objectifs",
      description: "Définissez des objectifs de bien-être et obtenez des plans d'action personnalisés pour les atteindre progressivement.",
      image: "🎯",
    },
  ];
  
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const skipOnboarding = () => {
    onComplete();
  };
  
  const variants = {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      <Card className="max-w-md w-full overflow-hidden bg-calm-gradient">
        <CardContent className="p-0 relative">
          {/* Indicateur de progression */}
          <div className="absolute top-4 left-0 right-0 flex justify-center gap-1.5 z-10">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  index === currentStep ? "w-6 bg-primary" : "w-2 bg-primary/30"
                }`}
              />
            ))}
          </div>
          
          {/* Contenu de l'étape */}
          <motion.div
            key={currentStep}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="min-h-[400px] p-8 pt-12 flex flex-col items-center justify-center text-center"
          >
            <div className="text-5xl mb-6 animate-breath">{steps[currentStep].image}</div>
            <h2 className="text-xl font-medium mb-4">{steps[currentStep].title}</h2>
            <p className="text-muted-foreground mb-8">{steps[currentStep].description}</p>
            
            <div className="flex gap-3 mt-auto pt-6">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="px-5"
                >
                  Précédent
                </Button>
              )}
              <Button
                onClick={nextStep}
                className="px-5 bg-primary btn-glow"
              >
                {currentStep === steps.length - 1 ? "Commencer" : "Suivant"}
              </Button>
            </div>
            
            {currentStep === 0 && (
              <button
                onClick={skipOnboarding}
                className="mt-4 text-sm text-muted-foreground hover:text-foreground"
              >
                Passer l'introduction
              </button>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
}