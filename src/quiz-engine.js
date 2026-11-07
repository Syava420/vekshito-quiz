/**
 * Quiz Engine: controls current deck, question sequencing, and validation.
 */
import { checkAnswerFuzzy } from './fuzzy-match.js';

export class QuizEngine {
  constructor(allQuestions, srsEngine) {
    this.allQuestions = allQuestions;
    this.srsEngine = srsEngine;

    this.currentCategory = 'all'; // 'all' or specific category name
    this.currentFilter = 'all';   // 'all' or 'due'
    this.mode = 'options';        // 'options' | 'input' | 'yesno'

    this.deck = [];
    this.currentIndex = 0;
    this.sessionStats = {
      total: 0,
      answered: 0,
      correct: 0,
      incorrect: 0
    };
  }

  setCategory(category) {
    this.currentCategory = category;
  }

  setFilter(filter) {
    this.currentFilter = filter;
  }

  setMode(mode) {
    this.mode = mode;
  }

  initSession() {
    let filtered = this.allQuestions;

    if (this.currentCategory !== 'all') {
      filtered = filtered.filter(q => q.category === this.currentCategory);
    }

    if (this.currentFilter === 'due') {
      filtered = filtered.filter(q => this.srsEngine.isQuestionDue(q.id));
    }

    // Shuffle deck for variety
    this.deck = [...filtered].sort(() => Math.random() - 0.5);
    this.currentIndex = 0;
    this.sessionStats = {
      total: this.deck.length,
      answered: 0,
      correct: 0,
      incorrect: 0
    };
  }

  getCurrentQuestion() {
    if (this.currentIndex >= this.deck.length) return null;
    return this.deck[this.currentIndex];
  }

  getShuffledOptions(question) {
    return [...question.options].sort(() => Math.random() - 0.5);
  }

  submitAnswer(userAnswer) {
    const q = this.getCurrentQuestion();
    if (!q) return null;

    let isCorrect = false;
    let feedback = '';

    if (this.mode === 'options') {
      isCorrect = (userAnswer === q.answer);
      feedback = isCorrect
        ? 'Правильно!'
        : `Неверно. Правильный ответ: ${q.answer}`;
    } else if (this.mode === 'yesno') {
      // userAnswer is boolean (true = Да, false = Нет)
      isCorrect = (userAnswer === q.yesNo.isCorrect);
      const expectedText = q.yesNo.isCorrect ? 'Да (правда)' : 'Нет (неправда)';
      feedback = isCorrect
        ? 'Верно!'
        : `Неверно. Правильный ответ: ${expectedText}`;
    } else if (this.mode === 'input') {
      const result = checkAnswerFuzzy(userAnswer, q.answer, q.acceptable || []);
      isCorrect = result.isCorrect;
      if (isCorrect) {
        if (!result.isExact) {
          feedback = `Засчитано с опечаткой! Правильно: ${q.answer}`;
        } else {
          feedback = 'Точно в цель!';
        }
      } else {
        feedback = `Неверно. Правильный ответ: ${q.answer}`;
      }
    }

    // Update SRS state
    const srsRecord = this.srsEngine.recordAnswer(q.id, isCorrect);

    this.sessionStats.answered += 1;
    if (isCorrect) {
      this.sessionStats.correct += 1;
    } else {
      this.sessionStats.incorrect += 1;
    }

    return {
      isCorrect,
      feedback,
      explanation: q.explanation,
      correctAnswer: q.answer,
      srsRecord,
      stats: { ...this.sessionStats }
    };
  }

  nextQuestion() {
    this.currentIndex += 1;
    return this.getCurrentQuestion();
  }

  getProgress() {
    return {
      current: this.currentIndex + 1,
      total: this.deck.length,
      percent: this.deck.length > 0 ? Math.round(((this.currentIndex) / this.deck.length) * 100) : 0
    };
  }
}
