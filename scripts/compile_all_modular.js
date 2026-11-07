import fs from 'node:fs';
import path from 'node:path';

import { BIOLOGY_QUESTIONS } from '../data/categories/biology.js';
import { CHEMISTRY_QUESTIONS } from '../data/categories/chemistry.js';
import { PHYSICS_QUESTIONS } from '../data/categories/physics.js';
import { HISTORY_QUESTIONS } from '../data/categories/history.js';
import { GEOGRAPHY_QUESTIONS } from '../data/categories/geography.js';
import { LITERATURE_QUESTIONS } from '../data/categories/literature.js';
import { RUSSIAN_QUESTIONS } from '../data/categories/russian.js';
import { MATH_LOGIC_QUESTIONS } from '../data/categories/math_logic.js';
import { VISUAL_QUESTIONS } from '../data/categories/visual.js';

const allQuestions = [
  ...BIOLOGY_QUESTIONS,
  ...CHEMISTRY_QUESTIONS,
  ...PHYSICS_QUESTIONS,
  ...HISTORY_QUESTIONS,
  ...GEOGRAPHY_QUESTIONS,
  ...LITERATURE_QUESTIONS,
  ...RUSSIAN_QUESTIONS,
  ...MATH_LOGIC_QUESTIONS,
  ...VISUAL_QUESTIONS
];

// Validation
console.log(`Compiling modular database. Total questions: ${allQuestions.length}`);

const idSet = new Set();
let errors = 0;

for (const q of allQuestions) {
  if (idSet.has(q.id)) {
    console.error(`Duplicate ID: ${q.id}`);
    errors++;
  }
  idSet.add(q.id);

  if (!q.options || q.options.length !== 4) {
    console.error(`Question ${q.id} must have 4 options`);
    errors++;
  }
  if (!q.options.includes(q.answer)) {
    console.error(`Question ${q.id} options do not include answer "${q.answer}"`);
    errors++;
  }
  if (!q.yesNo || typeof q.yesNo.isCorrect !== 'boolean' || !q.yesNo.statement) {
    console.error(`Question ${q.id} has invalid yesNo object`);
    errors++;
  }
}

if (errors > 0) {
  console.error(`Validation failed with ${errors} errors.`);
  process.exit(1);
}

// Write to data/questions.json
const jsonPath = path.resolve('data/questions.json');
fs.writeFileSync(jsonPath, JSON.stringify(allQuestions, null, 2), 'utf8');

// Write to src/questions-data.js
const jsPath = path.resolve('src/questions-data.js');
const jsContent = `// Auto-compiled from modular category files
// Total questions: ${allQuestions.length}
import { BIOLOGY_QUESTIONS } from '../data/categories/biology.js';
import { CHEMISTRY_QUESTIONS } from '../data/categories/chemistry.js';
import { PHYSICS_QUESTIONS } from '../data/categories/physics.js';
import { HISTORY_QUESTIONS } from '../data/categories/history.js';
import { GEOGRAPHY_QUESTIONS } from '../data/categories/geography.js';
import { LITERATURE_QUESTIONS } from '../data/categories/literature.js';
import { RUSSIAN_QUESTIONS } from '../data/categories/russian.js';
import { MATH_LOGIC_QUESTIONS } from '../data/categories/math_logic.js';
import { VISUAL_QUESTIONS } from '../data/categories/visual.js';

export const QUESTIONS_DATA = [
  ...BIOLOGY_QUESTIONS,
  ...CHEMISTRY_QUESTIONS,
  ...PHYSICS_QUESTIONS,
  ...HISTORY_QUESTIONS,
  ...GEOGRAPHY_QUESTIONS,
  ...LITERATURE_QUESTIONS,
  ...RUSSIAN_QUESTIONS,
  ...MATH_LOGIC_QUESTIONS,
  ...VISUAL_QUESTIONS
];
`;
fs.writeFileSync(jsPath, jsContent, 'utf8');

console.log(`Successfully compiled ${allQuestions.length} questions into JSON and ES Module!`);
const catCounts = {};
for (const q of allQuestions) {
  catCounts[q.category] = (catCounts[q.category] || 0) + 1;
}
console.log('Category breakdown:', catCounts);
