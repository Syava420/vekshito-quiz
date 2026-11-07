import fs from 'node:fs';
import path from 'node:path';

const textPath = 'C:\\Users\\Neuron\\Desktop\\ВЕКШИТО_Все_Выпуски_Текст.txt';
const text = fs.readFileSync(textPath, 'utf8');

const rawBlocks = text.split(/={40,}\r?\nРОЛИК:\s*/).filter(x => x.trim().length > 0);
console.log(`Total episodes found: ${rawBlocks.length}`);

// Inspect titles
const episodes = rawBlocks.map(block => {
  const lines = block.split(/\r?\n/);
  const title = lines[0].trim();
  const idMatch = block.match(/ID:\s*([a-zA-Z0-9_-]+)/);
  const id = idMatch ? idMatch[1] : 'unknown';
  return { id, title, text: block };
});

console.log('Sample 10 episode titles:');
episodes.slice(0, 10).forEach((ep, i) => {
  console.log(`${i + 1}. [${ep.id}] ${ep.title}`);
});
