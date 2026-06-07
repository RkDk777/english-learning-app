// localStorage wrapper for learning progress, errors, and settings
const KEYS = {
  WORD_PROGRESS: 'eng_word_progress',
  GRAMMAR_PROGRESS: 'eng_grammar_progress',
  READING_PROGRESS: 'eng_reading_progress',
  ERROR_BOOK: 'eng_error_book',
  EXAM_HISTORY: 'eng_exam_history',
  DAILY_LOG: 'eng_daily_log',
  SETTINGS: 'eng_settings',
};

class Storage {
  _get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  _set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('localStorage write failed:', e);
    }
  }

  // --- Word Progress ---
  // { "name": "mastered"|"learning"|"new", "lastReview": timestamp, "mistakes": number }
  getWordProgress() {
    return this._get(KEYS.WORD_PROGRESS) || {};
  }

  setWordProgress(progress) {
    this._set(KEYS.WORD_PROGRESS, progress);
  }

  updateWord(wordKey, data) {
    const progress = this.getWordProgress();
    progress[wordKey] = { ...progress[wordKey], ...data, lastReview: Date.now() };
    this.setWordProgress(progress);
  }

  getWordStatus(wordKey) {
    const progress = this.getWordProgress();
    return progress[wordKey]?.status || 'new';
  }

  getMasteredCount() {
    const progress = this.getWordProgress();
    return Object.values(progress).filter(p => p.status === 'mastered').length;
  }

  getLearningCount() {
    const progress = this.getWordProgress();
    return Object.values(progress).filter(p => p.status === 'learning').length;
  }

  // --- Grammar Progress ---
  // { "grammarId": { "completed": bool, "score": number, "lastPractice": timestamp } }
  getGrammarProgress() {
    return this._get(KEYS.GRAMMAR_PROGRESS) || {};
  }

  updateGrammar(grammarId, data) {
    const progress = this.getGrammarProgress();
    progress[grammarId] = { ...progress[grammarId], ...data, lastPractice: Date.now() };
    this._set(KEYS.GRAMMAR_PROGRESS, progress);
  }

  // --- Reading Progress ---
  getReadingProgress() {
    return this._get(KEYS.READING_PROGRESS) || {};
  }

  updateReading(passageId, data) {
    const progress = this.getReadingProgress();
    progress[passageId] = { ...progress[passageId], ...data, completedAt: Date.now() };
    this._set(KEYS.READING_PROGRESS, progress);
  }

  // --- Error Book ---
  // [{ module, itemKey, question, userAnswer, correctAnswer, timestamp }]
  getErrorBook() {
    return this._get(KEYS.ERROR_BOOK) || [];
  }

  addError(entry) {
    const book = this.getErrorBook();
    // Merge if same item already exists
    const existing = book.find(e => e.itemKey === entry.itemKey);
    if (existing) {
      existing.wrongCount = (existing.wrongCount || 1) + 1;
      existing.timestamp = Date.now();
      existing.userAnswer = entry.userAnswer;
    } else {
      book.push({ ...entry, wrongCount: 1, timestamp: Date.now() });
    }
    this._set(KEYS.ERROR_BOOK, book);
  }

  removeError(itemKey) {
    const book = this.getErrorBook().filter(e => e.itemKey !== itemKey);
    this._set(KEYS.ERROR_BOOK, book);
  }

  clearErrors() {
    this._set(KEYS.ERROR_BOOK, []);
  }

  // --- Exam History ---
  getExamHistory() {
    return this._get(KEYS.EXAM_HISTORY) || [];
  }

  addExamResult(result) {
    const history = this.getExamHistory();
    history.push({ ...result, date: Date.now() });
    // Keep last 50
    if (history.length > 50) history.shift();
    this._set(KEYS.EXAM_HISTORY, history);
  }

  // --- Daily Log ---
  getDailyLog() {
    return this._get(KEYS.DAILY_LOG) || {};
  }

  logActivity(type, count = 1) {
    const log = this.getDailyLog();
    const today = new Date().toISOString().slice(0, 10);
    if (!log[today]) log[today] = { words: 0, grammar: 0, reading: 0, listening: 0, exam: 0 };
    log[today][type] = (log[today][type] || 0) + count;
    this._set(KEYS.DAILY_LOG, log);
  }

  getStreak() {
    const log = this.getDailyLog();
    let streak = 0;
    const d = new Date();
    while (true) {
      const key = d.toISOString().slice(0, 10);
      if (log[key]) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }

  // --- Settings ---
  getSettings() {
    return this._get(KEYS.SETTINGS) || {
      theme: 'light',
      ttsSpeed: 1,
      dailyGoal: 20,
    };
  }

  saveSettings(settings) {
    this._set(KEYS.SETTINGS, { ...this.getSettings(), ...settings });
  }

  // --- Export / Import ---
  exportAll() {
    return {
      wordProgress: this.getWordProgress(),
      grammarProgress: this.getGrammarProgress(),
      readingProgress: this.getReadingProgress(),
      errorBook: this.getErrorBook(),
      examHistory: this.getExamHistory(),
      dailyLog: this.getDailyLog(),
      settings: this.getSettings(),
      exportedAt: new Date().toISOString(),
    };
  }

  importAll(data) {
    if (data.wordProgress) this.setWordProgress(data.wordProgress);
    if (data.grammarProgress) this._set(KEYS.GRAMMAR_PROGRESS, data.grammarProgress);
    if (data.readingProgress) this._set(KEYS.READING_PROGRESS, data.readingProgress);
    if (data.errorBook) this._set(KEYS.ERROR_BOOK, data.errorBook);
    if (data.examHistory) this._set(KEYS.EXAM_HISTORY, data.examHistory);
    if (data.dailyLog) this._set(KEYS.DAILY_LOG, data.dailyLog);
    if (data.settings) this.saveSettings(data.settings);
  }

  // --- Reset ---
  resetAll() {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  }
}

export const storage = new Storage();
