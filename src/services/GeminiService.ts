import { GoogleGenerativeAI } from '@google/generative-ai';
import { Config } from '../constants/Config';

console.log('[GeminiService] Initializing Real AI Service...');

// Always attempt to initialize. If the key is bad, it might fail here or on the first call.
let genAI: GoogleGenerativeAI | null = null;
try {
  genAI = new GoogleGenerativeAI(Config.GEMINI_API_KEY);
  console.log('[GeminiService] GoogleGenerativeAI initialized.');
} catch (e) {
  console.error('[GeminiService] Failed to initialize GoogleGenerativeAI:', e);
}

export const GeminiService = {
  getMorningBriefing: async (temperature: number, condition: string, date: string): Promise<string> => {
    try {
      if (!genAI) throw new Error("Gemini AI client is not initialized. Check your API Key.");

      console.log('[GeminiService] Requesting Morning Briefing from Real AI...');
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `You are Jarvis. Current weather is ${temperature} degrees and ${condition}. Today is ${date}. Give me a concise, witty 3-sentence morning briefing including a tech news headline.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('[GeminiService] Received response:', text.slice(0, 50) + '...');
      return text;
    } catch (error: any) {
      console.error("Gemini Error (Briefing):", error);
      // Return the actual error message so the user hears/sees it
      return `I encountered an error accessing my brain: ${error.message || 'Unknown Error'}. Please check your API key.`;
    }
  },

  parseTaskRequest: async (userInput: string): Promise<{ title: string; hour: number; minute: number; body: string } | null> => {
    try {
      if (!genAI) throw new Error("Gemini AI client is not initialized.");

      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Analyze this request: '${userInput}'. Return ONLY a JSON object with this exact structure: { title: string, hour: number (24h format), minute: number, body: string }. Do not include markdown formatting.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      // Cleanup markdown if present
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();

      return JSON.parse(text);
    } catch (error: any) {
      console.error("Gemini Error (Task):", error);
      // We return null here so the UI can handle it (show alert)
      return null;
    }
  }
};
