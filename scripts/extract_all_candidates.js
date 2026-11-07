import fs from 'node:fs';

const content = fs.readFileSync('C:\\Users\\Neuron\\Desktop\\ВЕКШИТО_Все_Выпуски_Текст.txt', 'utf8');
const blocks = content.split(/={40,}\r?\nРОЛИК:\s*/).slice(1);

const existingJson = JSON.parse(fs.readFileSync('C:\\Users\\Neuron\\.gemini\\antigravity\\scratch\\vekshito-quiz\\data\\questions.json', 'utf8'));
const existingQuestions = new Set(existingJson.map(q => q.question.toLowerCase().replace(/[^а-яa-z0-9]/gi, '')));

const candidates = [];

for (let bIndex = 0; bIndex < blocks.length; bIndex++) {
  const block = blocks[bIndex];
  const lines = block.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const title = lines[0] || 'Unknown';
  
  // Collapse lines into chunks or text
  const text = lines.slice(1).join(' ');
  // Find questions
  const regex = /([^.?!;]{15,160}\?)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const rawQ = match[1].replace(/>>/g, '').replace(/\[[^\]]+\]/g, '').trim();
    const l = rawQ.toLowerCase();
    
    // Filter conversational junk
    if (
      l.includes('зовут') || l.includes('денег') || l.includes('настроение') ||
      l.includes('ты думаешь') || l.includes('погнали') || l.includes('сколько лет') ||
      l.includes('в каком классе') || l.includes('откуда ты') || l.includes('твоя попытка') ||
      l.includes('финальный') || l.includes('правильно?') || l.includes('серьезно?') ||
      l.includes('в смысле?') || l.includes('правда?') || l.includes('попробуем?') ||
      l.includes('согласен?') || l.includes('го?') || l.includes('уверен?') ||
      l.includes('дальше?') || l.length < 20
    ) {
      continue;
    }

    const key = rawQ.toLowerCase().replace(/[^а-яa-z0-9]/gi, '');
    if (existingQuestions.has(key)) continue;

    // Get following context (up to 300 chars after the question)
    const afterIdx = match.index + match[0].length;
    const context = text.slice(afterIdx, afterIdx + 250);

    candidates.push({
      videoIdx: bIndex + 1,
      videoTitle: title,
      question: rawQ,
      context: context.trim()
    });
  }
}

console.log(`Found ${candidates.length} candidate questions not in dataset yet.`);
fs.writeFileSync('C:\\Users\\Neuron\\.gemini\\antigravity\\scratch\\vekshito-quiz\\scripts\\candidates.json', JSON.stringify(candidates.slice(0, 500), null, 2), 'utf8');
