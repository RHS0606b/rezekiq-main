
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
    return "Afwan, fitur AI belum dapat merespons karena GEMINI_API_KEY belum disetel di Vercel Environment Variables. Silakan tambahkan GEMINI_API_KEY di dashboard Vercel Anda.";
  }

  try {
    const client = ai || new GoogleGenAI({ apiKey: activeApiKey });
    const contents = [
      ...chatHistory.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }]
      })),
      { role: 'user', parts: [{ text: userMessage }] }
    ];

    const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.7,
            topP: 0.9,
        }
    });
    
    return response.text || "Alhamdulillah, semoga Allah senantiasa membuka pintu rezeki dan keberkahan untuk Anda.";
  } catch (error: any) {
    console.error("Error fetching AI reflection:", error);
    if (error?.message?.includes('API_KEY_INVALID') || error?.message?.includes('403')) {
      return "Afwan, API Key Gemini tidak valid atau kuota terlampaui. Mohon periksa kembali API Key Anda di Google AI Studio.";
    }
    return "Afwan, sedang terjadi kendala jaringan saat menghubungkan ke AI. Silakan coba beberapa saat lagi.";
  }
};
