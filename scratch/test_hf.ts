async function testHf() {
  const models = [
    'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell',
    'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
    'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5',
  ];

  for (const url of models) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: 'futuristic university campus' })
      });
      console.log(`${url.split('/').pop()}: Status ${res.status}`);
      if (!res.ok) console.log('Err:', (await res.text()).slice(0, 100));
    } catch (e: any) {
      console.log('Error:', e.message);
    }
  }
}

testHf();
