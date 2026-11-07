import fs from 'node:fs';

const textPath = 'C:\\Users\\Neuron\\Desktop\\ВЕКШИТО_Все_Выпуски_Текст.txt';
const text = fs.readFileSync(textPath, 'utf8');

const rawBlocks = text.split(/={40,}\r?\nРОЛИК:\s*/).filter(x => x.trim().length > 0);
const currentQuestions = JSON.parse(fs.readFileSync('data/questions.json', 'utf8'));

// Chatter stopwords / patterns that disqualify a line as a real trivia question
const BANTER_PATTERNS = [
  /инсайт/i,
  /вариант(а|ы|ов)?\s*(есть|нету|нет|твой|у тебя)/i,
  /любим(ое|ый|ая)\s+слово/i,
  /какая кислота.*блин/i,
  /какие энергии я знаю/i,
  /сколько не знаешь/i,
  /какие варианты ответа/i,
  /вопрос номер.*интересен/i,
  /неужели.*написал/i,
  /так отвечаешь/i,
  /ты как думаешь/i,
  /а что ты/i,
  /какой твой ответ/i,
  /какой финальный твой ответ/i,
  /какая разница/i,
  /что ещё там может быть/i,
  /что они контролируют-то/i,
  /как думаешь/i,
  /а кто сейчас президент/i,
  /что такое.*василиса.*компромат/i
];

function isBanter(s) {
  for (const p of BANTER_PATTERNS) {
    if (p.test(s)) return true;
  }
  return false;
}

