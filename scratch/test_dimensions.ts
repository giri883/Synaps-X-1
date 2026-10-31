async function testDims() {
  const dims = [
    { name: '16:9 (1024x576)', w: 1024, h: 576 },
    { name: '9:16 (576x1024)', w: 576, h: 1024 },
    { name: '1:1 (1024x1024)', w: 1024, h: 1024 },
    { name: '4:3 (1024x768)', w: 1024, h: 768 },
    { name: '3:4 (768x1024)', w: 768, h: 1024 },
  ];

  for (const d of dims) {
    const url = `https://image.pollinations.ai/prompt/futuristic%20campus?width=${d.w}&height=${d.h}&seed=42&nologo=true`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'image/jpeg,image/png,image/*;q=0.9',
      }
    });
    console.log(`${d.name}: Status ${res.status}`);
  }
}

testDims();
