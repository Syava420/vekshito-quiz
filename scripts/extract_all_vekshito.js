import fs from 'node:fs';
import path from 'node:path';

const textPath = 'C:\\Users\\Neuron\\Desktop\\ВЕКШИТО_Все_Выпуски_Текст.txt';
const text = fs.readFileSync(textPath, 'utf8');

const rawBlocks = text.split(/={40,}\r?\nРОЛИК:\s*/).filter(x => x.trim().length > 0);

console.log(`Analyzing ${rawBlocks.length} episodes...`);

// Current questions
const currentQuestions = JSON.parse(fs.readFileSync('data/questions.json', 'utf8'));
console.log(`Current app questions: ${currentQuestions.length}`);

// Patterns that indicate a host asking a question
const QUESTION_PATTERNS = [
  /вопрос(?:\s+номер)?\s+(?:один|два|три|четыре|пять|шесть|семь|восемь|девять|десять|\d+)[.:\s]+([^.?!]+[?!])/i,
  /(?:первый|второй|третий|четвёртый|четвертый|пятый|шестой|седьмой|восьмой|девятый|десятый)\s+вопрос[.:\s]+([^.?!]+[?!])/i,
  /(?:как называется|в каком году|кто написал|кто был|кто такой|кто такая|кто автор|сколько|какой газ|какая столица|столица какой|чей это флаг|флаг какой|какая планета|какой элемент|как зовут человека|кто изображ[её]н|где находится|какое животное|какой самый|какая самая|какое самое|какие самые|как переводится|исправьте ошибку|что такое|почему|куда впадает)[^.?!]+[?]/i
];

// Let's inspect all lines
const candidateQuestions = [];

for (let epIndex = 0; epIndex < rawBlocks.length; epIndex++) {
  const block = rawBlocks[epIndex];
  const lines = block.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const epTitle = lines[0];
  const idMatch = block.match(/ID:\s*([a-zA-Z0-9_-]+)/);
  const epId = idMatch ? idMatch[1] : `ep_${epIndex}`;

  // Join lines that flow across line breaks
  // Subtitles often break lines mid-sentence!
  const fullText = lines.slice(4).join(' ').replace(/\s+/g, ' ');

  // Split into sentences
  const sentences = fullText.split(/(?<=[.?!])\s+/);

  for (let s of sentences) {
    const trimmed = s.replace(/^>>\s*/, '').trim();
    if (!trimmed.endsWith('?')) continue;

    // Filter out street chatter questions
    if (/^(как зовут|как тебя зовут|ты готов|начинаем|устроит|погнали|сколько тебе лет|откуда ты|ты откуда|серь[её]зно|правда|в смысле|да ладно|понял|ты биолог|ты химик|почему|куда|что|да\?|нет\?|где\?|кто\?)\s*\?/i.test(trimmed)) {
      continue;
    }
    if (trimmed.length < 15 || trimmed.length > 250) continue;

    // Check if it matches quiz question starters
    const isQuizQ = /^(как называется|в каком году|кто написал|кто автор|кто был|кто такой|кто такая|сколько|какой|какая|какое|какие|где находится|чей флаг|чей это флаг|флаг какой|как переводится|что означает|что такое|к какому классу|к какому семейству|какая река|какое море|какой океан|какая столица|столица|кто изображ|кто на фото|как зовут человека|в каком веке|назови|найди ошибку|исправьте ошибку|в каком слове|формула|чему равн)/i.test(trimmed);

    if (isQuizQ) {
      candidateQuestions.push({
        epIndex,
        epId,
        epTitle,
        rawQuestion: trimmed
      });
    }
  }
}

console.log(`Total raw quiz question candidates found: ${candidateQuestions.length}`);

// Let's sample candidates
console.log('\nSample 20 candidates:');
candidateQuestions.slice(0, 20).forEach((q, i) => {
  console.log(`${i + 1}. [${q.epId}] ${q.rawQuestion}`);
});
