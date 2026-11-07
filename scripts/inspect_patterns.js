import fs from 'node:fs';

const textPath = 'C:\\Users\\Neuron\\Desktop\\ВЕКШИТО_Все_Выпуски_Текст.txt';
const text = fs.readFileSync(textPath, 'utf8');

const rawBlocks = text.split(/={40,}\r?\nРОЛИК:\s*/).filter(x => x.trim().length > 0);

function inspectEpisode(idx) {
  const block = rawBlocks[idx];
  const lines = block.split(/\r?\n/);
  console.log(`\n==================================================`);
  console.log(`EPISODE ${idx}: ${lines[0]}`);
  console.log(`==================================================`);
  
  // Find lines with "Вопрос", or "?", or host dialogue
  lines.slice(0, 150).forEach((l, i) => {
    if (l.includes('Вопрос') || l.includes('вопрос') || l.includes('правильный ответ') || l.includes('Правильно') || l.includes('?')) {
      console.log(`L${i}: ${l}`);
    }
  });
}

inspectEpisode(0); // Biology & Chem
inspectEpisode(2); // Russian language
inspectEpisode(6); // Geography
inspectEpisode(7); // Guess from photo
inspectEpisode(9); // History
