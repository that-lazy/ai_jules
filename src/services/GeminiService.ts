import { GoogleGenerativeAI } from '@google/generative-ai';
import { Config } from '../constants/Config';

const isMockMode = Config.GEMINI_API_KEY === 'PLACEHOLDER_KEY_REPLACE_ME' || Config.USE_MOCK_AI;

let genAI: GoogleGenerativeAI | null = null;
if (!isMockMode) {
  genAI = new GoogleGenerativeAI(Config.GEMINI_API_KEY);
}

export const GeminiService = {
  getMorningBriefing: async (temperature: number, condition: string, date: string): Promise<string> => {
    if (isMockMode) {
      console.log('GeminiService: Mocking Morning Briefing');
      await new Promise(r => setTimeout(r, 1000)); // Simulate delay
      return `Good morning! It is currently ${temperature} degrees and ${condition}. In tech news, AI continues to evolve rapidly. Have a productive day!`;
    }

    try {
      if (!genAI) throw new Error("Gemini AI not initialized");
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `You are Jarvis. Current weather is ${temperature} degrees and ${condition}. Today is ${date}. Give me a concise, witty 3-sentence morning briefing including a tech news headline.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini Error (Briefing):", error);
      return "I'm having trouble connecting to my brain, but the weather looks good.";
    }
  },

  parseTaskRequest: async (userInput: string): Promise<{ title: string; hour: number; minute: number; body: string } | null> => {
    if (isMockMode) {
      console.log('GeminiService: Mocking Task Parsing');
      await new Promise(r => setTimeout(r, 1000));
      // Basic mock parser for demonstration
      return {
        title: "Reminder",
        hour: new Date().getHours(),
        minute: new Date().getMinutes() + 2, // Schedule for 2 mins later
        body: userInput
      };
    }

    try {
      if (!genAI) throw new Error("Gemini AI not initialized");
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Analyze this request: '${userInput}'. Return ONLY a JSON object with this exact structure: { title: string, hour: number (24h format), minute: number, body: string }. Do not include markdown formatting.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      // Cleanup markdown if present
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();

      return JSON.parse(text);
    } catch (error) {
      console.error("Gemini Error (Task):", error);
      return null;
    }
  }
};
