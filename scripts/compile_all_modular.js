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
import { GENERAL_QUESTIONS } from '../data/categories/general.js';
import { ASTRONOMY_QUESTIONS } from '../data/categories/astronomy.js';
import { CULTURE_QUESTIONS } from '../data/categories/culture.js';
import { FLAGS_QUESTIONS } from '../data/categories/flags.js';
import { VEKSHITO_VAULT_01_QUESTIONS } from '../data/categories/vekshito_vault_01.js';
import { VEKSHITO_VAULT_02_QUESTIONS } from '../data/categories/vekshito_vault_02.js';
import { VEKSHITO_VAULT_03_QUESTIONS } from '../data/categories/vekshito_vault_03.js';
import { VEKSHITO_VAULT_04_QUESTIONS } from '../data/categories/vekshito_vault_04.js';
import { VEKSHITO_VAULT_05_QUESTIONS } from '../data/categories/vekshito_vault_05.js';
import { VEKSHITO_VAULT_06_QUESTIONS } from '../data/categories/vekshito_vault_06.js';
import { VEKSHITO_VAULT_07_QUESTIONS } from '../data/categories/vekshito_vault_07.js';

const allQuestions = [
  ...BIOLOGY_QUESTIONS,
  ...CHEMISTRY_QUESTIONS,
  ...PHYSICS_QUESTIONS,
  ...HISTORY_QUESTIONS,
  ...GEOGRAPHY_QUESTIONS,
  ...FLAGS_QUESTIONS,
  ...LITERATURE_QUESTIONS,
  ...RUSSIAN_QUESTIONS,
  ...MATH_LOGIC_QUESTIONS,
  ...GENERAL_QUESTIONS,
  ...ASTRONOMY_QUESTIONS,
  ...CULTURE_QUESTIONS,
  ...VEKSHITO_VAULT_01_QUESTIONS,
  ...VEKSHITO_VAULT_02_QUESTIONS,
  ...VEKSHITO_VAULT_03_QUESTIONS,
  ...VEKSHITO_VAULT_04_QUESTIONS,
  ...VEKSHITO_VAULT_05_QUESTIONS,
  ...VEKSHITO_VAULT_06_QUESTIONS,
  ...VEKSHITO_VAULT_07_QUESTIONS
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
import { GENERAL_QUESTIONS } from '../data/categories/general.js';
import { ASTRONOMY_QUESTIONS } from '../data/categories/astronomy.js';
import { CULTURE_QUESTIONS } from '../data/categories/culture.js';
import { FLAGS_QUESTIONS } from '../data/categories/flags.js';
import { VEKSHITO_VAULT_01_QUESTIONS } from '../data/categories/vekshito_vault_01.js';
import { VEKSHITO_VAULT_02_QUESTIONS } from '../data/categories/vekshito_vault_02.js';
import { VEKSHITO_VAULT_03_QUESTIONS } from '../data/categories/vekshito_vault_03.js';
import { VEKSHITO_VAULT_04_QUESTIONS } from '../data/categories/vekshito_vault_04.js';
import { VEKSHITO_VAULT_05_QUESTIONS } from '../data/categories/vekshito_vault_05.js';
import { VEKSHITO_VAULT_06_QUESTIONS } from '../data/categories/vekshito_vault_06.js';
import { VEKSHITO_VAULT_07_QUESTIONS } from '../data/categories/vekshito_vault_07.js';

export const QUESTIONS_DATA = [
  ...BIOLOGY_QUESTIONS,
  ...CHEMISTRY_QUESTIONS,
  ...PHYSICS_QUESTIONS,
  ...HISTORY_QUESTIONS,
  ...GEOGRAPHY_QUESTIONS,
  ...FLAGS_QUESTIONS,
  ...LITERATURE_QUESTIONS,
  ...RUSSIAN_QUESTIONS,
  ...MATH_LOGIC_QUESTIONS,
  ...GENERAL_QUESTIONS,
  ...ASTRONOMY_QUESTIONS,
  ...CULTURE_QUESTIONS,
  ...VEKSHITO_VAULT_01_QUESTIONS,
  ...VEKSHITO_VAULT_02_QUESTIONS,
  ...VEKSHITO_VAULT_03_QUESTIONS,
  ...VEKSHITO_VAULT_04_QUESTIONS,
  ...VEKSHITO_VAULT_05_QUESTIONS,
  ...VEKSHITO_VAULT_06_QUESTIONS,
  ...VEKSHITO_VAULT_07_QUESTIONS
];
`;
fs.writeFileSync(jsPath, jsContent, 'utf8');

console.log(`Successfully compiled ${allQuestions.length} questions into JSON and ES Module!`);
const catCounts = {};
for (const q of allQuestions) {
  catCounts[q.category] = (catCounts[q.category] || 0) + 1;
}
console.log('Category breakdown:', catCounts);
