import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Mood, MoodOption, User } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface MoodTrackerProps {
  user: User;
}

export default function MoodTracker({ user }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
  const [note, setNote] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const moodOptions: MoodOption[] = [
    { emoji: "😊", label: "Happy" },
    { emoji: "😌", label: "Calm" },
    { emoji: "😐", label: "Neutral" },
    { emoji: "😔", label: "Sad" },
    { emoji: "😢", label: "Upset" }
  ];
  
  // Fetch existing moods
  const { data: moods } = useQuery({
    queryKey: ["/api/moods", { userId: user.id }],
    queryFn: async ({ queryKey }) => {
      const response = await fetch(`/api/moods?userId=${user.id}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch moods");
      }
      return response.json() as Promise<Mood[]>;
    }
  });
  
  // Create mood mutation
  const createMoodMutation = useMutation({
    mutationFn: async (newMood: { userId: number; emoji: string; label: string; intensity: number; note?: string }) => {
      const response = await apiRequest("POST", "/api/moods", newMood);
      return response.json();
    },
    onSuccess: () => {
      // Reset form
      setSelectedMood(null);
      setNote("");
      
      // Show success toast
      toast({
        title: "Mood saved",
        description: "Your mood has been tracked successfully.",
      });
      
      // Invalidate moods query to refetch
      queryClient.invalidateQueries({ queryKey: ["/api/moods", { userId: user.id }] });
    },
    onError: () => {
      toast({
        title: "Failed to save mood",
        description: "There was a problem saving your mood. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleSaveMood = () => {
    if (!selectedMood) {
      toast({
        title: "Please select a mood",
        description: "Select how you're feeling before saving.",
        variant: "destructive",
      });
      return;
    }
    
    createMoodMutation.mutate({
      userId: user.id,
      emoji: selectedMood.emoji,
      label: selectedMood.label,
      intensity: moodOptions.findIndex(m => m.label === selectedMood.label) + 1,
      note: note.trim() || undefined
    });
  };
  
  return (
    <div className="mt-6 bg-white rounded-xl shadow-card p-5">
      <h2 className="text-lg font-medium mb-4">Today's Mood</h2>
      <div className="grid grid-cols-5 gap-3">
        {moodOptions.map((option) => (
          <button
            key={option.label}
            className={`flex flex-col items-center justify-center py-3 rounded-lg transition ${
              selectedMood?.label === option.label 
                ? "bg-primary-100 ring-2 ring-primary-500" 
                : "hover:bg-gray-50"
            }`}
            onClick={() => setSelectedMood(option)}
          >
            <span className="text-2xl mb-1">{option.emoji}</span>
            <span className="text-xs">{option.label}</span>
          </button>
        ))}
      </div>
      
      <div className="mt-4">
        <Textarea
          placeholder="Add a note about how you're feeling..."
          className="w-full resize-none"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      
      <Button 
        className="mt-3 w-full"
        onClick={handleSaveMood}
        disabled={createMoodMutation.isPending}
      >
        {createMoodMutation.isPending ? (
          <>
            <i className="ri-loader-4-line animate-spin mr-2"></i> Saving...
          </>
        ) : (
          <>
            <i className="ri-check-line mr-2"></i> Save Mood
          </>
        )}
      </Button>
    </div>
  );
}
