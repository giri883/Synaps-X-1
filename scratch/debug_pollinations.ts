async function checkUrl() {
  const prompt = encodeURIComponent('photorealistic image of a futuristic university campus');
  const seed = Math.floor(Math.random() * 900000) + 100000;
  const url = `https://image.pollinations.ai/prompt/${prompt}?width=1024&height=768&seed=${seed}&nologo=true`;
  console.log('Fetching:', url);
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'image/jpeg,image/png,image/*;q=0.9',
    }
  });
  console.log('Status:', res.status, res.statusText);
  if (!res.ok) {
    console.log('Error text:', await res.text());
  } else {
    const buf = await res.arrayBuffer();
    console.log('Received image bytes:', buf.byteLength);
  }
}

checkUrl();
