import fs from 'node:fs';

const filePath = 'C:\\Users\\Neuron\\Desktop\\ВЕКШИТО_Все_Выпуски_Текст.txt';
const raw = fs.readFileSync(filePath, 'utf8');
const videos = raw.split(/={40,}\r?\nРОЛИК:\s*/);

const candidates = [];

for (let i = 1; i < videos.length; i++) {
  const lines = videos[i].split(/\r?\n/);
  const title = lines[0].trim();
  const body = lines.slice(1).join(' ').replace(/\s+/g, ' ');

  // Extract sentences ending with '?'
  const matches = body.match(/[^.?!]{12,140}\?/g) || [];
  for (const rawQ of matches) {
    const cleanQ = rawQ.replace(/>>/g, '').replace(/\[[^\]]+\]/g, '').replace(/\s+/g, ' ').trim();
    const lower = cleanQ.toLowerCase();

    if (
      lower.includes('тебя зовут') || lower.includes('вас зовут') ||
      lower.includes('денег') || lower.includes('настроение') ||
      lower.includes('ты думаешь') || lower.includes('согласен') ||
      lower.includes('погнали') || lower.includes('сколько лет') ||
      lower.includes('в каком классе') || lower.includes('откуда ты') ||
      lower.includes('твоя попытка') || lower.includes('финальный')
    ) {
      continue;
    }

    if (
      lower.includes('как называется') ||
      lower.includes('в каком году') ||
      lower.includes('кто написал') ||
      lower.includes('кто автор') ||
      lower.includes('столица') ||
      lower.includes('какой стране') ||
      lower.includes('в какой стране') ||
      lower.includes('формула') ||
      lower.includes('чему равен') ||
      lower.includes('чему равна') ||
      lower.includes('сколько хромосом') ||
      lower.includes('кто открыл') ||
      lower.includes('кто создал') ||
      lower.includes('кто был первым') ||
      lower.includes('какой океан') ||
      lower.includes('какая река') ||
      lower.includes('какая планета') ||
      lower.includes('какой химический элемент') ||
      lower.includes('какой газ') ||
      lower.includes('какой металл') ||
      lower.includes('что измеряется') ||
      lower.includes('единица измерения') ||
      lower.includes('какая часть речи') ||
      lower.includes('сколько градусов')
    ) {
      candidates.push({ videoId: i, videoTitle: title, q: cleanQ });
    }
  }
}

console.log(`Broader search: ${candidates.length} candidates found.`);
// Sample some across different indexes
console.log('Sample from different videos:');
for (let step = 0; step < candidates.length; step += 15) {
  console.log(`[${candidates[step].videoId}] ${candidates[step].q}`);
}
