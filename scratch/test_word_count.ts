async function testCounts() {
  const tests = [
    'campus',
    'modern campus',
    'futuristic campus',
    'blue logo',
    'event poster',
    'cybernetic tiger',
    'neon city',
    'modern university building',
  ];

  for (const t of tests) {
    const res = await fetch(`https://image.pollinations.ai/prompt/${encodeURIComponent(t)}`);
    console.log(`[${t.split(' ').length} words] "${t}": ${res.status}`);
  }
}

testCounts();
