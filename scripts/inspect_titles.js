import fs from 'node:fs';

const content = fs.readFileSync('C:\\Users\\Neuron\\Desktop\\ВЕКШИТО_Все_Выпуски_Текст.txt', 'utf8');
const blocks = content.split(/={40,}\r?\nРОЛИК:\s*/).slice(1);

const titles = [];
for (const b of blocks) {
  const firstLine = b.trim().split('\n')[0].trim();
  titles.push(firstLine);
}

console.log('Sample video titles (first 40):');
console.log(titles.slice(0, 40).join('\n'));
