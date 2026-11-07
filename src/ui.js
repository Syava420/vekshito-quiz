/**
 * UI Controller: handles rendering, mobile interactions, and screen transitions.
 */
import { LEVEL_LABELS } from './srs.js';

export class UIController {
  constructor(quizEngine, srsEngine, settings, onSettingsChange) {
    this.quiz = quizEngine;
    this.srs = srsEngine;
    this.settings = settings;
    this.onSettingsChange = onSettingsChange;

    this.initDOMElements();
    this.bindEvents();
    this.renderHomeScreen();
  }

  initDOMElements() {
    // Screens
    this.screenHome = document.getElementById('screen-home');
    this.screenQuiz = document.getElementById('screen-quiz');
    this.screenSummary = document.getElementById('screen-summary');
    this.modalSettings = document.getElementById('modal-settings');

    // Header elements
    this.headerTitle = document.getElementById('header-title');
    this.btnBack = document.getElementById('btn-header-back');
    this.btnSettings = document.getElementById('btn-header-settings');
    this.modeSelector = document.getElementById('mode-selector');

    // Home elements
    this.categoriesGrid = document.getElementById('categories-grid');
    this.btnStartQuiz = document.getElementById('btn-start-quiz');
    this.filterToggle = document.getElementById('filter-due-toggle');
    this.homeStatsDue = document.getElementById('home-stats-due');
    this.homeStatsTotal = document.getElementById('home-stats-total');
    this.homeStatsMastered = document.getElementById('home-stats-mastered');

    // Quiz elements
    this.progressBar = document.getElementById('quiz-progress-bar');
    this.progressText = document.getElementById('quiz-progress-text');
    this.badgeCategory = document.getElementById('quiz-badge-category');
    this.badgeLevel = document.getElementById('quiz-badge-level');
    this.questionCard = document.getElementById('question-card');
    this.questionText = document.getElementById('question-text');

    // Mode-specific containers
    this.containerOptions = document.getElementById('container-options');
    this.containerInput = document.getElementById('container-input');
    this.containerYesNo = document.getElementById('container-yesno');

    // Input mode fields
    this.inputAnswer = document.getElementById('input-answer');
    this.btnSubmitInput = document.getElementById('btn-submit-input');
    this.btnHintInput = document.getElementById('btn-hint-input');
    this.hintDisplay = document.getElementById('hint-display');

    // Feedback area
    this.feedbackContainer = document.getElementById('feedback-container');
    this.feedbackTitle = document.getElementById('feedback-title');
    this.feedbackExplanation = document.getElementById('feedback-explanation');
    this.feedbackNextReview = document.getElementById('feedback-next-review');
    this.btnNextQuestion = document.getElementById('btn-next-question');

    // Summary elements
    this.summaryScore = document.getElementById('summary-score');
    this.summaryAccuracy = document.getElementById('summary-accuracy');
    this.btnRestartQuiz = document.getElementById('btn-restart-quiz');
    this.btnHomeFromSummary = document.getElementById('btn-home-from-summary');

    // Settings elements
    this.btnCloseSettings = document.getElementById('btn-close-settings');
    this.settingsModeOptions = document.querySelectorAll('input[name="setting-mode"]');
    this.btnExportData = document.getElementById('btn-export-data');
    this.btnImportData = document.getElementById('btn-import-data');
    this.fileImportInput = document.getElementById('file-import-input');
    this.btnResetData = document.getElementById('btn-reset-data');
  }

