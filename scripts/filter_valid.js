import fs from 'node:fs';

const candidates = JSON.parse(fs.readFileSync('C:\\Users\\Neuron\\.gemini\\antigravity\\scratch\\vekshito-quiz\\scripts\\all_candidates_parsed.json', 'utf8'));

const existingJson = JSON.parse(fs.readFileSync('C:\\Users\\Neuron\\.gemini\\antigravity\\scratch\\vekshito-quiz\\data\\questions.json', 'utf8'));
const existingQuestions = new Set(existingJson.map(q => q.question.toLowerCase().replace(/[^а-яa-z0-9]/gi, '')));

const valid = [];

for (const c of candidates) {
  const q = c.question.trim();
  const l = q.toLowerCase();

  // Exclude personal / conversational chatter
  if (
    l.includes('зовут') || l.includes('лет тебе') || l.includes('тебе лет') ||
    l.includes('денег') || l.includes('настроение') || l.includes('ты думаешь') ||
    l.includes('согласен') || l.includes('погнали') || l.includes('в каком классе') ||
    l.includes('откуда ты') || l.includes('твоя попытка') || l.includes('финальный') ||
    l.includes('правильно?') || l.includes('серьезно?') || l.includes('в смысле?') ||
    l.includes('правда?') || l.includes('попробуем?') || l.includes('го?') ||
    l.includes('уверен?') || l.includes('дальше?') || l.includes('готовы?') ||
    l.includes('поехали?') || l.includes('слышишь?') || l.includes('видишь?') ||
    l.includes('подсказку') || l.includes('подсказать') || l.includes('ошибку') ||
    l.includes('помощь') || l.includes('сколько дали') || l.includes('сколько выиграл') ||
    l.includes('патриках') || l.includes('парня') || l.includes('девушк') ||
    l.length < 15
  ) {
    continue;
  }

  const norm = q.toLowerCase().replace(/[^а-яa-z0-9]/gi, '');
  if (existingQuestions.has(norm)) continue;

  valid.push(c);
  existingQuestions.add(norm);
}

console.log(`Found ${valid.length} non-chatter questions from transcripts!`);
fs.writeFileSync('C:\\Users\\Neuron\\.gemini\\antigravity\\scratch\\vekshito-quiz\\scripts\\valid_candidates.json', JSON.stringify(valid.slice(0, 1000), null, 2), 'utf8');
