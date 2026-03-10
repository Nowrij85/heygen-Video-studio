import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateScriptFromPrompt(prompt: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a professional video script for a HeyGen AI avatar based on the following prompt: "${prompt}". 
    The script should be engaging, clear, and suitable for an AI spokesperson. 
    Keep it under 1000 characters. 
    Return ONLY the script text, no other commentary.`,
  });
  
  return response.text || "";
}
