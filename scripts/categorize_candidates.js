import fs from 'node:fs';

const items = JSON.parse(fs.readFileSync('C:\\Users\\Neuron\\.gemini\\antigravity\\scratch\\vekshito-quiz\\scripts\\extracted_trivia.json', 'utf8'));

console.log(`Analyzing ${items.length} extracted questions...`);

const buckets = {
  biology: [],
  chemistry: [],
  physics: [],
  history: [],
  geography: [],
  literature: [],
  russian: [],
  math_logic: [],
  general: [],
  culture: []
};

for (const it of items) {
  const q = it.question.toLowerCase();
  const c = it.context.toLowerCase();
  const t = it.videoTitle.toLowerCase();

  if (q.includes('клетк') || q.includes('хромосом') || q.includes('орган') || q.includes('пестик') || q.includes('тычинк') || q.includes('фотосинтез') || q.includes('хлорофилл') || q.includes('днк') || q.includes('животн') || q.includes('сердц') || q.includes('кост') || q.includes('зуб') || q.includes('бактери') || q.includes('вирус') || q.includes('растени') || q.includes('биолог')) {
    buckets.biology.push(it);
  } else if (q.includes('кислот') || q.includes('щелоч') || q.includes('валентност') || q.includes('элемент') || q.includes('периодическ') || q.includes('менделеев') || q.includes('атом') || q.includes('молекул') || q.includes('металл') || q.includes('газ') || q.includes('химич') || q.includes('формул') || q.includes('реакци')) {
    buckets.chemistry.push(it);
  } else if (q.includes('ньютон') || q.includes('энерги') || q.includes('ток') || q.includes('напряжени') || q.includes('скорость свет') || q.includes('гравитаци') || q.includes('сила') || q.includes('давлен') || q.includes('физик') || q.includes('ватт') || q.includes('ом') || q.includes('вольт') || q.includes('джоул') || q.includes('планет') || q.includes('солнц') || q.includes('лун') || q.includes('космос')) {
    buckets.physics.push(it);
  } else if (q.includes('войн') || q.includes('битв') || q.includes('цар') || q.includes('император') || q.includes('век') || q.includes('году') || q.includes('ссср') || q.includes('ленин') || q.includes('сталин') || q.includes('петр') || q.includes('рюрик') || q.includes('истор') || q.includes('революци') || q.includes('крещени')) {
    buckets.history.push(it);
  } else if (q.includes('столиц') || q.includes('океан') || q.includes('море') || q.includes('рек') || q.includes('озер') || q.includes('гор') || q.includes('материк') || q.includes('стран') || q.includes('город') || q.includes('географ') || q.includes('пролив') || q.includes('пустын')) {
    buckets.geography.push(it);
  } else if (q.includes('написал') || q.includes('автор') || q.includes('поэт') || q.includes('писател') || q.includes('роман') || q.includes('стихотворен') || q.includes('повест') || q.includes('пушкин') || q.includes('лермонтов') || q.includes('толстой') || q.includes('достоевск') || q.includes('литератур')) {
    buckets.literature.push(it);
  } else if (q.includes('падеж') || q.includes('ударени') || q.includes('букв') || q.includes('гласн') || q.includes('согласн') || q.includes('палиндром') || q.includes('антоним') || q.includes('синоним') || q.includes('фразеологизм') || q.includes('архаизм') || q.includes('пароним') || q.includes('русск') || q.includes('орфограф') || q.includes('предложени')) {
    buckets.russian.push(it);
  } else if (q.includes('треугольник') || q.includes('угол') || q.includes('градус') || q.includes('число') || q.includes('плюс') || q.includes('минус') || q.includes('умнож') || q.includes('раздел') || q.includes('корень') || q.includes('математ') || q.includes('теорем') || q.includes('пифагор') || q.includes('процент')) {
    buckets.math_logic.push(it);
  } else if (q.includes('картин') || q.includes('художник') || q.includes('музык') || q.includes('песн') || q.includes('фильм') || q.includes('режиссер') || q.includes('актер') || q.includes('кино')) {
    buckets.culture.push(it);
  } else {
    buckets.general.push(it);
  }
}

for (const [k, v] of Object.entries(buckets)) {
  console.log(`${k}: ${v.length} questions`);
}
