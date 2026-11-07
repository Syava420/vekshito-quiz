/**
 * SRS (Spaced Repetition System) Engine
 * Relaxed intervals designed for casual mastery, not daily stress:
 * Level 0 -> New
 * Level 1 -> Repeat in 30 days (1 month)
 * Level 2 -> Repeat in 60 days (2 months)
 * Level 3 -> Repeat in 180 days (6 months)
 * Level 4 -> Repeat in 365 days (1 year)
 */

const STORAGE_KEY = 'vekshito_quiz_srs_v1';
const SETTINGS_KEY = 'vekshito_quiz_settings_v1';

// Intervals in milliseconds
export const SRS_INTERVALS = {
  1: 30 * 24 * 60 * 60 * 1000,   // 30 days
  2: 60 * 24 * 60 * 60 * 1000,   // 60 days
  3: 180 * 24 * 60 * 60 * 1000,  // 180 days (6 months)
  4: 365 * 24 * 60 * 60 * 1000   // 365 days (1 year)
};

export const LEVEL_LABELS = {
  0: 'Новый',
  1: '1-й месяц',
  2: '2 месяца',
  3: 'Полгода',
  4: 'Мастер (1 год)'
};

export class SRSEngine {
  constructor() {
    this.records = this.loadRecords();
  }

  loadRecords() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  saveRecords() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.records));
    } catch (e) {
      console.error('Failed to save SRS records:', e);
    }
  }

  getRecord(questionId) {
    if (!this.records[questionId]) {
      return {
        id: questionId,
        level: 0,
        nextReviewDate: 0,
        totalReviews: 0,
        correctCount: 0,
        errorCount: 0,
        lastAnswered: 0
      };
    }
    return this.records[questionId];
  }

  isQuestionDue(questionId) {
    const rec = this.getRecord(questionId);
    if (rec.level === 0) return true; // new questions can always be played
    return Date.now() >= rec.nextReviewDate;
  }

  recordAnswer(questionId, isCorrect) {
    const rec = this.getRecord(questionId);
    const now = Date.now();

    rec.totalReviews += 1;
    rec.lastAnswered = now;

    if (isCorrect) {
      rec.correctCount += 1;
      rec.level = Math.min(4, rec.level + 1);
      const intervalMs = SRS_INTERVALS[rec.level] || SRS_INTERVALS[4];
      rec.nextReviewDate = now + intervalMs;
    } else {
      rec.errorCount += 1;
      // Step back by 1 level instead of brutal wipeout
      rec.level = Math.max(1, rec.level - 1);
      // Give 14 days before asking again on mistake
      rec.nextReviewDate = now + 14 * 24 * 60 * 60 * 1000;
    }

    this.records[questionId] = rec;
    this.saveRecords();
    return rec;
  }

  getStats(questionsList) {
    let total = questionsList.length;
    let newCount = 0;
    let learningCount = 0; // levels 1-3
    let masteredCount = 0; // level 4
    let dueCount = 0;

    const now = Date.now();

    for (const q of questionsList) {
      const rec = this.records[q.id];
      if (!rec || rec.level === 0) {
        newCount++;
        dueCount++;
      } else {
        if (rec.level === 4) masteredCount++;
        else learningCount++;

        if (now >= rec.nextReviewDate) {
          dueCount++;
        }
      }
    }

    return { total, newCount, learningCount, masteredCount, dueCount };
  }

  exportData() {
    return JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      records: this.records
    }, null, 2);
  }

  importData(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed.records === 'object') {
        this.records = parsed.records;
        this.saveRecords();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  resetProgress() {
    this.records = {};
    this.saveRecords();
  }
}

// Settings manager
export const DEFAULT_SETTINGS = {
  mode: 'options', // 'options' | 'input' | 'yesno'
  sound: false
};

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}
