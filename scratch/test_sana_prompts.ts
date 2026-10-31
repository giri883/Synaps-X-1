async function testSana() {
  const prompts = [
    'photorealistic image of a futuristic university campus, 8k resolution, cinematic lighting',
    'dark blue and sky blue logo for Synapse X, clean vector graphic icon, minimalist modern',
    'modern poster for college event, bold typography, creative layout',
  ];

  for (const p of prompts) {
    const start = Date.now();
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(p)}?model=sana`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'image/jpeg,image/png,image/*;q=0.9',
      }
    });
    const time = Date.now() - start;
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      console.log(`Prompt: "${p.slice(0, 30)}..." -> Status: ${res.status}, Time: ${time}ms, Size: ${buf.length} bytes`);
    } else {
      console.log(`Prompt: "${p.slice(0, 30)}..." -> Status: ${res.status}, Time: ${time}ms, Error:`, await res.text());
    }
  }
}

testSana();
