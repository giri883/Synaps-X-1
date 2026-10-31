const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function testWithDelay() {
  const prompts = [
    'photorealistic image of a futuristic university campus',
    'dark blue and sky blue logo for Synapse X',
  ];

  for (let i = 0; i < prompts.length; i++) {
    const p = prompts[i];
    if (i > 0) {
      console.log('Sleeping 15 seconds to respect rate limit...');
      await sleep(15000);
    }
    const start = Date.now();
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(p)}?model=sana`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'image/jpeg,image/png,image/*;q=0.9',
      }
    });
    const time = Date.now() - start;
    console.log(`Prompt ${i + 1}: Status ${res.status}, Time: ${time}ms`);
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      console.log(`Received ${buf.length} bytes for Prompt ${i + 1}`);
    }
  }
}

testWithDelay();
