// Quiz generation engine — creates randomized quizzes from word/grammar data

// Shuffle array (Fisher-Yates)
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Pick N random items from array
function pickRandom(arr, n) {
  return shuffle(arr).slice(0, n);
}

/**
 * Generate a multiple-choice quiz: "What does [word] mean?"
 * @param {Array} words - All word objects
 * @param {number} count - Number of questions
 * @returns {Array} Quiz questions
 */
export function generateVocabQuiz(words, count = 10) {
  const selected = pickRandom(words, Math.min(count, words.length));
  const allWords = words; // for distractors

  return selected.map(word => {
    // Pick 3 random distractors
    const distractors = pickRandom(
      allWords.filter(w => w.en !== word.en),
      3
    ).map(w => w.zh);

    const options = shuffle([word.zh, ...distractors]);

    return {
      type: 'en-to-zh',
      prompt: '选择正确的中文意思',
      word: word.en,
      phonetic: word.phonetic,
      options,
      answer: word.zh,
      itemKey: `vocab:${word.en}`,
    };
  });
}

/**
 * Generate spelling quiz: "Write the English word for [Chinese meaning]"
 */
export function generateSpellingQuiz(words, count = 10) {
  const selected = pickRandom(words, Math.min(count, words.length));

  return selected.map(word => ({
    type: 'spelling',
    prompt: '根据中文写出英文单词',
    hint: word.zh,
    phonetic: word.phonetic,
    pos: word.pos,
    options: null,
    answer: word.en,
    itemKey: `spell:${word.en}`,
  }));
}

/**
 * Generate listening quiz: hear the word → select meaning
 */
export function generateListeningQuiz(words, count = 10) {
  const selected = pickRandom(words, Math.min(count, words.length));
  const allWords = words;

  return selected.map(word => {
    const distractors = pickRandom(
      allWords.filter(w => w.en !== word.en),
      3
    ).map(w => w.zh);

    const options = shuffle([word.zh, ...distractors]);

    return {
      type: 'listening',
      prompt: '听发音，选择正确的中文意思',
      word: word.en,
      options,
      answer: word.zh,
      itemKey: `listen:${word.en}`,
    };
  });
}

/**
 * Generate grammar exercise: multiple choice for a grammar topic
 */
export function generateGrammarQuiz(exercises, count = 5) {
  const selected = pickRandom(exercises, Math.min(count, exercises.length));
  return selected.map((ex, i) => ({
    type: 'grammar',
    prompt: ex.question || '选择正确答案',
    options: ex.options,
    answer: ex.answer,
    explanation: ex.explanation || '',
    itemKey: `grammar:${ex.id || i}`,
  }));
}

/**
 * Calculate score from quiz results
 */
export function calculateScore(questions, userAnswers) {
  let correct = 0;
  const results = questions.map((q, i) => {
    const userAnswer = userAnswers[i] || '';
    const isCorrect = userAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase();
    if (isCorrect) correct++;
    return { ...q, userAnswer, isCorrect };
  });
  return {
    total: questions.length,
    correct,
    score: questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0,
    results,
  };
}
