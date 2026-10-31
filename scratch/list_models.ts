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

async function list() {
  try {
    const pager = await ai.models.list();
    console.log('Available models:');
    for await (const m of pager) {
      if (m.name?.includes('gemini') || m.name?.includes('flash')) {
        console.log(`- ${m.name} (${m.displayName})`);
      }
    }
  } catch (e: any) {
    console.error('List error:', e.message || e);
  }
}

list();
