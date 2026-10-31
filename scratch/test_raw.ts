async function testRaw() {
  const p = 'Generate a photorealistic image of a futuristic university campus.';
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(p)}`;
  console.log('Fetching:', url);
  const start = Date.now();
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  console.log('Status:', res.status, 'Time:', Date.now() - start, 'ms');
  if (res.ok) {
    const buf = Buffer.from(await res.arrayBuffer());
    console.log('Success! Buffer:', buf.length);
  } else {
    console.log('Err:', await res.text());
  }
}

testRaw();
