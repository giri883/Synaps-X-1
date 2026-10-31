async function testHorde() {
  try {
    const res = await fetch('https://aihorde.net/api/v2/generate/async', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': '0000000000',
        'Client-Agent': 'SynapseX:1.0:test',
      },
      body: JSON.stringify({
        prompt: 'photorealistic image of a futuristic university campus',
        params: {
          steps: 20,
          width: 512,
          height: 512,
        }
      })
    });
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Response:', data);
  } catch (err: any) {
    console.error('Error:', err.message);
  }
}

testHorde();
