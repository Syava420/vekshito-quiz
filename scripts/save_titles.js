import fs from 'node:fs';

const content = fs.readFileSync('C:\\Users\\Neuron\\Desktop\\ВЕКШИТО_Все_Выпуски_Текст.txt', 'utf8');
const blocks = content.split(/={40,}\r?\nРОЛИК:\s*/).slice(1);

const titles = blocks.map(b => b.trim().split('\n')[0].trim());
fs.writeFileSync('C:\\Users\\Neuron\\.gemini\\antigravity\\scratch\\vekshito-quiz\\scripts\\all_titles.txt', titles.join('\n'), 'utf8');
console.log(`Saved ${titles.length} titles to scripts/all_titles.txt`);
