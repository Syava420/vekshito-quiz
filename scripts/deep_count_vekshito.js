import fs from 'node:fs';

const textPath = 'C:\\Users\\Neuron\\Desktop\\ВЕКШИТО_Все_Выпуски_Текст.txt';
const text = fs.readFileSync(textPath, 'utf8');

const rawBlocks = text.split(/={40,}\r?\nРОЛИК:\s*/).filter(x => x.trim().length > 0);
const currentQuestions = JSON.parse(fs.readFileSync('data/questions.json', 'utf8'));

// Clean subtitle noise helper
function cleanText(str) {
  return str
    .replace(/\[[^\]]+\]/g, '') // remove [музыка], [смех]
    .replace(/>>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract all quiz questions from transcripts
const extractedQuestions = [];

for (let epIndex = 0; epIndex < rawBlocks.length; epIndex++) {
  const block = rawBlocks[epIndex];
  const lines = block.split(/\r?\n/).map(cleanText).filter(Boolean);
  const epTitle = lines[0];
  const idMatch = block.match(/ID:\s*([a-zA-Z0-9_-]+)/);
  const epId = idMatch ? idMatch[1] : `ep_${epIndex}`;

  // Process text as a stream of sentences
  const fullText = lines.slice(4).join(' ');
  // Split on sentence boundaries
  const rawSentences = fullText.split(/(?<=[.?!])\s+/);

  for (let rawS of rawSentences) {
    const s = cleanText(rawS);
    if (!s.endsWith('?')) continue;
    if (s.length < 15 || s.length > 220) continue;

    // Filter out conversational banter
    if (/^(как зовут|как тебя зовут|ты готов|начинаем|устроит|погнали|сколько тебе лет|откуда ты|ты откуда|серь[её]зно|правда|в смысле|да ладно|понял|ты биолог|ты химик|почему|куда|что|да\?|нет\?|где\?|кто\?|правильно\?|не знаешь\?|слышал\?|помнишь\?|уверен\?|уверена\?|согласен\?|согласна\?|будем\?|хочешь\?|забрать\?|нравится\?|играем\?|попробуем\?|думаешь\?|пойд[её]м\?|отвечаешь\?|сда[её]шься\?|подсказать\?|ну что\?|а ты\?|а вы\?|серьезно\?|точно\?)/i.test(s)) {
      continue;
    }

    // Heuristics for real trivia/quiz questions:
    const isTrivia =
      /^(как называется|в каком году|кто написал|кто автор|кто был|кто такой|кто такая|сколько|какой|какая|какое|какие|где находится|чей флаг|чей это флаг|флаг какой|как переводится|что означает|что такое|к какому|какая река|какое море|какой океан|какая столица|столица|кто изображ|кто на фото|как зовут человека|в каком веке|назови|найди ошибку|исправьте ошибку|в каком слове|формула|чему равн|какой химический|какой газ|какой орган|какая планета|какая птица|какое животное|какая рыба|какой металл|самая высокая|самое глубокое|самый большой|самая длинная|самый высокий|самая большая|самое большое)/i.test(s) ||
      /(?:вопрос\s+(?:номер\s+)?(?:\d+|один|два|три|четыре|пять|шесть|семь|восемь|девять|десять))/i.test(s) ||
      /(?:столица|автор|написал|году произошло|году была|году был|формула|символ в таблице|химический элемент|число хромосом|часть цветка|пигмент)/i.test(s);

    if (isTrivia) {
      // Clean leading "Вопрос номер N", "Первый вопрос" etc.
      let cleanedQ = s
        .replace(/^(?:вопрос\s+(?:номер\s+)?(?:\d+|один|два|три|четыре|пять|шесть|семь|восемь|девять|десять)[.:\s]+)/i, '')
        .replace(/^(?:первый|второй|третий|четв[её]ртый|пятый|шестой|седьмой|восьмой|девятый|десятый)\s+вопрос[.:\s]+/i, '')
        .trim();
      
      if (cleanedQ.length >= 15 && cleanedQ.endsWith('?')) {
        extractedQuestions.push({
          epId,
          epTitle,
          question: cleanedQ
        });
      }
    }
  }
}

console.log(`Extracted total question instances from videos: ${extractedQuestions.length}`);

// Normalization key for deduplication
function getNormKey(q) {
  return q.toLowerCase()
    .replace(/[^а-яa-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Deduplicate
const uniqueMap = new Map();
for (const item of extractedQuestions) {
  const key = getNormKey(item.question);
  // Simple similarity check or exact key
  if (!uniqueMap.has(key)) {
    uniqueMap.set(key, item);
  }
}

const uniqueVekshitoQuestions = Array.from(uniqueMap.values());
console.log(`Unique trivia questions found in Vekshito's videos: ${uniqueVekshitoQuestions.length}`);

// Now compare with current questions in our app
// Check if current question is covered
function isCovered(vkQ, currentQs) {
  const normVk = getNormKey(vkQ.question);
  const wordsVk = normVk.split(' ').filter(w => w.length > 3);
  
  for (const cur of currentQs) {
    const normCur = getNormKey(cur.question);
    // If exact or very high overlap
    if (normCur.includes(normVk) || normVk.includes(normCur)) return true;
    
    // Check word overlap
    let matches = 0;
    for (const w of wordsVk) {
      if (normCur.includes(w)) matches++;
    }
    if (wordsVk.length > 0 && matches / wordsVk.length >= 0.75) {
      return true;
    }
  }
  return false;
}

const alreadyAdded = [];
const notAddedYet = [];

for (const vk of uniqueVekshitoQuestions) {
  if (isCovered(vk, currentQuestions)) {
    alreadyAdded.push(vk);
  } else {
    notAddedYet.push(vk);
  }
}

console.log(`\n========================================`);
console.log(`COMPARISON RESULTS:`);
console.log(`Total questions in our app right now: ${currentQuestions.length}`);
console.log(`Total unique trivia questions in Vekshito videos: ${uniqueVekshitoQuestions.length}`);
console.log(`Already in our app: ${alreadyAdded.length}`);
console.log(`Not added yet from videos: ${notAddedYet.length}`);
console.log(`========================================\n`);

console.log('Sample of questions NOT ADDED YET (first 30):');
notAddedYet.slice(0, 30).forEach((q, i) => {
  console.log(`${i + 1}. [${q.epId}] ${q.question}`);
});
