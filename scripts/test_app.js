import { QUESTIONS_DATA } from '../src/questions-data.js';
import { SRSEngine, SRS_INTERVALS } from '../src/srs.js';
import { QuizEngine } from '../src/quiz-engine.js';
import { checkAnswerFuzzy, levenshteinDistance } from '../src/fuzzy-match.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('--- 1. Testing Dataset Integrity ---');
assert(QUESTIONS_DATA.length >= 400, `Has 400+ questions (actual: ${QUESTIONS_DATA.length})`);
for (const q of QUESTIONS_DATA) {
  if (!q.id || !q.category || !q.question || !q.answer || !q.options || !q.yesNo || !q.explanation) {
    assert(false, `Question ${q.id} has missing required fields`);
  }
  if (q.options.length !== 4) {
    assert(false, `Question ${q.id} does not have exactly 4 options`);
  }
  if (!q.options.includes(q.answer)) {
    assert(false, `Question ${q.id} options do not include the correct answer "${q.answer}"`);
  }
}
assert(true, 'All questions have valid structure, 4 options, yesNo assertions, and explanations');

console.log('\n--- 2. Testing Fuzzy Matching & Typo Tolerance ---');
// Exact match
const r1 = checkAnswerFuzzy('Хлорофилл', 'Хлорофилл', ['хлорофилл']);
assert(r1.isCorrect && r1.isExact, 'Exact match detected');

// Single typo
const r2 = checkAnswerFuzzy('хларофилл', 'Хлорофилл', ['хлорофилл']);
assert(r2.isCorrect && !r2.isExact, 'Single typo allowed for long word ("хларофилл" -> "хлорофилл")');

// ё vs е
const r3 = checkAnswerFuzzy('Пётр 1', 'Петр I', ['петр 1', 'петр первый']);
assert(r3.isCorrect, 'ё / е and numbers handled correctly');

// Completely wrong answer
const r4 = checkAnswerFuzzy('Космонавт', 'Хлорофилл', ['хлорофилл']);
assert(!r4.isCorrect, 'Wrong answer rejected');

console.log('\n--- 3. Testing SRS Intervals & Progression ---');
// Create in-memory mock storage
const mockStorage = {};
global.localStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = v; },
  removeItem: (k) => { delete mockStorage[k]; }
};

const srs = new SRSEngine();
const qId = 'test_q_1';

// Initial state
const initial = srs.getRecord(qId);
assert(initial.level === 0, 'New question starts at level 0');
assert(srs.isQuestionDue(qId), 'New question is due for practice');

// Correct answer 1 -> level 1 (30 days)
const step1 = srs.recordAnswer(qId, true);
assert(step1.level === 1, 'Correct answer advances to level 1');
const days1 = Math.round((step1.nextReviewDate - Date.now()) / (24 * 3600 * 1000));
assert(days1 === 30, `Level 1 schedules for 30 days (got ${days1})`);

// Correct answer 2 -> level 2 (60 days)
const step2 = srs.recordAnswer(qId, true);
assert(step2.level === 2, 'Second correct advances to level 2');
const days2 = Math.round((step2.nextReviewDate - Date.now()) / (24 * 3600 * 1000));
assert(days2 === 60, `Level 2 schedules for 60 days (got ${days2})`);

// Mistake on level 2 -> drops back to level 1 (14 days repeat)
const stepMistake = srs.recordAnswer(qId, false);
assert(stepMistake.level === 1, 'Mistake steps back 1 level (relaxed SRS, not wiped to 0)');
const daysMistake = Math.round((stepMistake.nextReviewDate - Date.now()) / (24 * 3600 * 1000));
assert(daysMistake === 14, `Mistake schedules review in 14 days (got ${daysMistake})`);

console.log('\n--- 4. Testing Quiz Engine Session Flow ---');
const quiz = new QuizEngine(QUESTIONS_DATA, srs);

// Mode: Options
quiz.setMode('options');
quiz.setCategory('Химия');
quiz.initSession();
assert(quiz.deck.length === 45, `Deck filtered by category 'Химия' has 45 questions (got ${quiz.deck.length})`);

const curQ = quiz.getCurrentQuestion();
assert(curQ !== null, 'Has active question in session');

const rightAns = quiz.submitAnswer(curQ.answer);
assert(rightAns.isCorrect === true, 'Options mode: correct answer accepted');

// Next question
const nextQ = quiz.nextQuestion();
assert(nextQ !== null && nextQ.id !== curQ.id, 'Advanced to next question');

// Mode: Yes/No
quiz.setMode('yesno');
const curQ2 = quiz.getCurrentQuestion();
const yesNoAns = quiz.submitAnswer(curQ2.yesNo.isCorrect);
assert(yesNoAns.isCorrect === true, 'Yes/No mode: boolean match accepted');

console.log('\n--- 5. Testing Anti-Looping (Answered cards excluded from next round) ---');
// When we start a new due session for 'Химия', the questions just answered should NOT appear in the deck!
const quiz2 = new QuizEngine(QUESTIONS_DATA, srs);
quiz2.setCategory('Химия');
quiz2.setFilter('due');
quiz2.initSession();
assert(quiz2.deck.length === 43, `Answered 2 questions are excluded from next round (expected 43, got ${quiz2.deck.length})`);
assert(!quiz2.deck.some(q => q.id === curQ.id), `Answered question "${curQ.id}" does not repeat in circle!`);
assert(!quiz2.deck.some(q => q.id === curQ2.id), `Answered question "${curQ2.id}" does not repeat in circle!`);

console.log(`\n========================================`);
console.log(`TEST SUMMARY: ${passed} passed, ${failed} failed.`);
console.log(`========================================`);

if (failed > 0) process.exit(1);
