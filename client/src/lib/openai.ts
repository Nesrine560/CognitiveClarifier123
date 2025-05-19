import { CBTAnalysisResponse } from "@/types";
import { apiRequest } from "./queryClient";

export async function getCBTAnalysis(
  situation: string,
  emotion: string,
  thought: string
): Promise<CBTAnalysisResponse> {
  const response = await apiRequest(
    "POST",
    "/api/cbt/analyze",
    { situation, emotion, thought }
  );
  
  return response.json();
}
