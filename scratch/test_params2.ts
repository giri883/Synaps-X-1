async function main() {
  const p = encodeURIComponent('photorealistic image of a futuristic university campus');
  const seed = Math.floor(Math.random() * 900000) + 100000;
  
  const r1 = await fetch(`https://image.pollinations.ai/prompt/${p}`);
  console.log('1. pure prompt:', r1.status);
  
  const r2 = await fetch(`https://image.pollinations.ai/prompt/${p}?seed=${seed}`);
  console.log('2. prompt + seed:', r2.status);

  const r3 = await fetch(`https://image.pollinations.ai/prompt/${p}?nologo=true`);
  console.log('3. prompt + nologo:', r3.status);
}

main();
