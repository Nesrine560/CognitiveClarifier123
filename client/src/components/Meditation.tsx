import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Meditation as MeditationType, User } from "@/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { formatDuration } from "date-fns";

interface MeditationProps {
  user: User;
}

export default function Meditation({ user }: MeditationProps) {
  const [activeMeditation, setActiveMeditation] = useState<MeditationType | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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
  
  // Complete meditation mutation
  const completeMeditationMutation = useMutation({
    mutationFn: async (meditationId: number) => {
      const response = await apiRequest("POST", `/api/meditations/${meditationId}/complete`, {
        userId: user.id
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meditations"] });
      toast({
        title: "Meditation completed",
        description: "Great job! Your meditation session has been recorded.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to record meditation",
        description: "There was a problem recording your meditation. Please try again.",
        variant: "destructive",
      });
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
          // Record completion
          completeMeditationMutation.mutate(meditation.id);
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
          // Record completion
          completeMeditationMutation.mutate(activeMeditation.id);
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
  
  // Close player dialog
  const handleClose = () => {
    stopMeditation();
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
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center">
            <i className="ri-mental-health-line mr-2 text-accent-400"></i>
            Meditations
          </CardTitle>
          <CardDescription>
            Short guided sessions to help you relax, focus, and find balance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">
              <i className="ri-loader-4-line animate-spin text-2xl text-accent-500"></i>
              <p className="text-sm text-gray-500 mt-2">Loading meditations...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(meditationsByCategory).slice(0, 2).flatMap(([category, categoryMeditations]) => 
                  categoryMeditations.slice(0, 1).map(meditation => (
                    <div 
                      key={meditation.id}
                      className="bg-accent-50 rounded-lg p-3 flex flex-col cursor-pointer hover:bg-accent-100"
                      onClick={() => startMeditation(meditation)}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-accent-900">{meditation.title}</span>
                        <span className="text-xs text-accent-700">{Math.floor(meditation.duration / 60)} min</span>
                      </div>
                      <div className="mt-auto pt-2 flex items-center">
                        <button className="text-accent-700 hover:text-accent-900">
                          <i className="ri-play-circle-line text-lg"></i>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <Button 
                variant="outline" 
                className="mt-4 w-full border-accent-300 text-accent-700 hover:bg-accent-50"
              >
                See all meditations
              </Button>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Meditation Player Dialog */}
      <Dialog open={!!activeMeditation} onOpenChange={(open) => !open && handleClose()}>
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
