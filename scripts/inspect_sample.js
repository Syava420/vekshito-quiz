import fs from 'node:fs';

const candidates = JSON.parse(fs.readFileSync('C:\\Users\\Neuron\\.gemini\\antigravity\\scratch\\vekshito-quiz\\scripts\\candidates.json', 'utf8'));

console.log('Sample of 20 candidates with context:');
for (let i = 0; i < 20; i++) {
  const c = candidates[i];
  console.log(`\n--- #${i + 1} [Video: ${c.videoTitle}] ---`);
  console.log(`Q: ${c.question}`);
  console.log(`Ctx: ${c.context.slice(0, 180)}`);
}
