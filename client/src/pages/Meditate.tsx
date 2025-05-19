import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User, Meditation as MeditationType } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";

interface MeditateProps {
  user: User;
}

export default function Meditate({ user }: MeditateProps) {
  const [activeMeditation, setActiveMeditation] = useState<MeditationType | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Fetch all meditations
  const { data: meditations, isLoading } = useQuery({
    queryKey: ["/api/meditations"],
    queryFn: async () => {
      const response = await fetch("/api/meditations", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch meditations");
      }
      return response.json() as Promise<MeditationType[]>;
    }
  });
  
  const startMeditation = (meditation: MeditationType) => {
    setActiveMeditation(meditation);
    setTimeRemaining(meditation.duration);
    
    // Start the timer
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Meditation complete, clear interval
          clearInterval(interval);
          setIsPlaying(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setTimerInterval(interval);
    setIsPlaying(true);
  };
  
  const pauseMeditation = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setIsPlaying(false);
  };
  
  const resumeMeditation = () => {
    if (!activeMeditation) return;
    
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Meditation complete, clear interval
          clearInterval(interval);
          setIsPlaying(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setTimerInterval(interval);
    setIsPlaying(true);
  };
  
  const stopMeditation = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setIsPlaying(false);
    setActiveMeditation(null);
  };
  
  // Format seconds into mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Group meditations by category
  const getMeditationsByCategory = () => {
    if (!meditations) return {};
    
    return meditations.reduce((acc, meditation) => {
      if (!acc[meditation.category]) {
        acc[meditation.category] = [];
      }
      acc[meditation.category].push(meditation);
      return acc;
    }, {} as Record<string, MeditationType[]>);
  };
  
  const meditationsByCategory = getMeditationsByCategory();
  const categories = Object.keys(meditationsByCategory);
  
  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Meditations</h1>
        <p className="text-gray-600 mt-1">Guided sessions to help you relax, focus, and find balance</p>
      </header>
      
      {isLoading ? (
        <div className="text-center py-12">
          <i className="ri-loader-4-line animate-spin text-3xl text-accent-500"></i>
          <p className="text-gray-500 mt-4">Loading meditation sessions...</p>
        </div>
      ) : (
        <>
          {/* Featured meditation card */}
          <div 
            className="bg-accent-50 rounded-xl p-6 mb-8 cursor-pointer"
            onClick={() => meditations && meditations.length > 0 && startMeditation(meditations[0])}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center">
                  <div className="bg-accent-200 p-2 rounded-full mr-3">
                    <i className="ri-mental-health-line text-accent-700 text-xl"></i>
                  </div>
                  <h2 className="text-xl font-medium text-accent-900">Daily Meditation</h2>
                </div>
                <p className="text-accent-700 mt-2">
                  Take a few minutes to center yourself and find calm
                </p>
                <Button 
                  className="mt-4 bg-accent-500 hover:bg-accent-600"
                >
                  <i className="ri-play-fill mr-2"></i> Start Session
                </Button>
              </div>
              
              <div className="hidden md:block w-32 h-32 rounded-full bg-accent-200 flex items-center justify-center">
                <i className="ri-mental-health-line text-accent-500 text-5xl"></i>
              </div>
            </div>
          </div>
          
          {/* Meditation categories */}
          {categories.length > 0 ? (
            <Tabs defaultValue={categories[0]} className="space-y-6">
              <TabsList className="mb-4">
                {categories.map(category => (
                  <TabsTrigger key={category} value={category}>
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {categories.map(category => (
                <TabsContent key={category} value={category}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {meditationsByCategory[category].map(meditation => (
                      <Card 
                        key={meditation.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => startMeditation(meditation)}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium text-accent-900">{meditation.title}</h3>
                              <p className="text-sm text-gray-600 mt-1">{meditation.description}</p>
                            </div>
                            <div className="text-sm text-accent-700">
                              {Math.floor(meditation.duration / 60)} min
                            </div>
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="bg-accent-100 p-1 rounded-full">
                                <i className="ri-mental-health-line text-accent-600"></i>
                              </div>
                              <span className="ml-2 text-xs text-gray-500">{category}</span>
                            </div>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="text-accent-600 hover:text-accent-800"
                            >
                              <i className="ri-play-circle-line text-lg"></i>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="text-center py-8 bg-white rounded-lg shadow-sm">
              <i className="ri-mental-health-line text-4xl text-gray-300"></i>
              <h3 className="text-xl font-medium text-gray-700 mt-4">No meditations available</h3>
              <p className="text-gray-500 mt-2">
                Please check back later for meditation sessions.
              </p>
            </div>
          )}
        </>
      )}
      
      {/* Meditation Player Dialog */}
      <Dialog open={!!activeMeditation} onOpenChange={(open) => !open && stopMeditation()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{activeMeditation?.title}</DialogTitle>
            <DialogClose className="absolute right-4 top-4" />
          </DialogHeader>
          
          {activeMeditation && (
            <div className="py-4 text-center">
              <p className="text-gray-600 mb-8">{activeMeditation.description}</p>
              
              <div className="w-40 h-40 rounded-full bg-accent-100 mx-auto flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-accent-200 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-accent-300 flex items-center justify-center">
                    <span className="text-2xl font-semibold text-accent-900">{formatTime(timeRemaining)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center mt-8 space-x-4">
                {isPlaying ? (
                  <Button 
                    variant="outline"
                    size="icon"
                    className="rounded-full w-12 h-12"
                    onClick={pauseMeditation}
                  >
                    <i className="ri-pause-fill text-2xl"></i>
                  </Button>
                ) : (
                  <Button 
                    variant="default"
                    size="icon"
                    className="rounded-full w-12 h-12 bg-accent-500 hover:bg-accent-600"
                    onClick={resumeMeditation}
                  >
                    <i className="ri-play-fill text-2xl"></i>
                  </Button>
                )}
                
                <Button 
                  variant="outline"
                  size="icon"
                  className="rounded-full w-12 h-12"
                  onClick={stopMeditation}
                >
                  <i className="ri-stop-fill text-2xl"></i>
                </Button>
              </div>
              
              <p className="mt-6 text-sm text-gray-500">
                {isPlaying ? "Breathe deeply and focus on the present moment" : "Ready to begin your meditation session?"}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