  bindEvents() {
    // Mode switcher in header (direct radio pill)
    this.modeSelector.addEventListener('click', (e) => {
      const target = e.target.closest('[data-mode]');
      if (!target) return;
      const newMode = target.getAttribute('data-mode');
      this.updateMode(newMode);
    });

    // Start quiz
    this.btnStartQuiz.addEventListener('click', () => {
      this.startQuiz();
    });

    // Due filter direct toggle
    this.filterToggle.addEventListener('change', () => {
      this.quiz.setFilter(this.filterToggle.checked ? 'due' : 'all');
      this.updateHomeStats();
    });

    // Navigation back
    this.btnBack.addEventListener('click', () => {
      this.showScreen('home');
    });

    // Settings modal
    this.btnSettings.addEventListener('click', () => {
      this.openSettings();
    });
    this.btnCloseSettings.addEventListener('click', () => {
      this.modalSettings.classList.add('hidden');
    });

    // Options mode click
    this.containerOptions.addEventListener('click', (e) => {
      const btn = e.target.closest('.option-btn');
      if (!btn || btn.disabled) return;
      const chosen = btn.getAttribute('data-option');
      this.handleAnswerSubmission(chosen);
    });

    // Yes/No mode click
    this.containerYesNo.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-yesno]');
      if (!btn || btn.disabled) return;
      const boolVal = btn.getAttribute('data-yesno') === 'true';
      this.handleAnswerSubmission(boolVal);
    });

    // Input mode submit
    this.btnSubmitInput.addEventListener('click', () => {
      this.handleInputSubmission();
    });
    this.inputAnswer.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.handleInputSubmission();
      }
    });

    // Input mode hint
    this.btnHintInput.addEventListener('click', () => {
      const q = this.quiz.getCurrentQuestion();
      if (!q) return;
      const ans = q.answer;
      this.hintDisplay.textContent = `Подсказка: начинается на «${ans[0].toUpperCase()}», букв: ${ans.length}`;
      this.hintDisplay.classList.remove('hidden');
      this.btnHintInput.disabled = true;
    });

    // Next question
    this.btnNextQuestion.addEventListener('click', () => {
      this.advanceQuestion();
    });

    // Summary buttons
    this.btnRestartQuiz.addEventListener('click', () => {
      this.startQuiz();
    });
    this.btnHomeFromSummary.addEventListener('click', () => {
      this.showScreen('home');
    });

    // Settings operations
    this.settingsModeOptions.forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.checked) {
          this.updateMode(e.target.value);
        }
      });
    });

    // Export progress
    this.btnExportData.addEventListener('click', () => {
      const jsonStr = this.srs.exportData();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vekshito_quiz_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    // Import progress
    this.btnImportData.addEventListener('click', () => {
      this.fileImportInput.click();
    });
    this.fileImportInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const success = this.srs.importData(event.target.result);
        if (success) {
          alert('Прогресс успешно загружен!');
          this.updateHomeStats();
        } else {
          alert('Ошибка чтения файла бэкапа.');
        }
      };
      reader.readAsText(file);
    });

    // Reset progress
    this.btnResetData.addEventListener('click', () => {
      if (confirm('Сбросить весь сохранённый прогресс повторений?')) {
        this.srs.resetProgress();
        this.updateHomeStats();
        this.modalSettings.classList.add('hidden');
      }
    });
  }

  updateMode(newMode) {
    this.settings.mode = newMode;
    this.quiz.setMode(newMode);
    this.onSettingsChange(this.settings);

    // Update header pills
    document.querySelectorAll('[data-mode]').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-mode') === newMode);
    });

    // Update settings radios
    this.settingsModeOptions.forEach(r => {
      r.checked = (r.value === newMode);
    });

    // If currently in quiz, re-render current question
    if (!this.screenQuiz.classList.contains('hidden')) {
      this.renderCurrentQuestion();
    }
  }

  showScreen(name) {
    this.screenHome.classList.add('hidden');
    this.screenQuiz.classList.add('hidden');
    this.screenSummary.classList.add('hidden');

    if (name === 'home') {
      this.screenHome.classList.remove('hidden');
      this.btnBack.classList.add('hidden');
      this.headerTitle.textContent = 'Эрудит Quiz';
      this.updateHomeStats();
    } else if (name === 'quiz') {
      this.screenQuiz.classList.remove('hidden');
      this.btnBack.classList.remove('hidden');
      this.headerTitle.textContent = 'Вопрос';
    } else if (name === 'summary') {
      this.screenSummary.classList.remove('hidden');
      this.btnBack.classList.remove('hidden');
      this.headerTitle.textContent = 'Результаты';
    }
  }

  renderHomeScreen() {
    this.updateMode(this.settings.mode);
    this.renderCategoriesGrid();
    this.showScreen('home');
  }

  renderCategoriesGrid() {
    const categories = [
      { id: 'all', name: 'Все темы (микс)', icon: '🎲' },
      { id: 'Биология', name: 'Биология', icon: '🧬' },
      { id: 'Химия', name: 'Химия', icon: '🧪' },
      { id: 'Физика', name: 'Физика', icon: '⚡' },
      { id: 'История', name: 'История', icon: '📜' },
      { id: 'География', name: 'География', icon: '🌍' },
      { id: 'Литература', name: 'Литература', icon: '📚' },
      { id: 'Русский язык', name: 'Русский язык', icon: '✍️' },
      { id: 'Математика и логика', name: 'Математика', icon: '📐' }
    ];

    this.categoriesGrid.innerHTML = '';
    categories.forEach(cat => {
      const card = document.createElement('button');
      card.className = `category-card ${cat.id === this.quiz.currentCategory ? 'active' : ''}`;
      card.setAttribute('data-category', cat.id);
      
      const count = cat.id === 'all'
        ? this.quiz.allQuestions.length
        : this.quiz.allQuestions.filter(q => q.category === cat.id).length;

      card.innerHTML = `
        <span class="cat-icon">${cat.icon}</span>
        <span class="cat-name">${cat.name}</span>
        <span class="cat-count">${count} вопр.</span>
      `;

      card.addEventListener('click', () => {
        document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.quiz.setCategory(cat.id);
        this.updateHomeStats();
      });

      this.categoriesGrid.appendChild(card);
    });
  }

  updateHomeStats() {
    let pool = this.quiz.allQuestions;
    if (this.quiz.currentCategory !== 'all') {
      pool = pool.filter(q => q.category === this.quiz.currentCategory);
    }
    const stats = this.srs.getStats(pool);
    this.homeStatsTotal.textContent = stats.total;
    this.homeStatsDue.textContent = stats.dueCount;
    this.homeStatsMastered.textContent = stats.masteredCount;

    const activeFilter = this.filterToggle.checked ? 'due' : 'all';
    const effectiveCount = activeFilter === 'due' ? stats.dueCount : stats.total;
    this.btnStartQuiz.textContent = `Начать раунд (${effectiveCount})`;
    this.btnStartQuiz.disabled = (effectiveCount === 0);
  }

  startQuiz() {
    this.quiz.initSession();
    if (this.quiz.deck.length === 0) {
      alert('В выбранной теме нет доступных вопросов для повторения.');
      return;
    }
    this.showScreen('quiz');
    this.renderCurrentQuestion();
  }

  renderCurrentQuestion() {
    const q = this.quiz.getCurrentQuestion();
    if (!q) {
      this.renderSummary();
      return;
    }

    const prog = this.quiz.getProgress();
    this.progressText.textContent = `${prog.current} / ${prog.total}`;
    this.progressBar.style.width = `${((prog.current - 1) / prog.total) * 100}%`;

    this.badgeCategory.textContent = q.category;
    const srsRec = this.srs.getRecord(q.id);
    this.badgeLevel.textContent = LEVEL_LABELS[srsRec.level] || 'Новый';

    // Hide feedback
    this.feedbackContainer.classList.add('hidden');
    this.questionCard.classList.remove('correct-card', 'incorrect-card');

    // Hide all input mode containers first
    this.containerOptions.classList.add('hidden');
    this.containerInput.classList.add('hidden');
    this.containerYesNo.classList.add('hidden');

    if (this.settings.mode === 'options') {
      this.renderOptionsMode(q);
    } else if (this.settings.mode === 'yesno') {
      this.renderYesNoMode(q);
    } else if (this.settings.mode === 'input') {
      this.renderInputMode(q);
    }
  }

  renderOptionsMode(q) {
    this.questionText.textContent = q.question;
    this.containerOptions.classList.remove('hidden');
    this.containerOptions.innerHTML = '';

    const options = this.quiz.getShuffledOptions(q);
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.setAttribute('data-option', opt);
      btn.textContent = opt;
      this.containerOptions.appendChild(btn);
    });
  }

  renderYesNoMode(q) {
    // Show assertion statement
    this.questionText.textContent = q.yesNo.statement;
    this.containerYesNo.classList.remove('hidden');

    // Re-enable yes/no buttons
    this.containerYesNo.querySelectorAll('[data-yesno]').forEach(b => {
      b.disabled = false;
      b.classList.remove('btn-correct-choice', 'btn-wrong-choice');
    });
  }

  renderInputMode(q) {
    this.questionText.textContent = q.question;
    this.containerInput.classList.remove('hidden');
    this.inputAnswer.value = '';
    this.inputAnswer.disabled = false;
    this.btnSubmitInput.disabled = false;
    this.btnHintInput.disabled = false;
    this.hintDisplay.classList.add('hidden');
    this.hintDisplay.textContent = '';
    setTimeout(() => this.inputAnswer.focus(), 100);
  }

  handleInputSubmission() {
    const val = this.inputAnswer.value.trim();
    if (!val) return;
    this.inputAnswer.disabled = true;
    this.btnSubmitInput.disabled = true;
    this.handleAnswerSubmission(val);
  }

  handleAnswerSubmission(answer) {
    const result = this.quiz.submitAnswer(answer);
    if (!result) return;

    // Visual styles for options
    if (this.settings.mode === 'options') {
      const q = this.quiz.getCurrentQuestion();
      this.containerOptions.querySelectorAll('.option-btn').forEach(btn => {
        btn.disabled = true;
        const opt = btn.getAttribute('data-option');
        if (opt === q.answer) {
          btn.classList.add('btn-correct-choice');
        } else if (opt === answer && !result.isCorrect) {
          btn.classList.add('btn-wrong-choice');
        }
      });
    }

    // Visual styles for Yes/No
    if (this.settings.mode === 'yesno') {
      const q = this.quiz.getCurrentQuestion();
      this.containerYesNo.querySelectorAll('[data-yesno]').forEach(btn => {
        btn.disabled = true;
        const val = btn.getAttribute('data-yesno') === 'true';
        if (val === q.yesNo.isCorrect) {
          btn.classList.add('btn-correct-choice');
        } else if (val === answer && !result.isCorrect) {
          btn.classList.add('btn-wrong-choice');
        }
      });
    }

    // Question card status border
    this.questionCard.classList.add(result.isCorrect ? 'correct-card' : 'incorrect-card');

    // Feedback content
    this.feedbackTitle.textContent = result.feedback;
    this.feedbackTitle.className = `feedback-title ${result.isCorrect ? 'text-success' : 'text-danger'}`;
    this.feedbackExplanation.textContent = result.explanation;

    const daysNext = Math.round((result.srsRecord.nextReviewDate - Date.now()) / (24 * 3600 * 1000));
    this.feedbackNextReview.textContent = `Повтор: ${LEVEL_LABELS[result.srsRecord.level]} (через ~${daysNext} дн.)`;

    this.feedbackContainer.classList.remove('hidden');
    this.feedbackContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  advanceQuestion() {
    const nextQ = this.quiz.nextQuestion();
    if (nextQ) {
      this.renderCurrentQuestion();
    } else {
      this.renderSummary();
    }
  }

  renderSummary() {
    this.showScreen('summary');
    const stats = this.quiz.sessionStats;
    this.summaryScore.textContent = `${stats.correct} из ${stats.total}`;
    const percent = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    this.summaryAccuracy.textContent = `${percent}%`;
  }

  openSettings() {
    this.modalSettings.classList.remove('hidden');
  }
}
