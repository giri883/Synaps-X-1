async function main() {
  const p = encodeURIComponent('Generate a photorealistic image of a futuristic university campus, 8k resolution, crisp natural lighting');
  
  console.log('Testing 1: default...');
  const r1 = await fetch('https://image.pollinations.ai/prompt/' + p);
  console.log('1. default:', r1.status);
  
  console.log('Testing 2: width 768 height 768...');
  const r2 = await fetch('https://image.pollinations.ai/prompt/' + p + '?width=768&height=768');
  console.log('2. 768x768:', r2.status);
  
  console.log('Testing 3: width 1024 height 576...');
  const r3 = await fetch('https://image.pollinations.ai/prompt/' + p + '?width=1024&height=576');
  console.log('3. 1024x576:', r3.status);

  console.log('Testing 4: model=flux...');
  const r4 = await fetch('https://image.pollinations.ai/prompt/' + p + '?model=flux');
  console.log('4. model=flux:', r4.status);
}

main();
