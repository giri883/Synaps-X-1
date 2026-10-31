async function t() {
  const p1 = 'Generate a photorealistic image of a futuristic university campus';
  const r1 = await fetch('https://image.pollinations.ai/prompt/' + encodeURIComponent(p1) + '?model=sana');
  console.log('p1 status:', r1.status);

  const p2 = 'futuristic university campus, photorealistic';
  const r2 = await fetch('https://image.pollinations.ai/prompt/' + encodeURIComponent(p2) + '?model=sana');
  console.log('p2 status:', r2.status);
}
t();
