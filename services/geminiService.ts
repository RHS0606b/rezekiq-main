
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY not found. AI features will be disabled.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const SYSTEM_INSTRUCTION = `You are "Rizq Coach," a wise, empathetic, and gentle Islamic mentor. Your purpose is to help users reflect on their journey of seeking Rizq (sustenance) through the 8 gates taught in Islam (Gratitude, Effort, Trust, Forgiveness, Charity, Kinship, Marriage, Guaranteed Provision).
- Always maintain a positive, encouraging, and non-judgmental tone.
- Base your advice on principles from the Qur'an and Sunnah, but explain them in a simple, practical, and relatable way. Do not quote verses unless necessary, instead, explain the concept.
- When a user feels down or stuck (e.g., "rezekiku seret" / "my provision feels tight"), gently guide them to consider other gates they might be neglecting. For example, if they only focus on Effort, remind them of the power of Gratitude, Charity, or seeking Forgiveness.
- Keep your responses concise, actionable, and focused on inner reflection.
- Respond in the same language as the user's query (Bahasa Indonesia or English).`;

export const getAIReflection = async (userMessage: string, chatHistory: {role: 'user' | 'model', content: string}[]) => {
  if (!ai) {
    return "AI service is not available. Please configure the API Key.";
  }

  try {
    const contents = [
      ...chatHistory.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }]
      })),
      { role: 'user', parts: [{ text: userMessage }] }
    ];

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.7,
            topP: 0.9,
        }
    });
    
    return response.text;
  } catch (error) {
    console.error("Error fetching AI reflection:", error);
    return "I'm sorry, I'm having trouble connecting right now. Please try again later.";
  }
};
