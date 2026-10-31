async function testPuter() {
  const code = await (await fetch('https://js.puter.com/v2/')).text();
  const endpoints = code.match(/https:\/\/[a-zA-Z0-9.-]+\.puter\.com[^\s"'\)]+/g);
  console.log('Endpoints found:', Array.from(new Set(endpoints || [])).slice(0, 10));
}

testPuter();
