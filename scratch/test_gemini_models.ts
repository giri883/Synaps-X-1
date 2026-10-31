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

async function testModel(modelName: string) {
  console.log(`\n--- Testing model: ${modelName} ---`);
  const start = Date.now();
  try {
    const res = await ai.models.generateContent({
      model: modelName,
      contents: [{ role: 'user', parts: [{ text: 'Say hello in one word' }] }],
    });
    const elapsed = Date.now() - start;
    console.log(`SUCCESS in ${elapsed}ms:`, res.text?.trim());
  } catch (err: any) {
    const elapsed = Date.now() - start;
    console.log(`FAILED in ${elapsed}ms:`, err.message || err);
  }
}

async function run() {
  await testModel('gemini-2.5-flash');
  await testModel('gemini-2.0-flash');
  await testModel('gemini-1.5-flash');
  await testModel('gemini-3.8-flash');
}

run();
