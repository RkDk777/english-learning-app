import { router } from '../router.js';
import { storage } from '../utils/storage.js';
import { dataLoader } from '../utils/data-loader.js';
import { generateVocabQuiz, generateGrammarQuiz } from '../utils/quiz-engine.js';

function getMain() { return document.getElementById('main-content'); }
const EXAM_DURATION = 60 * 60; // 60 minutes in seconds

// ========== Exam Home ==========
export async function showExamHome() {
  const examHistory = storage.getExamHistory();
  const lastExam = examHistory[examHistory.length - 1];

  getMain().innerHTML = `
    <div class="page">
      <div class="page-header">
        <h1>📝 模拟考试</h1>
        <p>综合测试，检验你的英语水平</p>
      </div>

      <div class="grid-2 mb-3">
        <div class="card" style="cursor:pointer;" id="exam-junior">
          <div class="card-body text-center">
            <div style="font-size:3rem;">🏫</div>
            <h2 style="margin:12px 0;">初中综合测试</h2>
            <p class="text-secondary">覆盖初中词汇和语法 · 60分钟</p>
            <p class="text-muted" style="font-size:var(--fs-sm);">单选20题 + 完形10题 + 阅读2篇</p>
          </div>
        </div>
        <div class="card" style="cursor:pointer;" id="exam-senior">
          <div class="card-body text-center">
            <div style="font-size:3rem;">🎓</div>
            <h2 style="margin:12px 0;">高中综合测试</h2>
            <p class="text-secondary">覆盖高中词汇和语法 · 60分钟</p>
            <p class="text-muted" style="font-size:var(--fs-sm);">单选20题 + 完形10题 + 阅读2篇</p>
          </div>
        </div>
      </div>

      ${lastExam ? `
        <div class="card">
          <div class="card-header"><h3>📊 最近一次考试</h3></div>
          <div class="card-body text-center">
            <div style="font-size:3rem;font-weight:800;color:var(--color-primary);">${lastExam.score}分</div>
            <p class="text-secondary">${new Date(lastExam.date).toLocaleString('zh-CN')}</p>
            <div class="progress-bar mt-2" style="max-width:300px;margin:0 auto;">
              <div class="progress-fill ${lastExam.score >= 80 ? 'success' : lastExam.score >= 60 ? 'warning' : 'danger'}" style="width:${lastExam.score}%;"></div>
            </div>
          </div>
        </div>
      ` : ''}

      ${examHistory.length > 1 ? `
        <div class="card mt-3">
          <div class="card-header"><h3>📈 历史成绩</h3></div>
          <div class="card-body">
            <div style="display:flex;align-items:flex-end;gap:8px;height:120px;padding:8px 0;" id="exam-chart">
              ${examHistory.slice(-10).map((e, i) => `
                <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">
                  <div style="width:100%;background:${e.score >= 80 ? 'var(--color-success)' : e.score >= 60 ? 'var(--color-warning)' : 'var(--color-danger)'};height:${e.score}%;border-radius:4px 4px 0 0;min-height:2px;transition:height 0.3s;"></div>
                  <span style="font-size:10px;color:var(--color-text-muted);">${e.score}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      ` : ''}
    </div>
  `;

  getMain().querySelector('#exam-junior')?.addEventListener('click', () => startExam('junior'));
  getMain().querySelector('#exam-senior')?.addEventListener('click', () => startExam('senior'));
}

// ========== Active Exam ==========
async function startExam(level) {
  getMain().innerHTML = `<div class="page" style="text-align:center;padding:60px;"><div class="spinner"></div><p>正在生成试卷...</p></div>`;

  try {
    // Load data
    const vocabGrades = level === 'junior'
      ? ['grade7', 'grade8', 'grade9']
      : ['grade10', 'grade11', 'grade12'];

    const [grammarData, ...vocabDataArr] = await Promise.all([
      dataLoader.loadGrammar(level),
      ...vocabGrades.map(g => dataLoader.loadVocabulary(g).catch(() => ({ units: [] }))),
    ]);

    // Collect all words
    const allWords = [];
    vocabDataArr.forEach(data => {
      (data?.units || []).forEach(u => allWords.push(...(u.words || [])));
    });

    // Collect all grammar exercises
    const allExercises = [];
    (grammarData?.categories || []).forEach(cat => {
      (cat.items || []).forEach(item => {
        (item.exercises || []).forEach(ex => {
          allExercises.push({ ...ex, id: `${item.id}_${Math.random()}` });
        });
      });
    });

    // Collect reading passages
    let readingPassages = [];
    try {
      const readingData = await dataLoader.loadReading(level);
      readingPassages = readingData.passages || [];
    } catch { /* no reading data */ }

    if (allWords.length < 20) {
      throw new Error('词汇数据不足，请先加载词库');
    }

    // Generate exam sections
    const vocabQuestions = generateVocabQuiz(allWords, 20);
    const grammarQuestions = allExercises.length >= 10
      ? generateGrammarQuiz(allExercises, 10)
      : generateVocabQuiz(allWords, 10).map(q => ({ ...q, type: 'grammar' }));

    // Cloze test: Pick a reading passage and remove some words
    const clozeQuestions = generateClozeQuestions(allWords, 10);

    // Reading comprehension
    const readingQuestions = [];
    const selectedPassages = readingPassages.sort(() => Math.random() - 0.5).slice(0, 2);
    selectedPassages.forEach(p => {
      (p.questions || []).forEach((q, qi) => {
        readingQuestions.push({
          ...q,
          passageTitle: p.title,
          passageContent: p.content,
          type: 'reading',
          prompt: `[${p.title}] ${q.question}`,
          itemKey: `exam_read:${p.id}:q${qi}`,
        });
      });
    });

    const allQuestions = [...vocabQuestions, ...grammarQuestions, ...clozeQuestions, ...readingQuestions];

    // Start the exam
    renderExam(allQuestions, level, EXAM_DURATION);

  } catch (e) {
    getMain().innerHTML = `
      <div class="page"><div class="page-header">
        <button class="btn btn-secondary btn-sm mb-1" id="btn-back-exam">← 返回</button>
        <h1>生成试卷失败</h1><p>${e.message}</p>
      </div></div>
    `;
    getMain().querySelector('#btn-back-exam')?.addEventListener('click', () => showExamHome());
  }
}

// Generate cloze questions from words
function generateClozeQuestions(words, count) {
  const selected = words.sort(() => Math.random() - 0.5).slice(0, count);

  return selected.map(word => {
    const distractors = words
      .filter(w => w.pos === word.pos && w.en !== word.en)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const options = [word.en, ...distractors.map(d => d.en)].sort(() => Math.random() - 0.5);

    return {
      type: 'cloze',
      prompt: `选择合适的单词填入空白: "${word.example || `The ___ is important.`}"`,
      options,
      answer: word.en,
      itemKey: `exam_cloze:${word.en}`,
    };
  });
}

// ========== Exam Render ==========
function renderExam(questions, level, duration) {
  let timeLeft = duration;
  let submitted = false;
  const answers = new Array(questions.length).fill('');

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function render() {
    getMain().innerHTML = `
      <div class="page">
        <!-- Timer -->
        <div class="exam-timer" id="exam-timer">${formatTime(timeLeft)}</div>

        <div class="page-header">
          <h1>📝 ${level === 'junior' ? '初中' : '高中'}综合模拟考试</h1>
          <p>共 ${questions.length} 题 · 时间 ${Math.floor(duration / 60)} 分钟 · 满分100分</p>
        </div>

        <!-- Single Choice + Grammar -->
        <div class="exam-section" id="section-vocab">
          <h3>一、单项选择 (30题)</h3>
          ${questions.slice(0, 30).map((q, i) => renderQuestion(q, i, answers[i])).join('')}
        </div>

        <!-- Cloze -->
        <div class="exam-section" id="section-cloze">
          <h3>二、完形填空 (10题)</h3>
          ${questions.slice(30, 40).map((q, i) => renderQuestion(q, 30 + i, answers[30 + i])).join('')}
        </div>

        <!-- Reading -->
        ${questions.length > 40 ? `
          <div class="exam-section" id="section-reading">
            <h3>三、阅读理解</h3>
            ${questions.slice(40).map((q, i) => {
              const readingQ = questions[40 + i];
              // Only show passage content for first question of each passage
              const isFirstOfPassage = i === 0 || questions[40 + i - 1]?.passageTitle !== readingQ?.passageTitle;
              return `
                ${isFirstOfPassage ? `
                  <div class="reading-passage mb-2" style="padding:16px;background:var(--bg-hover);border-radius:var(--radius-sm);font-size:var(--fs-sm);">
                    <strong>${readingQ?.passageTitle || '阅读短文'}</strong>
                    <div style="margin-top:8px;">${readingQ?.passageContent || ''}</div>
                  </div>
                ` : ''}
                ${renderQuestion(readingQ, 40 + i, answers[40 + i])}
              `;
            }).join('')}
          </div>
        ` : ''}

        <!-- Submit -->
        <div class="exam-submit-area">
          <button class="btn btn-primary btn-lg" id="btn-submit-exam">
            📝 交卷
          </button>
          <p class="text-muted mt-1" style="font-size:var(--fs-sm);">交卷后将立即显示成绩</p>
        </div>
      </div>
    `;

    bindEvents();
  }

  function renderQuestion(q, index, savedAnswer) {
    if (!q) return '';

    // For reading questions without standard format, format them
    if (!q.options && q.type === 'reading') {
      return `
        <div class="mb-2" style="padding:12px;background:var(--bg-card);border-radius:var(--radius-sm);border:1px solid var(--color-border-light);">
          <div style="font-weight:600;margin-bottom:8px;">${index + 1}. ${q.prompt || q.question || ''}</div>
          <div class="quiz-options" style="gap:6px;">
            ${(q.options || []).map((opt, oi) => `
              <button class="quiz-option ${savedAnswer === opt ? 'selected' : ''}" data-q="${index}" data-answer="${escapeHtml(opt)}" style="font-size:var(--fs-sm);padding:10px 14px;">
                ${String.fromCharCode(65 + oi)}. ${opt}
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }

    return `
      <div class="mb-2" style="padding:12px;background:var(--bg-card);border-radius:var(--radius-sm);border:1px solid var(--color-border-light);">
        <div style="font-weight:600;margin-bottom:8px;">${index + 1}. ${q.prompt}</div>
        ${q.word ? `<div style="font-family:Georgia,serif;font-size:var(--fs-lg);color:var(--color-primary);font-weight:600;margin-bottom:8px;">${q.word}</div>` : ''}
        ${q.hint ? `<div style="font-size:var(--fs-lg);font-weight:600;margin-bottom:8px;">${q.hint}</div>` : ''}
        <div class="quiz-options" style="gap:6px;">
          ${(q.options || []).map((opt, oi) => `
            <button class="quiz-option ${savedAnswer === opt ? 'selected' : ''}" data-q="${index}" data-answer="${escapeHtml(opt)}" style="font-size:var(--fs-sm);padding:10px 14px;">
              ${String.fromCharCode(65 + oi)}. ${opt}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  function bindEvents() {
    // Option selection
    getMain().querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => {
        if (submitted) return;
        const qIdx = parseInt(btn.dataset.q);
        const answer = btn.dataset.answer;
        answers[qIdx] = answer;
        render();
      });
    });

    // Submit exam
    getMain().querySelector('#btn-submit-exam')?.addEventListener('click', () => {
      if (submitted) return;
      const unanswered = answers.filter(a => !a).length;
      if (unanswered > 0) {
        if (!confirm(`还有 ${unanswered} 道题未作答，确定交卷吗？`)) return;
      }
      submitExam();
    });
  }

  function submitExam() {
    submitted = true;
    clearInterval(timerInterval);

    let totalCorrect = 0;
    const results = questions.map((q, i) => {
      const isCorrect = (answers[i] || '').trim() === (q.answer || '').trim();
      if (isCorrect) totalCorrect++;
      return { ...q, userAnswer: answers[i] || '', isCorrect };
    });

    const total = questions.length || 1;
    const score = Math.round((totalCorrect / total) * 100);

    // Calculate section scores
    const vocabCorrect = results.slice(0, 30).filter(r => r.isCorrect).length;
    const clozeCorrect = results.slice(30, 40).filter(r => r.isCorrect).length;
    const readingResults = results.slice(40);
    const readingCorrect = readingResults.filter(r => r.isCorrect).length;
    const readingTotal = readingResults.length || 1;

    storage.addExamResult({
      level,
      score,
      totalCorrect,
      totalQuestions: total,
      sections: {
        vocab: { correct: vocabCorrect, total: 30 },
        cloze: { correct: clozeCorrect, total: 10 },
        reading: { correct: readingCorrect, total: readingTotal },
      },
      timeUsed: duration - timeLeft,
    });
    storage.logActivity('exam', 1);

    // Record errors
    results.forEach(r => {
      if (!r.isCorrect) {
        storage.addError({
          module: 'exam',
          itemKey: r.itemKey || `exam:${Math.random()}`,
          question: r.prompt || r.question || '',
          userAnswer: r.userAnswer,
          correctAnswer: r.answer,
        });
      }
    });

    getMain().innerHTML = `
      <div class="page">
        <div class="page-header">
          <h1>📊 考试成绩</h1>
          <p>${level === 'junior' ? '初中' : '高中'}综合模拟考试</p>
        </div>

        <div class="quiz-result">
          <div style="font-size:4rem;">${score >= 90 ? '🏆' : score >= 70 ? '🎉' : score >= 60 ? '👍' : '💪'}</div>
          <div class="score">${score} 分</div>
          <p class="text-secondary">正确 ${totalCorrect} / ${total} 题</p>
          <div class="progress-bar mt-2 mb-2" style="max-width:300px;margin-left:auto;margin-right:auto;">
            <div class="progress-fill ${score >= 80 ? 'success' : score >= 60 ? 'warning' : 'danger'}" style="width:${score}%;"></div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;max-width:400px;margin:16px auto 0;">
            <div class="stat-card">
              <div class="stat-value" style="font-size:var(--fs-2xl);">${Math.round(vocabCorrect / 30 * 100)}%</div>
              <div class="stat-label">单项选择</div>
            </div>
            <div class="stat-card">
              <div class="stat-value" style="font-size:var(--fs-2xl);">${Math.round(clozeCorrect / 10 * 100)}%</div>
              <div class="stat-label">完形填空</div>
            </div>
            <div class="stat-card">
              <div class="stat-value" style="font-size:var(--fs-2xl);">${Math.round(readingCorrect / readingTotal * 100)}%</div>
              <div class="stat-label">阅读理解</div>
            </div>
          </div>

          <div class="flex justify-center gap-1 mt-3">
            <button class="btn btn-primary" id="btn-new-exam">🔄 重新考试</button>
            <button class="btn btn-secondary" id="btn-review">📋 查看详情</button>
          </div>

          <div id="exam-review" style="display:none;text-align:left;margin-top:24px;"></div>
        </div>
      </div>
    `;

    getMain().querySelector('#btn-new-exam')?.addEventListener('click', () => startExam(level));
    getMain().querySelector('#btn-review')?.addEventListener('click', () => {
      const reviewDiv = getMain().querySelector('#exam-review');
      if (reviewDiv.style.display === 'none') {
        reviewDiv.style.display = 'block';
        reviewDiv.innerHTML = `
          <h4 style="margin-bottom:12px;">答题详情</h4>
          ${results.map((r, i) => `
            <div class="${r.isCorrect ? 'grammar-example' : 'grammar-mistake'}" style="font-size:var(--fs-sm);">
              <strong>${i + 1}.</strong> ${r.prompt}
              ${r.isCorrect ? '<span class="tag success">✓</span>' : '<span class="tag danger">✗</span>'}
              <br>
              ${!r.isCorrect ? `<span class="text-muted">你的答案: ${r.userAnswer || '未作答'}</span><br><span style="color:var(--color-success);">正确答案: ${r.answer}</span>` : ''}
            </div>
          `).join('')}
        `;
      } else {
        reviewDiv.style.display = 'none';
      }
    });
  }

  // Timer
  const timerInterval = setInterval(() => {
    if (submitted) return;
    timeLeft--;
    const timerEl = document.getElementById('exam-timer');
    if (timerEl) {
      timerEl.textContent = formatTime(timeLeft);
      timerEl.className = 'exam-timer';
      if (timeLeft < 300) timerEl.classList.add('danger'); // 5 min
      else if (timeLeft < 600) timerEl.classList.add('warning'); // 10 min
    }
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      alert('考试时间到！系统将自动交卷。');
      submitExam();
    }
  }, 1000);

  // Initial render
  render();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
