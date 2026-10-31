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

async function testWithZeroThinking() {
  console.log('Testing gemini-3.8-flash with thinkingBudget = 0...');
  const start = Date.now();
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts: [{ text: 'Explain thermodynamics in 2 sentences.' }] }],
      config: {
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    });
    const elapsed = Date.now() - start;
    console.log(`ZERO THINKING SUCCESS in ${(elapsed/1000).toFixed(2)}s:`, res.text);
  } catch (e: any) {
    const elapsed = Date.now() - start;
    console.log(`ZERO THINKING FAILED in ${(elapsed/1000).toFixed(2)}s:`, e.message);
  }
}

testWithZeroThinking();