function cleanText(str) {
  return str
    .replace(/\[[^\]]+\]/g, '')
    .replace(/>>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract questions
const allExtracted = [];

for (let epIndex = 0; epIndex < rawBlocks.length; epIndex++) {
  const block = rawBlocks[epIndex];
  const lines = block.split(/\r?\n/).map(cleanText).filter(Boolean);
  const epTitle = lines[0];
  const idMatch = block.match(/ID:\s*([a-zA-Z0-9_-]+)/);
  const epId = idMatch ? idMatch[1] : `ep_${epIndex}`;

  const fullText = lines.slice(4).join(' ');
  const rawSentences = fullText.split(/(?<=[.?!])\s+/);

  for (let rawS of rawSentences) {
    const s = cleanText(rawS);
    if (!s.endsWith('?')) continue;
    if (s.length < 18 || s.length > 200) continue;
    if (isBanter(s)) continue;

    // Filter conversational openers
    if (/^(как зовут|как тебя зовут|ты готов|начинаем|устроит|погнали|сколько тебе лет|откуда ты|ты откуда|серь[её]зно|правда|в смысле|да ладно|понял|ты биолог|ты химик|почему|куда|что|да\?|нет\?|где\?|кто\?|правильно\?|не знаешь\?|слышал\?|помнишь\?|уверен|согласен|будем|хочешь|забрать|нравится|играем|попробуем|думаешь|пойд|отвечаешь|сда|подсказать|ну что|а ты|а вы|серьезно|точно)\b/i.test(s)) {
      continue;
    }

    // Must have question format
    const isQuizQ =
      /^(как называется|в каком году|кто написал|кто автор|кто был|кто такой|кто такая|сколько|какой|какая|какое|какие|где находится|чей флаг|чей это флаг|флаг какой|как переводится|что означает|что такое|к какому|какая река|какое море|какой океан|какая столица|столица какой|кто изображ|кто на фото|как зовут человека|в каком веке|назови|найди ошибку|исправьте ошибку|в каком слове|формула|чему равн|какой химический|какой газ|какой орган|какая планета|какая птица|какое животное|какая рыба|какой металл|самая высокая|самое глубокое|самый большой|самая длинная|самый высокий|самая большая|самое большое|чей портрет|кто на этом фото)/i.test(s);

    if (isQuizQ) {
      let cleanedQ = s
        .replace(/^(?:вопрос\s+(?:номер\s+)?(?:\d+|один|два|три|четыре|пять|шесть|семь|восемь|девять|десять)[.:\s]+)/i, '')
        .replace(/^(?:первый|второй|третий|четв[её]ртый|пятый|шестой|седьмой|восьмой|девятый|десятый)\s+вопрос[.:\s]+/i, '')
        .trim();

      if (cleanedQ.length >= 18 && cleanedQ.endsWith('?') && !isBanter(cleanedQ)) {
        allExtracted.push({
          epId,
          epTitle,
          question: cleanedQ
        });
      }
    }
  }
}

// Deduplicate by semantic keywords
function extractKeyTerms(q) {
  return q.toLowerCase()
    .replace(/[^а-яa-z0-9]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !['какой', 'какая', 'какое', 'какие', 'называется', 'человека', 'самый', 'самая', 'самое', 'этом', 'этой', 'этого', 'находится', 'году', 'вопрос'].includes(w));
}

const uniqueQuestions = [];
for (const item of allExtracted) {
  const terms = extractKeyTerms(item.question).sort().join('_');
  if (!terms) continue;

  const exists = uniqueQuestions.some(existing => {
    const existingTerms = extractKeyTerms(existing.question).sort().join('_');
    return existingTerms === terms || existing.question.toLowerCase() === item.question.toLowerCase();
  });

  if (!exists) {
    uniqueQuestions.push(item);
  }
}

console.log(`\n--- AUDIT OF VEKSHITO EPISODES ---`);
console.log(`Total episodes scanned: ${rawBlocks.length}`);
console.log(`Total clean unique questions extracted from Vekshito: ${uniqueQuestions.length}`);

// Match against current database
function matchesCurrentApp(vkQ, currentList) {
  const vkTerms = extractKeyTerms(vkQ.question);
  if (vkTerms.length === 0) return false;

  for (const cur of currentList) {
    const curTerms = extractKeyTerms(cur.question + ' ' + cur.answer + ' ' + (cur.acceptable ? cur.acceptable.join(' ') : ''));
    let matched = 0;
    for (const t of vkTerms) {
      if (curTerms.includes(t)) matched++;
    }
    // If at least 60% of key subject terms match or 2+ specific terms match
    if (matched >= Math.min(2, vkTerms.length) && matched / vkTerms.length >= 0.5) {
      return { cur, matched, total: vkTerms.length };
    }
  }
  return null;
}

const matched = [];
const missing = [];

for (const q of uniqueQuestions) {
  const matchResult = matchesCurrentApp(q, currentQuestions);
  if (matchResult) {
    matched.push({ vk: q, app: matchResult.cur });
  } else {
    missing.push(q);
  }
}

console.log(`Questions in our app: ${currentQuestions.length}`);
console.log(`Vekshito questions ALREADY in our app: ${matched.length}`);
console.log(`Vekshito questions NOT YET in our app: ${missing.length}`);

// Group missing by inferred subject
const categorizedMissing = {};
missing.forEach(m => {
  const q = m.question.toLowerCase();
  let cat = 'Общие знания / Разное';
  if (/растен|клетк|орган|бактери|животн|птиц|рыб|сердц|печен|почк|днк|хромосом|паук|биолог/i.test(q)) cat = 'Биология';
  else if (/кислот|газ|элемент|таблиц|менделеев|хим|реакци|металл|оксид|формул/i.test(q)) cat = 'Химия';
  else if (/энерги|сил|физик|скорост|тяготен|закон|ток|напряжен|давлен|звук|свет/i.test(q)) cat = 'Физика';
  else if (/век|битв|войн|сражен|цар|император|княз|революци|истори|ссср|ленин|сталин/i.test(q)) cat = 'История';
  else if (/флаг|столиц|рек|мор|океан|гор|стран|город|континент|материк|пролив|остров/i.test(q)) cat = 'География';
  else if (/писател|поэт|роман|повест|стихотворен|автор|пушкин|толстой|достоевск|чехов/i.test(q)) cat = 'Литература';
  else if (/слов|букв|ошибк|пароним|синоним|антоним|ударен|глагол|существительн|язык|фразеологизм/i.test(q)) cat = 'Русский язык';
  else if (/числ|цифр|уравнен|процент|треугольник|математик|геометри|алгебр/i.test(q)) cat = 'Математика и логика';
  else if (/планет|звезд|космос|галактик|солнц|лун/i.test(q)) cat = 'Астрономия';
  else if (/картин|художник|музык|композитор|музей|театр|балет/i.test(q)) cat = 'Искусство и культура';
  else if (/фото|портрет|кто на|как зовут человек/i.test(q)) cat = 'Фото и лица';

  if (!categorizedMissing[cat]) categorizedMissing[cat] = [];
  categorizedMissing[cat].push(m);
});

console.log('\n--- BREAKDOWN OF MISSING QUESTIONS BY CATEGORY ---');
for (const [c, list] of Object.entries(categorizedMissing)) {
  console.log(`• ${c}: ${list.length} вопросов`);
}

console.log('\nSample missing questions by category:');
for (const [c, list] of Object.entries(categorizedMissing)) {
  console.log(`\n[${c}]:`);
  list.slice(0, 3).forEach((item, idx) => {
    console.log(`  ${idx + 1}. [${item.epId}] ${item.question}`);
  });
}
