
import { GoogleGenAI, Type } from "@google/genai";
import { TriageResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function performTriage(symptoms: string): Promise<TriageResponse> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze these symptoms and provide medical triage advice: "${symptoms}"`,
    config: {
      systemInstruction: "You are a professional medical triage assistant. You help patients identify the correct doctor specialization based on symptoms. Be helpful but always remind them you are an AI and they should consult a professional in emergencies. Return data in JSON format.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          recommendedSpecialization: { type: Type.STRING },
          urgency: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
          explanation: { type: Type.STRING },
          possibleQuestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["recommendedSpecialization", "urgency", "explanation", "possibleQuestions"]
      }
    }
  });

  try {
    return JSON.parse(response.text) as TriageResponse;
  } catch (e) {
    console.error("Failed to parse AI response", e);
    throw new Error("Could not analyze symptoms.");
  }
}
