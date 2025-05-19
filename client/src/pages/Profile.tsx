import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User, Mood, JournalEntry, Habit } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays, eachDayOfInterval } from "date-fns";

interface ProfileProps {
  user: User;
}

export default function Profile({ user }: ProfileProps) {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch user's moods
  const { data: moods, isLoading: moodsLoading } = useQuery({
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
  
  // Fetch user's journal entries
  const { data: journalEntries, isLoading: journalLoading } = useQuery({
    queryKey: ["/api/journal", { userId: user.id }],
    queryFn: async ({ queryKey }) => {
      const response = await fetch(`/api/journal?userId=${user.id}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch journal entries");
      }
      return response.json() as Promise<JournalEntry[]>;
    }
  });
  
  // Fetch user's habits
  const { data: habits, isLoading: habitsLoading } = useQuery({
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
  
  // Prepare data for mood chart
  const getMoodChartData = () => {
    if (!moods || moods.length === 0) return [];
    
    // Get the last 7 days
    const endDate = new Date();
    const startDate = subDays(endDate, 6);
    
    // Create an array with all days
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Map moods to those days
    return days.map(day => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayMoods = moods.filter(mood => 
        format(new Date(mood.createdAt), "yyyy-MM-dd") === dayStr
      );
      
      // Calculate average mood intensity for the day (or 0 if no moods)
      const avgIntensity = dayMoods.length 
        ? dayMoods.reduce((sum, mood) => sum + mood.intensity, 0) / dayMoods.length
        : 0;
      
      return {
        date: format(day, "MMM d"),
        intensity: avgIntensity,
        // Add the first mood emoji of the day if available
        emoji: dayMoods.length > 0 ? dayMoods[0].emoji : "",
      };
    });
  };
  
  // Calculate habit streak data
  const getHabitStreaks = () => {
    if (!habits) return [];
    
    return habits.map(habit => {
      // Count consecutive days with completions
      let streak = 0;
      let maxStreak = 0;
      
      if (habit.completions && habit.completions.length > 0) {
        // Sort completions by date, most recent first
        const sortedCompletions = [...habit.completions].sort(
          (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        );
        
        // Count current streak
        let currentDate = new Date();
        let prevDate = new Date(currentDate);
        
        for (const completion of sortedCompletions) {
          const completionDate = new Date(completion.completedAt);
          
          // Check if this completion is on the expected date
          if (format(completionDate, "yyyy-MM-dd") === format(prevDate, "yyyy-MM-dd") ||
              format(completionDate, "yyyy-MM-dd") === format(subDays(prevDate, 1), "yyyy-MM-dd")) {
            streak++;
            prevDate = completionDate;
          } else {
            break;
          }
        }
        
        // Set max streak
        maxStreak = streak;
      }
      
      return {
        ...habit,
        streak,
        maxStreak
      };
    });
  };
  
  const moodChartData = getMoodChartData();
  const habitStreaks = getHabitStreaks();
  const isLoading = moodsLoading || journalLoading || habitsLoading;
  
  return (
    <>
      <header className="mb-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-primary-700 font-medium">{user.name?.charAt(0) || user.username.charAt(0)}</span>
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">{user.name || user.username}</h1>
            <p className="text-gray-600">Your wellness journey</p>
          </div>
        </div>
      </header>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          {isLoading ? (
            <div className="text-center py-8">
              <i className="ri-loader-4-line animate-spin text-3xl text-primary-500"></i>
              <p className="text-gray-500 mt-4">Loading your profile data...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Mood Overview Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Mood Journey</CardTitle>
                  <CardDescription>How you've been feeling over the past week</CardDescription>
                </CardHeader>
                <CardContent>
                  {moods && moods.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={moodChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value, name) => [`Intensity: ${value}`, "Mood"]}
                            labelFormatter={(label) => `Date: ${label}`}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="intensity" 
                            stroke="hsl(var(--primary))" 
                            fill="hsl(var(--primary))" 
                            fillOpacity={0.2} 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                      <div className="flex justify-center mt-4">
                        {moodChartData.map((day, index) => (
                          <div key={index} className="flex flex-col items-center mx-2">
                            <span className="text-lg">{day.emoji || "😶"}</span>
                            <span className="text-xs text-gray-500">{day.date}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No mood data available yet.</p>
                      <Button className="mt-3" variant="outline" onClick={() => window.location.href = "/"}>
                        Track Your First Mood
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-primary-100 p-3 rounded-full mb-3">
                        <i className="ri-psychology-line text-primary-700 text-xl"></i>
                      </div>
                      <h3 className="text-3xl font-bold text-primary-800">{journalEntries?.length || 0}</h3>
                      <p className="text-gray-600">Journal Entries</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-secondary-100 p-3 rounded-full mb-3">
                        <i className="ri-calendar-check-line text-secondary-700 text-xl"></i>
                      </div>
                      <h3 className="text-3xl font-bold text-secondary-800">{habits?.length || 0}</h3>
                      <p className="text-gray-600">Active Habits</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-accent-100 p-3 rounded-full mb-3">
                        <i className="ri-mental-health-line text-accent-700 text-xl"></i>
                      </div>
                      <h3 className="text-3xl font-bold text-accent-800">
                        {/* Calculate total meditation minutes if available */}
                        {moods ? moods.length : 0}
                      </h3>
                      <p className="text-gray-600">Mood Entries</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Habit Streaks */}
              {habits && habits.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Habit Streaks</CardTitle>
                    <CardDescription>Your consistency with daily habits</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {habitStreaks.map(habit => (
                        <div key={habit.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 bg-${habit.icon?.includes("heart") ? "accent" : "secondary"}-100 rounded-full flex items-center justify-center mr-3`}>
                              <i className={`${habit.icon || "ri-calendar-check-line"} text-${habit.icon?.includes("heart") ? "accent" : "secondary"}-600`}></i>
                            </div>
                            <div>
                              <h4 className="font-medium">{habit.name}</h4>
                              <p className="text-xs text-gray-500">{habit.description || "Daily habit"}</p>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-secondary-800">{habit.streak}</div>
                            <p className="text-xs text-gray-500">day streak</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="progress">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Progress</CardTitle>
                <CardDescription>Track your mental wellness journey over time</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-16">
                <i className="ri-line-chart-line text-5xl text-gray-300"></i>
                <h3 className="text-lg font-medium text-gray-700 mt-4">Progress tracking coming soon</h3>
                <p className="text-gray-500 mt-2 max-w-md mx-auto">
                  We're building advanced analytics to help you see patterns in your mood and habits over time.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Username</h3>
                    <p className="mt-1">{user.username}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="mt-1">{user.email || "No email set"}</p>
                  </div>
                  
                  <div className="pt-4">
                    <Button variant="outline">Edit Profile</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>Control your data and privacy preferences</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-16">
                <i className="ri-lock-line text-5xl text-gray-300"></i>
                <h3 className="text-lg font-medium text-gray-700 mt-4">Privacy settings coming soon</h3>
                <p className="text-gray-500 mt-2 max-w-md mx-auto">
                  We're building enhanced privacy controls to give you more control over your data.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
