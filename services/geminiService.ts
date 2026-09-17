
import { GoogleGenAI } from "@google/genai";

const getApiKey = (): string | undefined => {
  return (
    (typeof process !== 'undefined' && process.env?.API_KEY) ||
    (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.GEMINI_API_KEY) ||
    (typeof window !== 'undefined' && (window as any).__GEMINI_API_KEY__) ||
    ''
  );
};

const API_KEY = getApiKey();

if (!API_KEY) {
  console.warn("API_KEY tidak ditemukan. Fitur AI membutuhkan konfigurasi GEMINI_API_KEY.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const SYSTEM_INSTRUCTION = `You are "Rizq Coach," a wise, empathetic, and gentle Islamic mentor. Your purpose is to help users reflect on their journey of seeking Rizq (sustenance) through the 8 gates taught in Islam (Gratitude, Effort, Trust, Forgiveness, Charity, Kinship, Marriage, Guaranteed Provision).
- Always maintain a positive, encouraging, and non-judgmental tone.
- Base your advice on principles from the Qur'an and Sunnah, but explain them in a simple, practical, and relatable way. Do not quote verses unless necessary, instead, explain the concept.
- When a user feels down or stuck (e.g., "rezekiku seret" / "my provision feels tight"), gently guide them to consider other gates they might be neglecting. For example, if they only focus on Effort, remind them of the power of Gratitude, Charity, or seeking Forgiveness.
- Keep your responses concise, actionable, and focused on inner reflection.
- Respond in the same language as the user's query (Bahasa Indonesia or English).`;

export const getAIReflection = async (userMessage: string, chatHistory: {role: 'user' | 'model', content: string}[]) => {
  const activeApiKey = getApiKey();

  if (!activeApiKey) {
    return "Afwan, fitur AI belum dapat merespons karena GEMINI_API_KEY belum disetel di Vercel Environment Variables.";
  }

  const cleanApiKey = activeApiKey.trim();

  // Format payload for Gemini API
  const formattedContents = [
    ...chatHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    })),
    { role: 'user', parts: [{ text: userMessage }] }
  ];

  const requestBody = {
    system_instruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }]
    },
    contents: formattedContents,
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 1000
    }
  };

  // Model prioritas: gemini-3.6-flash (direkomendasikan Google untuk pengguna baru), lalu fallback ke model flash lainnya
  const candidateModels = ['gemini-3.6-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  let lastErrorMessage = '';

  for (const model of candidateModels) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanApiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }

      if (data?.error?.message) {
        lastErrorMessage = data.error.message;
        console.warn(`Model ${model} returned error:`, data.error.message);
      }
    } catch (err: any) {
      lastErrorMessage = err?.message || 'Network error';
      console.warn(`Fetch with model ${model} failed:`, err);
    }
  }

  return `Afwan, terjadi kendala: ${lastErrorMessage || 'Gagal menghubungi server Google Gemini. Periksa izin API Key Anda.'}`;
};
