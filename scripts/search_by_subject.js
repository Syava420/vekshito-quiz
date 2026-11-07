import fs from 'node:fs';

const candidates = JSON.parse(fs.readFileSync('C:\\Users\\Neuron\\.gemini\\antigravity\\scratch\\vekshito-quiz\\scripts\\valid_candidates.json', 'utf8'));

function findQ(kw) {
  return candidates.filter(c => {
    const q = c.question.toLowerCase();
    return kw.some(k => q.includes(k));
  }).map(c => ({ q: c.question, ctx: c.context.slice(0, 120), title: c.videoTitle }));
}

console.log('Biology sample:', findQ(['клетк', 'орган', 'кров']).slice(0, 5));
console.log('Chemistry sample:', findQ(['кислот', 'периодическ', 'веществ']).slice(0, 5));
console.log('History sample:', findQ(['войн', 'цар', 'ссср', 'век']).slice(0, 5));
console.log('Culture sample:', findQ(['картин', 'художник', 'фильм', 'музык']).slice(0, 5));
console.log('General sample:', findQ(['аббревиатур', 'конституци', 'президент']).slice(0, 5));
console.log('Astronomy sample:', findQ(['планет', 'солнц', 'лун', 'космос', 'гагарин']).slice(0, 5));
