async function testLightning() {
  const model = 'community/scriptsnsenses-sys/sdxl-lightning-free';
  const prompts = [
    'Generate a photorealistic image of a futuristic university campus',
    'Create a dark blue and sky blue logo for Synapse X',
    'Create a poster for college event',
  ];

  for (const p of prompts) {
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(p)}?model=${encodeURIComponent(model)}`;
    console.log('Testing prompt:', p);
    const start = Date.now();
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    console.log(`Status: ${res.status}, Time: ${Date.now() - start}ms`);
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      console.log(`Received ${buf.length} bytes for "${p}"`);
    } else {
      console.log('Err:', await res.text());
    }
  }
}

testLightning();
