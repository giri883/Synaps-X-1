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

const models = [
  'gemini-2.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.8-flash',
];

async function testSingle(m: string) {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await ai.models.generateContent({
      model: m,
      contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
    });
    clearTimeout(timeout);
    const elapsed = Date.now() - start;
    console.log(`[${m}] SUCCESS in ${(elapsed/1000).toFixed(2)}s: ${res.text?.trim()}`);
  } catch (e: any) {
    const elapsed = Date.now() - start;
    console.log(`[${m}] FAILED in ${(elapsed/1000).toFixed(2)}s: ${e.message?.slice(0, 100)}`);
  }
}

async function run() {
  for (const m of models) {
    await testSingle(m);
  }
}

run();
