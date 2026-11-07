import fs from 'node:fs';

const textPath = 'C:\\Users\\Neuron\\Desktop\\ВЕКШИТО_Все_Выпуски_Текст.txt';
const text = fs.readFileSync(textPath, 'utf8');

const rawBlocks = text.split(/={40,}\r?\nРОЛИК:\s*/).filter(x => x.trim().length > 0);
const currentQuestions = JSON.parse(fs.readFileSync('data/questions.json', 'utf8'));

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

    if (/^(как зовут|как тебя зовут|ты готов|начинаем|устроит|погнали|сколько тебе лет|откуда ты|ты откуда|серь[её]зно|правда|в смысле|да ладно|понял|ты биолог|ты химик|почему|куда|что|да\?|нет\?|где\?|кто\?|правильно\?|не знаешь\?|слышал\?|помнишь\?|уверен|согласен|будем|хочешь|забрать|нравится|играем|попробуем|думаешь|пойд|отвечаешь|сда|подсказать|ну что|а ты|а вы|серьезно|точно)\b/i.test(s)) {
      continue;
    }

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

function matchesCurrentApp(vkQ, currentList) {
  const vkTerms = extractKeyTerms(vkQ.question);
  if (vkTerms.length === 0) return false;

  for (const cur of currentList) {
    const curTerms = extractKeyTerms(cur.question + ' ' + cur.answer + ' ' + (cur.acceptable ? cur.acceptable.join(' ') : ''));
    let matched = 0;
    for (const t of vkTerms) {
      if (curTerms.includes(t)) matched++;
    }
    if (matched >= Math.min(2, vkTerms.length) && matched / vkTerms.length >= 0.5) {
      return true;
    }
  }
  return false;
}

const missing = uniqueQuestions.filter(q => !matchesCurrentApp(q, currentQuestions));

fs.writeFileSync('scripts/missing_raw.json', JSON.stringify(missing, null, 2), 'utf8');
console.log(`Saved ${missing.length} missing questions to scripts/missing_raw.json`);
