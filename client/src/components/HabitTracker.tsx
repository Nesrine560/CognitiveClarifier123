import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Habit, User } from "@/types";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { FormField, FormItem, FormLabel, FormControl, Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { format, differenceInDays, isSameDay } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface HabitTrackerProps {
  user: User;
}

// Available icons for habits
const habitIcons = [
  "ri-walk-line",
  "ri-book-2-line",
  "ri-heart-pulse-line",
  "ri-water-flash-line",
  "ri-run-line",
  "ri-mental-health-line",
  "ri-user-heart-line",
  "ri-chat-smile-3-line",
  "ri-alarm-line",
  "ri-smartphone-line"
];

export default function HabitTracker({ user }: HabitTrackerProps) {
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch all habits for user
  const { data: habits, isLoading } = useQuery({
    queryKey: ["/api/habits", { userId: user.id }],
    queryFn: async ({ queryKey }) => {
      const response = await fetch(`/api/habits?userId=${user.id}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch habits");
      }
      return response.json() as Promise<Habit[]>;
    }
  });
  
  // Complete habit mutation
  const completeHabitMutation = useMutation({
    mutationFn: async (habitId: number) => {
      const response = await apiRequest("POST", `/api/habits/${habitId}/complete`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits", { userId: user.id }] });
      toast({
        title: "Habit completed",
        description: "Great job! You've made progress on your habit.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to mark habit as complete",
        description: "There was a problem updating your habit. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Function to check if a habit was completed today
  const isCompletedToday = (habit: Habit) => {
    if (!habit.completions || !habit.completions.length) return false;
    
    // Get the latest completion
    const latestCompletion = new Date(habit.completions[0].completedAt);
    return isSameDay(latestCompletion, new Date());
  };
  
  // Calculate streak for a habit
  const calculateStreak = (habit: Habit) => {
    if (!habit.completions || habit.completions.length === 0) return 0;
    
    // Sort completions by date, most recent first
    const sortedCompletions = [...habit.completions].sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
    
    let streak = 1;
    let currentDate = new Date(sortedCompletions[0].completedAt);
    
    for (let i = 1; i < sortedCompletions.length; i++) {
      const previousDate = new Date(sortedCompletions[i].completedAt);
      const dayDifference = differenceInDays(currentDate, previousDate);
      
      if (dayDifference === 1) {
        streak++;
        currentDate = previousDate;
      } else if (dayDifference > 1) {
        break;
      }
    }
    
    return streak;
  };
  
  return (
    <div className="bg-white rounded-xl shadow-card p-5 relative">
      <h2 className="text-lg font-semibold flex items-center">
        <i className="ri-calendar-todo-line mr-2 text-secondary-500"></i>
        Daily Habits
      </h2>
      <p className="mt-2 text-gray-600 text-sm">Track your progress on building healthy routines.</p>
      
      <div className="mt-4 space-y-4">
        {isLoading ? (
          <div className="text-center py-4">
            <i className="ri-loader-4-line animate-spin text-2xl text-primary-500"></i>
            <p className="text-sm text-gray-500 mt-2">Loading habits...</p>
          </div>
        ) : habits && habits.length > 0 ? (
          habits.map((habit) => (
            <div key={habit.id} className="flex justify-between items-center">
              <div className="flex items-center">
                <div className={`w-10 h-10 bg-${habit.icon?.includes("heart") ? "accent" : "secondary"}-100 rounded-full flex items-center justify-center`}>
                  <i className={`${habit.icon || "ri-calendar-check-line"} text-${habit.icon?.includes("heart") ? "accent" : "secondary"}-600`}></i>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium">{habit.name}</h3>
                  <div className="flex mt-1">
                    {/* Show last 5 days' status */}
                    {Array.from({ length: 5 }).map((_, index) => {
                      const date = new Date();
                      date.setDate(date.getDate() - index);
                      
                      // Check if there's a completion for this date
                      const isCompleted = habit.completions?.some(completion => 
                        isSameDay(new Date(completion.completedAt), date)
                      );
                      
                      return (
                        <div key={index} className={`w-5 h-5 rounded-full bg-${habit.icon?.includes("heart") ? "accent" : "secondary"}-100 mr-1 flex items-center justify-center`}>
                          <div className={`w-3 h-3 rounded-full ${isCompleted ? `bg-${habit.icon?.includes("heart") ? "accent" : "secondary"}-500` : "bg-transparent"}`}></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 rounded-full ${isCompletedToday(habit) 
                  ? `bg-${habit.icon?.includes("heart") ? "accent" : "secondary"}-200 text-${habit.icon?.includes("heart") ? "accent" : "secondary"}-700`
                  : `bg-${habit.icon?.includes("heart") ? "accent" : "secondary"}-100 text-${habit.icon?.includes("heart") ? "accent" : "secondary"}-700 hover:bg-${habit.icon?.includes("heart") ? "accent" : "secondary"}-200`}`}
                onClick={() => !isCompletedToday(habit) && completeHabitMutation.mutate(habit.id)}
                disabled={isCompletedToday(habit) || completeHabitMutation.isPending}
              >
                <i className="ri-check-line"></i>
              </Button>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            <i className="ri-calendar-line text-4xl mb-2"></i>
            <p>No habits yet. Add your first one!</p>
          </div>
        )}
        
        <Button
          className="mt-2 w-full"
          variant="outline"
          onClick={() => setIsAddHabitOpen(true)}
        >
          <i className="ri-add-line mr-2"></i> Add New Habit
        </Button>
      </div>
      
      <AddHabitDialog
        isOpen={isAddHabitOpen}
        onClose={() => setIsAddHabitOpen(false)}
        userId={user.id}
      />
    </div>
  );
}

// Form validation schema
const habitFormSchema = z.object({
  name: z.string().min(2, "Habit name must be at least 2 characters").max(50, "Habit name must be less than 50 characters"),
  description: z.string().optional(),
  icon: z.string(),
});

interface AddHabitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
}

