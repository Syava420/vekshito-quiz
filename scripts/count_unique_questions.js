import fs from 'node:fs';

const content = fs.readFileSync('C:\\Users\\Neuron\\Desktop\\ВЕКШИТО_Все_Выпуски_Текст.txt', 'utf8');
const videos = content.split(/={40,}\r?\nРОЛИК:\s*/);

// Let's count all unique question-like sentences across all 326 videos
const uniqueQuestions = new Set();

for (let i = 1; i < videos.length; i++) {
  const block = videos[i];
  const sentences = block.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').match(/[^.?!]{12,140}\?/g) || [];
  for (const s of sentences) {
    const clean = s.replace(/>>/g, '').replace(/\[[^\]]+\]/g, '').trim();
    const l = clean.toLowerCase();
    
    // Skip conversational fluff
    if (l.includes('зовут') || l.includes('денег') || l.includes('настроение') ||
        l.includes('ты думаешь') || l.includes('согласен') || l.includes('погнали') ||
        l.includes('сколько лет') || l.includes('в каком классе') || l.includes('откуда ты') ||
        l.includes('твоя попытка') || l.includes('финальный') || l.includes('правильно?') ||
        l.includes('серьезно?') || l.includes('в смысле?') || l.includes('правда?') ||
        l.length < 18) {
      continue;
    }

    if (
      l.includes('как называется') || l.includes('в каком году') || l.includes('кто написал') ||
      l.includes('кто автор') || l.includes('столица') || l.includes('в какой стране') ||
      l.includes('какой стране') || l.includes('формула') || l.includes('чему равен') ||
      l.includes('чему равна') || l.includes('хромосом') || l.includes('кто открыл') ||
      l.includes('кто создал') || l.includes('первым') || l.includes('океан') ||
      l.includes('река') || l.includes('планета') || l.includes('элемент') ||
      l.includes('металл') || l.includes('измеряется') || l.includes('аббревиатур') ||
      l.includes('что такое') || l.includes('произведение') || l.includes('картина') ||
      l.includes('художник') || l.includes('писатель') || l.includes('какой орган') ||
      l.includes('сколько') || l.includes('какая') || l.includes('какой') || l.includes('где')
    ) {
      uniqueQuestions.add(clean);
    }
  }
}

console.log(`Всего уникальных смысловых вопросов во всём файле (все темы вместе): ${uniqueQuestions.size}`);
