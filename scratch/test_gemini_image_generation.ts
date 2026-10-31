import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testGeminiImage() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const models = ['gemini-2.5-flash-image', 'gemini-3.1-flash-lite-image', 'gemini-3.1-flash-image'];

  for (const m of models) {
    try {
      console.log(`Testing model: ${m}...`);
      const response: any = await ai.models.generateContent({
        model: m,
        contents: [{ role: 'user', parts: [{ text: 'Generate a photorealistic image of a futuristic university campus' }] }],
      });
      console.log(`Success on ${m}! Response candidates:`, response.candidates?.length);
      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const p of parts) {
        if (p.inlineData) {
          console.log(`Found inline image! MIME: ${p.inlineData.mimeType}, size: ${p.inlineData.data?.length}`);
        } else if (p.text) {
          console.log(`Text part: ${p.text.slice(0, 100)}`);
        }
      }
      return;
    } catch (err: any) {
      console.log(`Model ${m} failed:`, err.message);
    }
  }
}

testGeminiImage();