function AddHabitDialog({ isOpen, onClose, userId }: AddHabitDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<z.infer<typeof habitFormSchema>>({
    resolver: zodResolver(habitFormSchema),
    defaultValues: {
      name: "",
      description: "",
      icon: "ri-walk-line",
    },
  });
  
  const createHabitMutation = useMutation({
    mutationFn: async (values: z.infer<typeof habitFormSchema>) => {
      const response = await apiRequest("POST", "/api/habits", {
        ...values,
        userId
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Habit created",
        description: "Your new habit has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/habits", { userId }] });
      form.reset();
      onClose();
    },
    onError: () => {
      toast({
        title: "Failed to create habit",
        description: "There was a problem creating your habit. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (values: z.infer<typeof habitFormSchema>) => {
    createHabitMutation.mutate(values);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Habit</DialogTitle>
          <DialogClose className="absolute right-4 top-4" />
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Habit Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Morning Walk" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Take a 15-minute walk after breakfast" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {habitIcons.map((icon) => (
                      <div 
                        key={icon}
                        className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer ${
                          field.value === icon ? "bg-primary-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                        onClick={() => form.setValue("icon", icon)}
                      >
                        <i className={`${icon} text-lg`}></i>
                      </div>
                    ))}
                  </div>
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={createHabitMutation.isPending}>
                {createHabitMutation.isPending ? (
                  <>
                    <i className="ri-loader-4-line animate-spin mr-2"></i>
                    Creating...
                  </>
                ) : (
                  "Create Habit"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Quick access card for habits
export function HabitCard({ openHabitsSection }: { openHabitsSection: () => void }) {
  return (
    <div 
      className="bg-secondary-50 rounded-xl p-4 shadow-soft relative overflow-hidden flex flex-col justify-between cursor-pointer"
      onClick={openHabitsSection}
    >
      <div className="relative z-10">
        <h3 className="text-secondary-900 font-medium">Habits</h3>
        <p className="text-sm text-secondary-700 mt-1">Keep building</p>
      </div>
      <div className="w-16 h-16 mt-2 self-end">
        <i className="ri-calendar-check-line text-4xl text-secondary-400"></i>
      </div>
    </div>
  );
}
