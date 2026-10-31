async function testPrompts() {
  const prompts = [
    'Generate a photorealistic image of a futuristic university campus, 16:9 widescreen, 8k resolution, crisp lighting',
    'Create a dark blue and sky blue logo for Synapse X, square format, clean vector icon, modern branding',
    'Generate a poster for my college event, vertical format, modern typography, striking composition',
  ];

  for (const p of prompts) {
    const encoded = encodeURIComponent(p);
    const url = `https://image.pollinations.ai/prompt/${encoded}`;
    console.log('Fetching:', p.slice(0, 40));
    const start = Date.now();
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'image/jpeg,image/png,image/*;q=0.9',
      }
    });
    console.log(`Status: ${res.status}, Time: ${Date.now() - start}ms, Content-Type: ${res.headers.get('content-type')}`);
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      console.log(`Image received! Size: ${buf.length} bytes`);
    } else {
      console.log('Error:', await res.text());
    }
  }
}

testPrompts();
