import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY!;
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const candidates = [
  'gemini-flash-latest',
  'gemini-2.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
];

async function run() {
  for (const m of candidates) {
    const start = Date.now();
    try {
      const res = await ai.models.generateContent({
        model: m,
        contents: [{ role: 'user', parts: [{ text: 'Explain thermodynamics in 2 sentences.' }] }],
      });
      const elapsed = Date.now() - start;
      console.log(`[${m}] SUCCESS in ${(elapsed/1000).toFixed(2)}s: ${res.text?.slice(0, 80)}...`);
    } catch (e: any) {
      const elapsed = Date.now() - start;
      console.log(`[${m}] FAILED in ${(elapsed/1000).toFixed(2)}s: ${e.message}`);
    }
  }
}

run();
