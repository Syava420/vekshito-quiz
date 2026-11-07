import fs from 'node:fs';

const items = JSON.parse(fs.readFileSync('C:\\Users\\Neuron\\.gemini\\antigravity\\scratch\\vekshito-quiz\\scripts\\extracted_trivia.json', 'utf8'));

console.log(`Total: ${items.length}`);
for (let i = 0; i < 25; i++) {
  console.log(`[${i+1}] Q: ${items[i].question}`);
  console.log(`    Ctx: ${items[i].context.slice(0, 100)}...`);
}
