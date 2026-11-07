import fs from 'node:fs';

const filePath = 'C:\\Users\\Neuron\\Desktop\\ВЕКШИТО_Все_Выпуски_Текст.txt';
const raw = fs.readFileSync(filePath, 'utf8');

const videos = raw.split(/={40,}\r?\nРОЛИК:\s*/);

console.log(`Total videos: ${videos.length}`);

// Collect all high quality question candidates across the 226 videos
const candidates = [];

for (let i = 1; i < videos.length; i++) {
  const lines = videos[i].split(/\r?\n/);
  const title = lines[0].trim();
  const body = lines.slice(1).join(' ').replace(/\s+/g, ' ');

  // Look for question patterns
  const matches = body.match(/[^.?!]{10,130}\?/g) || [];
  for (const rawQ of matches) {
    const cleanQ = rawQ.replace(/>>/g, '').replace(/\[[^\]]+\]/g, '').trim();
    const lower = cleanQ.toLowerCase();

    // Filter out meta / filler questions
    if (lower.includes('тебя зовут') || lower.includes('вас зовут') ||
        lower.includes('денег') || lower.includes('настроение') ||
        lower.includes('участвуешь') || lower.includes('начнем') ||
        lower.includes('погнали') || lower.includes('слышишь') ||
        lower.includes('согласен') || lower.includes('уверен') ||
        lower.includes('почему') && lower.length < 25) {
      continue;
    }

    if (
      lower.startsWith('как называется') ||
      lower.startsWith('в каком году') ||
      lower.startsWith('кто автор') ||
      lower.startsWith('кто написал') ||
      lower.startsWith('столица') ||
      lower.startsWith('какой стране') ||
      lower.startsWith('в какой стране') ||
      lower.startsWith('какая формула') ||
      lower.startsWith('чему равен') ||
      lower.startsWith('чему равна') ||
      lower.startsWith('сколько хромосом') ||
      lower.startsWith('какой русский писатель') ||
      lower.startsWith('какое произведение') ||
      lower.startsWith('что изучает') ||
      lower.startsWith('какой орган')
    ) {
      candidates.push({ videoId: i, videoTitle: title, q: cleanQ });
    }
  }
}

console.log(`Total filtered candidate questions: ${candidates.length}`);
console.log('First 20 candidates:');
candidates.slice(0, 20).forEach((c, idx) => {
  console.log(`${idx + 1}. [Video ${c.videoId}] ${c.q}`);
});
