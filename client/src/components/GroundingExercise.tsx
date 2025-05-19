import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function GroundingExercise() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [inputs, setInputs] = useState<string[]>(['', '', '', '', '']);
  const [isGuideActive, setIsGuideActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  const steps = [
    { 
      title: "5 Things You Can See", 
      description: "Look around and name 5 things you can see right now."
    },
    { 
      title: "4 Things You Can Touch", 
      description: "Find 4 things you can physically feel or touch."
    },
    { 
      title: "3 Things You Can Hear", 
      description: "Listen carefully and identify 3 sounds you can hear."
    },
    { 
      title: "2 Things You Can Smell", 
      description: "Notice 2 scents in your environment."
    },
    { 
      title: "1 Thing You Can Taste", 
      description: "Identify 1 thing you can taste right now."
    }
  ];
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isGuideActive && timeRemaining > 0) {
      timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (isGuideActive && timeRemaining === 0 && currentStep < steps.length - 1) {
      // Move to next step when timer expires
      setCurrentStep(prev => prev + 1);
      setTimeRemaining(30); // Reset timer for next step
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isGuideActive, timeRemaining, currentStep, steps.length]);
  
  const startGuide = () => {
    setIsGuideActive(true);
    setCurrentStep(0);
    setTimeRemaining(30); // 30 seconds per step
    setInputs(['', '', '', '', '']);
  };
  
  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setTimeRemaining(30); // Reset timer for next step
    } else {
      // Exercise complete
      finishExercise();
    }
  };
  
  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setTimeRemaining(30); // Reset timer for previous step
    }
  };
  
  const handleInputChange = (value: string) => {
    const newInputs = [...inputs];
    newInputs[currentStep] = value;
    setInputs(newInputs);
  };
  
  const finishExercise = () => {
    setIsGuideActive(false);
    // Show completion message or reset for next time
  };
  
  const closeDialog = () => {
    setIsDialogOpen(false);
    setIsGuideActive(false);
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center">
            <i className="ri-focus-3-line mr-2 text-secondary-500"></i>
            Grounding Exercises
          </CardTitle>
          <CardDescription>
            Bring yourself back to the present moment with these techniques.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-secondary-50 rounded-lg p-4">
            <h3 className="font-medium text-secondary-900">5-4-3-2-1 Technique</h3>
            <p className="text-sm text-secondary-700 mt-1">Find and name:</p>
            <ul className="mt-2 space-y-1 text-sm text-secondary-800">
              <li className="flex items-start">
                <span className="font-medium mr-2">5</span> things you can see
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">4</span> things you can touch
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">3</span> things you can hear
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">2</span> things you can smell
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">1</span> thing you can taste
              </li>
            </ul>
            <Button 
              className="mt-3 w-full bg-secondary-500 text-white hover:bg-secondary-600"
              onClick={() => setIsDialogOpen(true)}
            >
              <i className="ri-play-line mr-2"></i> Start Guide
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Grounding Exercise Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>5-4-3-2-1 Grounding Technique</DialogTitle>
            <DialogClose className="absolute right-4 top-4" />
          </DialogHeader>
          
          <div className="py-4">
            {!isGuideActive ? (
              <div className="text-center space-y-4">
                <p className="text-gray-600">
                  This technique helps bring your attention to the present moment by engaging your five senses.
                </p>
                <p className="text-gray-600">
                  Take your time with each step, and focus on the physical sensations.
                </p>
                <Button 
                  onClick={startGuide}
                  className="mt-4 bg-secondary-500 hover:bg-secondary-600"
                >
                  Begin Exercise
                </Button>
              </div>
            ) : (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Step {currentStep + 1} of {steps.length}</span>
                  <span>{timeRemaining} seconds</span>
                </div>
                
                <div className="w-full bg-gray-200 h-2 rounded-full mb-4">
                  <motion.div 
                    className="bg-secondary-500 h-2 rounded-full"
                    initial={{ width: "100%" }}
                    animate={{ width: `${(timeRemaining / 30) * 100}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-medium text-secondary-900">{steps[currentStep].title}</h3>
                    <p className="text-gray-600">{steps[currentStep].description}</p>
                    
                    <Textarea
                      value={inputs[currentStep]}
                      onChange={(e) => handleInputChange(e.target.value)}
                      placeholder={`Enter ${steps[currentStep].title.toLowerCase()}...`}
                      rows={3}
                      className="mt-2"
                    />
                  </motion.div>
                </AnimatePresence>
                
                <div className="flex justify-between mt-6">
                  <Button 
                    variant="outline" 
                    onClick={handlePreviousStep}
                    disabled={currentStep === 0}
                  >
                    Previous
                  </Button>
                  <Button 
                    onClick={handleNextStep}
                    className="bg-secondary-500 hover:bg-secondary-600"
                  >
                    {currentStep === steps.length - 1 ? "Finish" : "Next"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
