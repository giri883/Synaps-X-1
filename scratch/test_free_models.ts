async function testFree() {
  const models = [
    'community/scriptsnsenses-sys/sdxl-lightning-free',
    'community/scriptsnsenses-sys/flux-2-dev-free',
    'sdxl-lightning-free',
    'flux-2-dev-free',
  ];

  for (const m of models) {
    const url = `https://image.pollinations.ai/prompt/futuristic%20campus?model=${encodeURIComponent(m)}`;
    console.log('Testing model:', m);
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      console.log(`Model ${m}: Status ${res.status}`);
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        console.log(`Success! ${buf.length} bytes`);
        return;
      }
    } catch (e: any) {
      console.log(`Error on ${m}:`, e.message);
    }
  }
}

testFree();
