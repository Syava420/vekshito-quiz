import fs from 'node:fs';

const titles = fs.readFileSync('C:\\Users\\Neuron\\.gemini\\antigravity\\scratch\\vekshito-quiz\\scripts\\all_titles.txt', 'utf8').split('\n');

const clusters = {
  biology: [],
  chemistry: [],
  physics: [],
  history: [],
  geography: [],
  literature: [],
  russian: [],
  math_logic: [],
  ussr_general: [],
  cinema_music_culture: [],
  abbreviations: [],
  capital_flags: [],
  school_general: []
};

for (const t of titles) {
  const l = t.toLowerCase();
  if (l.includes('биолог') || l.includes('биология')) clusters.biology.push(t);
  else if (l.includes('хими')) clusters.chemistry.push(t);
  else if (l.includes('физик')) clusters.physics.push(t);
  else if (l.includes('истор') || l.includes('ссср') || l.includes('вов') || l.includes('войн')) clusters.history.push(t);
  else if (l.includes('географ') || l.includes('столиц') || l.includes('стран') || l.includes('город')) clusters.geography.push(t);
  else if (l.includes('литератур') || l.includes('книг') || l.includes('писател') || l.includes('поэт')) clusters.literature.push(t);
  else if (l.includes('русск') || l.includes('слов') || l.includes('грамот')) clusters.russian.push(t);
  else if (l.includes('математ') || l.includes('логик') || l.includes('задач')) clusters.math_logic.push(t);
  else if (l.includes('аббревиатур')) clusters.abbreviations.push(t);
  else if (l.includes('кино') || l.includes('фильм') || l.includes('музык') || l.includes('гнесинк')) clusters.cinema_music_culture.push(t);
  else clusters.school_general.push(t);
}

for (const [k, v] of Object.entries(clusters)) {
  console.log(`${k}: ${v.length} titles`);
}
