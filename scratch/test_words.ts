async function testWords() {
  const words = [
    'futuristic campus',
    'futuristic university campus',
    'photorealistic futuristic campus',
    'Generate an image of a futuristic campus',
    'dark blue and sky blue logo',
    'Synapse X logo',
    'poster for college event',
  ];

  for (const w of words) {
    const res = await fetch(`https://image.pollinations.ai/prompt/${encodeURIComponent(w)}`);
    console.log(`"${w}": ${res.status}`);
  }
}

testWords();
