import { generateImage } from '../server/imageService';

async function testDirect() {
  try {
    const res = await generateImage({
      prompt: 'Generate a photorealistic image of a futuristic university campus.',
      aspectRatio: '16:9',
      style: 'photorealistic',
      outputFormat: 'jpeg'
    });
    console.log('Success:', res);
  } catch (err: any) {
    console.error('Direct error:', err.message);
    console.error('Cause:', err.cause);
  }
}

testDirect();
