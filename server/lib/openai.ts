import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is required. Please set it in the .replit file.");
}

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export interface CBTAnalysisResponse {
  thoughtPattern: string;
  patternExplanation: string;
  challenge: string;
  reframe: string;
}

export async function generateCBTResponse(
  situation: string,
  emotion: string,
  thought: string
): Promise<CBTAnalysisResponse> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
            "You are a trained cognitive behavioral therapist. Your goal is to help the user identify distorted thought patterns, challenge them, and reframe them. Your responses should be empathetic, supportive, and educational. Analyze the situation, emotion, and thought provided by the user and respond with the following structure in JSON format: " +
            "1. Thought Pattern: Identify the cognitive distortion pattern (e.g., catastrophizing, black-and-white thinking, mind reading) " +
            "2. Pattern Explanation: A brief explanation of how this thought exemplifies the pattern " +
            "3. Challenge: A gentle way to challenge this thought with evidence-based questioning " +
            "4. Reframe: A more balanced alternative perspective"
        },
        {
          role: "user",
          content: `
            Situation: ${situation}
            Emotion: ${emotion}
            Thought: ${thought}
          `
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content) as CBTAnalysisResponse;
    return result;
  } catch (error) {
    console.error("Error generating CBT response:", error);
    throw new Error("Failed to generate CBT analysis");
  }
}