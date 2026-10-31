import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

async function testChat() {
  console.log('Testing chat request to http://localhost:3000/api/ai/chat...');
  const start = Date.now();
  try {
    const res = await fetch('http://localhost:3000/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Explain thermodynamics to me.' })
    });
    const elapsed = Date.now() - start;
    console.log(`Status: ${res.status}, Time: ${elapsed}ms (${(elapsed/1000).toFixed(2)}s)`);
    const data = await res.json();
    console.log('Fallback used:', data.fallbackUsed);
    console.log('Connected tools:', JSON.stringify(data.connectedTools));
    console.log('Text preview:', data.text?.slice(0, 200));
  } catch (err: any) {
    console.error('Error:', err);
  }
}

testChat();
