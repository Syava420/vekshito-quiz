import fs from 'node:fs';

const content = fs.readFileSync('C:\\Users\\Neuron\\Desktop\\ВЕКШИТО_Все_Выпуски_Текст.txt', 'utf8');
const blocks = content.split(/={40,}\r?\nРОЛИК:\s*/).slice(1);

const existingJson = JSON.parse(fs.readFileSync('C:\\Users\\Neuron\\.gemini\\antigravity\\scratch\\vekshito-quiz\\data\\questions.json', 'utf8'));
const existingQuestions = new Set(existingJson.map(q => q.question.toLowerCase().replace(/[^а-яa-z0-9]/gi, '')));

const detected = [];

// Keywords that identify clear trivia questions
const triviaStarts = [
  'как называется', 'как зовут', 'в каком году', 'кто написал', 'кто автор',
  'столица', 'в какой стране', 'какой стране', 'какой город', 'формула',
  'чему равен', 'чему равна', 'сколько хромосом', 'кто открыл', 'кто создал',
  'кто первый', 'кто первым', 'самый большой', 'самая большая', 'самый глубокий',
  'самое глубокое', 'самая длинная', 'самый длинный', 'самая высокая',
  'самый высокий', 'какой элемент', 'какой газ', 'какой металл',
  'в чем измеряется', 'в чём измеряется', 'единица измерения',
  'как расшифровывается', 'что означает аббревиатура', 'расшифруйте аббревиатуру',
  'какой орган', 'сколько планет', 'какая планета', 'сколько материков',
  'сколько океанов', 'сколько зубов', 'сколько костей', 'сколько букв',
  'сколько падежей', 'сколько минут', 'сколько секунд', 'какое море',
  'какой пролив', 'какая река', 'какое озеро', 'в каком океане',
  'кто был первым', 'кто крестил', 'кто отменил', 'в каком веке',
  'назовите автора', 'произведение написал', 'кем приходится',
  'что изучает', 'какая наука', 'какая часть речи', 'синоним к слову',
  'антоним к слову', 'ударение в слове', 'как правильно пишется'
];

for (let bIdx = 0; bIdx < blocks.length; bIdx++) {
  const block = blocks[bIdx];
  const lines = block.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const title = lines[0] || 'Unknown';
  const fullText = lines.slice(1).join(' ');

  // Look for sentences
  const sentences = fullText.match(/[^.?!;]{10,180}\?/g) || [];
  for (const s of sentences) {
    const clean = s.replace(/>>/g, '').replace(/\[[^\]]+\]/g, '').trim();
    const l = clean.toLowerCase();

    // Check if it matches trivia triggers
    const isTrivia = triviaStarts.some(trigger => l.includes(trigger));
    if (!isTrivia) continue;

    // Filter out conversational junk
    if (l.includes('тебя зовут') || l.includes('меня зовут') || l.includes('настроение') ||
        l.includes('ты думаешь') || l.includes('согласен') || l.includes('погнали') ||
        l.includes('сколько лет тебе') || l.includes('в каком классе учишься') ||
        l.includes('откуда ты') || l.includes('твоя попытка')) {
      continue;
    }

    const norm = clean.toLowerCase().replace(/[^а-яa-z0-9]/gi, '');
    if (existingQuestions.has(norm)) continue;

    // Extract following dialogue context to see participant answers and host confirmation
    const sPos = fullText.indexOf(s);
    const after = fullText.slice(sPos + s.length, sPos + s.length + 300);

    detected.push({
      videoIdx: bIdx + 1,
      videoTitle: title,
      question: clean,
      context: after.replace(/\s+/g, ' ').trim()
    });
    existingQuestions.add(norm); // don't add duplicate in detected
  }
}

console.log(`Detected ${detected.length} brand new trivia questions from the transcripts!`);
fs.writeFileSync('C:\\Users\\Neuron\\.gemini\\antigravity\\scratch\\vekshito-quiz\\scripts\\extracted_trivia.json', JSON.stringify(detected, null, 2), 'utf8');
