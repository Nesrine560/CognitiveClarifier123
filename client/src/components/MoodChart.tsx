import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays } from "date-fns";
import { Mood, User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface MoodChartProps {
  user: User;
}

interface ChartData {
  date: string;
  formattedDate: string;
  originalDate: Date;
  intensity: number;
  emoji: string;
}

export default function MoodChart({ user }: MoodChartProps) {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  
  // Fetch moods data
  const { data: moods, isLoading } = useQuery({
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
  
  // Process moods data for chart
  useEffect(() => {
    if (moods && moods.length > 0) {
      // Get the last 14 days
      const endDate = new Date();
      const startDate = subDays(endDate, 13); // 14 days including today
      
      // Initialize data for each day (including days with no entries)
      const days: Record<string, ChartData> = {};
      for (let i = 0; i < 14; i++) {
        const date = subDays(endDate, i);
        const dateStr = format(date, "yyyy-MM-dd");
        days[dateStr] = {
          date: dateStr,
          formattedDate: format(date, "dd MMM"),
          originalDate: date,
          intensity: 0,
          emoji: ""
        };
      }
      
      // Fill in with actual mood data
      moods.forEach(mood => {
        const moodDate = new Date(mood.createdAt);
        const dateStr = format(moodDate, "yyyy-MM-dd");
        
        // Only include data for the last 14 days
        if (moodDate >= startDate && days[dateStr]) {
          if (!days[dateStr].intensity) { // Use first mood of the day if multiple exist
            days[dateStr].intensity = mood.intensity;
            days[dateStr].emoji = mood.emoji;
          }
        }
      });
      
      // Convert to array and sort by date
      const dataArray = Object.values(days).sort((a, b) => 
        a.originalDate.getTime() - b.originalDate.getTime()
      );
      
      setChartData(dataArray);
    } else {
      // No moods data, create empty chart
      const emptyData: ChartData[] = [];
      const endDate = new Date();
      
      for (let i = 13; i >= 0; i--) {
        const date = subDays(endDate, i);
        emptyData.push({
          date: format(date, "yyyy-MM-dd"),
          formattedDate: format(date, "dd MMM"),
          originalDate: date,
          intensity: 0,
          emoji: ""
        });
      }
      
      setChartData(emptyData);
    }
  }, [moods]);
  
  const getMoodLabel = (intensity: number): string => {
    if (intensity === 0) return "Aucune donnée";
    if (intensity === 1) return "Très bas";
    if (intensity === 2) return "Bas";
    if (intensity === 3) return "Neutre";
    if (intensity === 4) return "Bon";
    return "Excellent";
  };
  
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-md shadow-md border border-gray-200">
          <p className="text-sm font-medium">{data.formattedDate}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-lg">{data.emoji || "😶"}</span>
            <span className="text-sm text-gray-700">{getMoodLabel(data.intensity)}</span>
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center">
          <i className="ri-line-chart-line mr-2 text-primary-500"></i>
          Courbe d'humeur
        </CardTitle>
        <CardDescription>
          Suivez l'évolution de votre humeur au cours des deux dernières semaines
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-[200px] w-full" />
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis 
                  dataKey="formattedDate" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis 
                  domain={[0, 5]} 
                  ticks={[0, 1, 2, 3, 4, 5]} 
                  tickFormatter={getMoodLabel}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="intensity"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    if (payload.intensity === 0) return null;
                    
                    return (
                      <g key={`dot-${payload.date}`}>
                        <circle cx={cx} cy={cy} r={4} fill="hsl(var(--primary))" />
                        {payload.emoji && (
                          <text
                            x={cx}
                            y={cy - 15}
                            textAnchor="middle"
                            fontSize={14}
                          >
                            {payload.emoji}
                          </text>
                        )}
                      </g>
                    );
                  }}
                  activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {!isLoading && chartData.every(d => d.intensity === 0) && (
          <div className="text-center mt-4 text-gray-500">
            <p>Aucune donnée d'humeur pour la période. Commencez à suivre votre humeur quotidiennement.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}