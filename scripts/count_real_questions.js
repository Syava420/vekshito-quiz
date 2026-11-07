import fs from 'node:fs';

const content = fs.readFileSync('C:\\Users\\Neuron\\Desktop\\ВЕКШИТО_Все_Выпуски_Текст.txt', 'utf8');
const blocks = content.split(/={40,}\r?\nРОЛИК:\s*/).slice(1);

console.log(`Total videos: ${blocks.length}`);

// Count questions marked with "Вопрос 1", "Вопрос 2", "Первый вопрос", etc.
let numberedCount = 0;
for (const b of blocks) {
  const matches = b.match(/вопрос\s*(?:номер|\№)?\s*\d+/gi) || [];
  numberedCount += matches.length;
}

console.log(`Explicitly numbered questions across all 340 videos: ${numberedCount}`);
