/**
 * Main application bootstrap
 */
import { QUESTIONS_DATA } from './src/questions-data.js';
import { SRSEngine, loadSettings, saveSettings } from './src/srs.js';
import { QuizEngine } from './src/quiz-engine.js';
import { UIController } from './src/ui.js';

document.addEventListener('DOMContentLoaded', () => {
  const srsEngine = new SRSEngine();
  const settings = loadSettings();

  const quizEngine = new QuizEngine(QUESTIONS_DATA, srsEngine);
  quizEngine.setMode(settings.mode);

  window.app = new UIController(
    quizEngine,
    srsEngine,
    settings,
    (updatedSettings) => {
      saveSettings(updatedSettings);
    }
  );

  // Register service worker if available
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./sw.js?v=4').then((reg) => {
      reg.update();
    }).catch((err) => {
      console.warn('ServiceWorker registration skipped:', err);
    });
  }
});
