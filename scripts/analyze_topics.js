import fs from 'node:fs';

const content = fs.readFileSync('C:\\Users\\Neuron\\Desktop\\ВЕКШИТО_Все_Выпуски_Текст.txt', 'utf8');

const titles = (content.match(/РОЛИК:\s*(.+)/g) || []).map(t => t.replace('РОЛИК:', '').trim());
console.log(`Всего уникальных роликов в файле: ${titles.length}`);

// Count how many videos focus on specific topics
const topics = {
  biology: 0,
  chemistry: 0,
  physics: 0,
  history: 0,
  geography: 0,
  literature: 0,
  russian: 0,
  math_logic: 0,
  general_school: 0
};

for (const t of titles) {
  const l = t.toLowerCase();
  if (l.includes('биолог')) topics.biology++;
  if (l.includes('хим')) topics.chemistry++;
  if (l.includes('физик')) topics.physics++;
  if (l.includes('истор')) topics.history++;
  if (l.includes('географ') || l.includes('столиц') || l.includes('стран')) topics.geography++;
  if (l.includes('литератур') || l.includes('книг') || l.includes('писател')) topics.literature++;
  if (l.includes('русск') || l.includes('словар') || l.includes('язык')) topics.russian++;
  if (l.includes('логик') || l.includes('математ') || l.includes('загад')) topics.math_logic++;
  if (l.includes('школьн') || l.includes('егэ') || l.includes('огэ') || l.includes('студент') || l.includes('глупых')) topics.general_school++;
}

console.log('Распределение роликов по темам в заголовках:');
console.log(topics);
