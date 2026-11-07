import fs from 'node:fs';

const candidates = JSON.parse(fs.readFileSync('C:\\Users\\Neuron\\.gemini\\antigravity\\scratch\\vekshito-quiz\\scripts\\all_candidates_parsed.json', 'utf8'));

// Filter for candidates that have strong trivia indicators
const indicators = [
  'столица', 'автор', 'написал', 'век', 'году', 'химич', 'орган', 'планет',
  'море', 'океан', 'река', 'костей', 'зубов', 'хромосом', 'давление', 'сила',
  'энергия', 'аббревиатур', 'палиндром', 'антоним', 'синоним', 'ударение',
  'царь', 'император', 'президент', 'война', 'битва', 'крещение', 'основан',
  'элемент', 'вещество', 'газ', 'металл', 'клетка', 'пестик', 'тычинк',
  'фотосинтез', 'градус', 'теорема', 'треугольник', 'корень', 'производн',
  'валентност', 'кислот', 'щелоч', 'днк', 'рнк', 'нейрон', 'атом', 'электрон'
];

const matches = candidates.filter(c => {
  const l = c.question.toLowerCase();
  return indicators.some(ind => l.includes(ind));
});

console.log(`Strong trivia questions matching indicators: ${matches.length}`);

// Sample 30 with context
for (let i = 0; i < 30; i++) {
  const m = matches[i * 5];
  if (!m) break;
  console.log(`\n[${i+1}] ${m.question}`);
  console.log(`    Ctx: ${m.context.slice(0, 150)}`);
}
