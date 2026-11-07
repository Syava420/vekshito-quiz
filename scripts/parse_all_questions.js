import fs from 'node:fs';

const content = fs.readFileSync('C:\\Users\\Neuron\\Desktop\\ВЕКШИТО_Все_Выпуски_Текст.txt', 'utf8');
const blocks = content.split(/={40,}\r?\nРОЛИК:\s*/).slice(1);

console.log(`Analyzing ${blocks.length} videos...`);

// Let's find all questions in the text
const questionMap = new Map();

for (let i = 0; i < blocks.length; i++) {
  const b = blocks[i];
  const lines = b.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const title = lines[0] || '';
  const fullText = lines.slice(1).join(' ').replace(/\s+/g, ' ');

  // Split on questions
  const regex = /([^.?!;]{12,180}\?)/g;
  let match;
  while ((match = regex.exec(fullText)) !== null) {
    const raw = match[1].replace(/>>/g, '').replace(/\[[^\]]+\]/g, '').trim();
    const l = raw.toLowerCase();

    // Skip personal/chitchat
    if (
      l.includes('зовут') || l.includes('денег') || l.includes('настроение') ||
      l.includes('ты думаешь') || l.includes('согласен') || l.includes('погнали') ||
      l.includes('сколько лет') || l.includes('в каком классе') || l.includes('откуда ты') ||
      l.includes('твоя попытка') || l.includes('финальный') || l.includes('правильно?') ||
      l.includes('серьезно?') || l.includes('в смысле?') || l.includes('правда?') ||
      l.includes('попробуем?') || l.includes('го?') || l.includes('уверен?') ||
      l.includes('дальше?') || l.includes('готовы?') || l.includes('поехали?') ||
      l.includes('слышишь?') || l.includes('видишь?') || l.length < 15
    ) {
      continue;
    }

    // Context following the question
    const ctxStart = match.index + match[0].length;
    const context = fullText.slice(ctxStart, ctxStart + 300);

    const key = raw.toLowerCase().replace(/[^а-яa-z0-9]/gi, '');
    if (!questionMap.has(key)) {
      questionMap.set(key, {
        question: raw,
        title,
        context: context.trim()
      });
    }
  }
}

console.log(`Total unique candidate questions extracted: ${questionMap.size}`);

// Save to a file for examination
const allCandidates = Array.from(questionMap.values());
fs.writeFileSync('C:\\Users\\Neuron\\.gemini\\antigravity\\scratch\\vekshito-quiz\\scripts\\all_candidates_parsed.json', JSON.stringify(allCandidates, null, 2), 'utf8');
