import { router } from '../router.js';
import { dataLoader } from '../utils/data-loader.js';
import { storage } from '../utils/storage.js';
import { createFlashcard } from '../components/flashcard.js';
import { createQuiz } from '../components/quiz.js';
import { createWordList } from '../components/word-list.js';
import { generateVocabQuiz, generateSpellingQuiz, generateListeningQuiz, calculateScore } from '../utils/quiz-engine.js';

const GRADE_INFO = {
  grade7: { name: '七年级', sub: '初一 · 约500词', icon: '📗' },
  grade8: { name: '八年级', sub: '初二 · 约400词', icon: '📘' },
  grade9: { name: '九年级', sub: '初三 · 约400词', icon: '📙' },
  grade10: { name: '高一', sub: '高中必修 · 约500词', icon: '📒' },
  grade11: { name: '高二', sub: '高中选修 · 约500词', icon: '📓' },
  grade12: { name: '高三', sub: '高考冲刺 · 约500词', icon: '📔' },
};

function getMain() { return document.getElementById('main-content'); }

// ========== Grade Selection Page ==========
export async function showVocabularyHome() {
  getMain().innerHTML = `
    <div class="page">
      <div class="page-header">
        <h1>📚 单词学习</h1>
        <p>选择年级开始学习，使用闪卡记忆或测验巩固</p>
      </div>
      <div class="grid-3" id="grade-grid">
        ${Object.entries(GRADE_INFO).map(([key, info]) => `
          <div class="grade-card" data-grade="${key}">
            <div class="grade-icon">${info.icon}</div>
            <h3>${info.name}</h3>
            <div class="grade-subtitle">${info.sub}</div>
            <div class="grade-stats" id="stats-${key}">加载中...</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Bind grade cards
  getMain().querySelectorAll('.grade-card').forEach(card => {
    card.addEventListener('click', () => {
      const grade = card.dataset.grade;
      router.navigate(`/vocabulary/${grade}`);
    });
  });

  // Load stats for each grade
  for (const key of Object.keys(GRADE_INFO)) {
    try {
      const data = await dataLoader.loadVocabulary(key);
      const allWords = [];
      data.units.forEach(u => allWords.push(...u.words));
      const progress = storage.getWordProgress();
      const mastered = allWords.filter(w => progress[`${key}:${w.en}`]?.status === 'mastered').length;
      const el = getMain().querySelector(`#stats-${key}`);
      if (el) {
        el.innerHTML = `
          <div class="progress-bar mb-1"><div class="progress-fill" style="width:${allWords.length > 0 ? (mastered / allWords.length) * 100 : 0}%"></div></div>
          已掌握 ${mastered} / ${allWords.length}
        `;
      }
    } catch (e) {
      const el = getMain().querySelector(`#stats-${key}`);
      if (el) el.textContent = '暂无数据';
    }
  }
}

// ========== Grade Detail (Units) ==========
export async function showVocabularyGrade(grade) {
  const info = GRADE_INFO[grade] || { name: grade };
  getMain().innerHTML = `<div class="page"><div class="page-header"><h1>${info.icon} ${info.name} 单词</h1><p>加载中...</p></div><div class="spinner"></div></div>`;

  try {
    const data = await dataLoader.loadVocabulary(grade);
    const allWords = [];
    data.units.forEach(u => allWords.push(...u.words));

    getMain().innerHTML = `
      <div class="page">
        <div class="page-header">
          <button class="btn btn-secondary btn-sm mb-1" id="btn-back">← 返回年级选择</button>
          <h1>${info.icon} ${info.name}</h1>
          <p>共 ${data.units.length} 个单元，${allWords.length} 个单词</p>
        </div>
        <div class="vocab-mode-selector">
          <button class="mode-tab active" data-mode="units">📖 按单元学习</button>
          <button class="mode-tab" data-mode="flashcard">🃏 全部闪卡</button>
          <button class="mode-tab" data-mode="list">📋 单词列表</button>
          <button class="mode-tab" data-mode="quiz">✏️ 测验模式</button>
        </div>
        <div id="vocab-content"></div>
      </div>
    `;

    const contentDiv = getMain().querySelector('#vocab-content');
    const tabs = getMain().querySelectorAll('.mode-tab');

    function switchMode(mode) {
      tabs.forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
      if (mode === 'units') renderUnits();
      else if (mode === 'flashcard') renderFlashcard(allWords, grade);
      else if (mode === 'list') renderWordList(allWords, grade);
      else if (mode === 'quiz') renderQuizSelector(allWords, grade);
    }

    tabs.forEach(t => t.addEventListener('click', () => switchMode(t.dataset.mode)));
    getMain().querySelector('#btn-back').addEventListener('click', () => router.navigate('/vocabulary'));

    renderUnits();

    function renderUnits() {
      contentDiv.innerHTML = `
        <div class="grid-2">
          ${data.units.map((unit, i) => `
            <div class="unit-card" data-unit="${i}">
              <h4>📦 Unit ${unit.unit}</h4>
              <div style="font-size:var(--fs-sm);color:var(--color-text-secondary);margin-bottom:4px;">${unit.title}</div>
              <div class="unit-word-count">${unit.words.length} 个单词</div>
            </div>
          `).join('')}
        </div>
      `;

      contentDiv.querySelectorAll('.unit-card').forEach(card => {
        card.addEventListener('click', () => {
          const unitIdx = parseInt(card.dataset.unit);
          const unit = data.units[unitIdx];
          showUnitPage(grade, unit, allWords);
        });
      });
    }
  } catch (e) {
    getMain().innerHTML = `
      <div class="page"><div class="page-header">
        <button class="btn btn-secondary btn-sm mb-1" id="btn-back">← 返回</button>
        <h1>加载失败</h1><p>${e.message}</p>
      </div></div>
    `;
    getMain().querySelector('#btn-back')?.addEventListener('click', () => router.navigate('/vocabulary'));
  }
}

// ========== Unit Page (with sub-modes) ==========
function showUnitPage(grade, unit, allWords) {
  const words = unit.words;
  function getMain() { return document.getElementById('main-content'); }

  getMain().innerHTML = `
    <div class="page">
      <div class="page-header">
        <button class="btn btn-secondary btn-sm mb-1" id="btn-back">← 返回</button>
        <h1>📦 Unit ${unit.unit}: ${unit.title}</h1>
        <p>${words.length} 个单词</p>
      </div>
      <div class="vocab-mode-selector">
        <button class="mode-tab active" data-mode="flashcard">🃏 闪卡记忆</button>
        <button class="mode-tab" data-mode="list">📋 单词列表</button>
        <button class="mode-tab" data-mode="quiz">✏️ 测验</button>
      </div>
      <div id="unit-content"></div>
    </div>
  `;

  const contentDiv = getMain().querySelector('#unit-content');
  const tabs = getMain().querySelectorAll('.mode-tab');

  function switchMode(mode) {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
    if (mode === 'flashcard') renderFlashcard(words, grade);
    else if (mode === 'list') renderWordList(words, grade);
    else if (mode === 'quiz') renderQuizSelector(words, grade);
  }

  tabs.forEach(t => t.addEventListener('click', () => switchMode(t.dataset.mode)));
  getMain().querySelector('#btn-back').addEventListener('click', () => showVocabularyGrade(grade));

  renderFlashcard(words, grade);
}

// ========== Flashcard Mode ==========
function renderFlashcard(words, grade) {
  const contentDiv = document.getElementById('unit-content') || document.getElementById('vocab-content');
  if (!contentDiv) return;

  let index = 0;
  const shuffled = [...words].sort(() => Math.random() - 0.5);

  function showCard() {
    contentDiv.innerHTML = '';
    if (index >= shuffled.length) {
      contentDiv.innerHTML = `
        <div class="card" style="text-align:center;padding:40px;">
          <div style="font-size:3rem;margin-bottom:8px;">🎉</div>
          <h2>本轮学习完成！</h2>
          <p class="text-secondary">已复习 ${shuffled.length} 个单词</p>
          <button class="btn btn-primary mt-2" id="btn-restart">🔄 重新开始</button>
        </div>
      `;
      contentDiv.querySelector('#btn-restart').addEventListener('click', () => {
        index = 0;
        showCard();
      });
      return;
    }

    const word = shuffled[index];
    const flashcard = createFlashcard(
      word,
      (w) => {
        storage.updateWord(`${grade}:${w.en}`, { status: 'mastered' });
        storage.logActivity('words', 1);
        index++;
        showCard();
      },
      (w) => {
        storage.updateWord(`${grade}:${w.en}`, { status: 'learning' });
        storage.logActivity('words', 1);
        index++;
        showCard();
      }
    );

    flashcard.setProgress(index + 1, shuffled.length);
    contentDiv.appendChild(flashcard.element);
  }

  showCard();
}

// ========== Word List Mode ==========
function renderWordList(words, grade) {
  const contentDiv = document.getElementById('unit-content') || document.getElementById('vocab-content');
  if (!contentDiv) return;

  contentDiv.innerHTML = '';
  const wordList = createWordList(words, grade);
  contentDiv.appendChild(wordList.element);
}

// ========== Quiz Selector ==========
function renderQuizSelector(words, grade) {
  const contentDiv = document.getElementById('unit-content') || document.getElementById('vocab-content');
  if (!contentDiv) return;

  contentDiv.innerHTML = `
    <div class="grid-3">
      <div class="card card-body text-center" style="cursor:pointer;" id="quiz-en-zh">
        <div style="font-size:2rem;">🇬🇧→🇨🇳</div>
        <h3 style="margin:8px 0;">英译中</h3>
        <p class="text-secondary" style="font-size:var(--fs-sm);">看英文选中文</p>
      </div>
      <div class="card card-body text-center" style="cursor:pointer;" id="quiz-spell">
        <div style="font-size:2rem;">✍️</div>
        <h3 style="margin:8px 0;">拼写练习</h3>
        <p class="text-secondary" style="font-size:var(--fs-sm);">看中文写英文</p>
      </div>
      <div class="card card-body text-center" style="cursor:pointer;" id="quiz-listen">
        <div style="font-size:2rem;">🎧</div>
        <h3 style="margin:8px 0;">听音辨义</h3>
        <p class="text-secondary" style="font-size:var(--fs-sm);">听发音选含义</p>
      </div>
    </div>
  `;

  const count = Math.min(10, words.length);

  contentDiv.querySelector('#quiz-en-zh').addEventListener('click', () => {
    const questions = generateVocabQuiz(words, count);
    startQuiz(questions, grade);
  });

  contentDiv.querySelector('#quiz-spell').addEventListener('click', () => {
    const questions = generateSpellingQuiz(words, count);
    startQuiz(questions, grade);
  });

  contentDiv.querySelector('#quiz-listen').addEventListener('click', () => {
    const questions = generateListeningQuiz(words, count);
    startQuiz(questions, grade);
  });
}

// ========== Active Quiz ==========
function startQuiz(questions, grade) {
  const contentDiv = document.getElementById('unit-content') || document.getElementById('vocab-content');
  if (!contentDiv) return;

  contentDiv.innerHTML = '';

  const quiz = createQuiz(questions, (result) => {
    contentDiv.innerHTML = `
      <div class="quiz-result">
        <div style="font-size:4rem;">${result.score >= 80 ? '🎉' : result.score >= 60 ? '👍' : '💪'}</div>
        <div class="score">${result.score}%</div>
        <p class="text-secondary">正确 ${result.correct} / ${result.total} 题</p>
        <div class="progress-bar mt-2 mb-2" style="max-width:300px;margin-left:auto;margin-right:auto;">
          <div class="progress-fill ${result.score >= 80 ? 'success' : result.score >= 60 ? 'warning' : 'danger'}" style="width:${result.score}%;"></div>
        </div>
        <div class="flex justify-center gap-1 mt-2">
          <button class="btn btn-primary" id="btn-retry">🔄 再做一次</button>
          <button class="btn btn-secondary" id="btn-back-quiz">← 返回</button>
        </div>
        <div style="margin-top:24px;text-align:left;">
          <h4>答题详情</h4>
          ${result.results.map((r, i) => `
            <div class="${r.isCorrect ? 'grammar-example' : 'grammar-mistake'}" style="font-size:var(--fs-sm);">
              <strong>${i + 1}.</strong> ${r.prompt}
              ${r.isCorrect ? '<span class="tag success">✓</span>' : `<span class="tag danger">✗</span>`}
              <br>
              ${!r.isCorrect ? `<span class="text-muted">你的答案: ${r.userAnswer || '未作答'}</span><br><span style="color:var(--color-success);">正确答案: ${r.answer}</span>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Record errors
    result.results.forEach(r => {
      if (!r.isCorrect) {
        storage.addError({
          module: 'vocabulary',
          itemKey: r.itemKey,
          question: `${r.type}: ${r.word || r.hint || ''}`,
          userAnswer: r.userAnswer,
          correctAnswer: r.answer,
        });
      }
    });

    // Update word progress based on answers
    result.results.forEach(r => {
      if (r.isCorrect) {
        const wordKey = r.itemKey?.split(':')[1];
        if (wordKey) {
          const current = storage.getWordProgress();
          const key = `${grade}:${wordKey}`;
          const prev = current[key]?.status;
          if (prev === 'learning') storage.updateWord(key, { status: 'mastered' });
          else if (prev === 'new') storage.updateWord(key, { status: 'learning' });
        }
      }
    });

    storage.logActivity('words', result.correct);

    contentDiv.querySelector('#btn-retry')?.addEventListener('click', () => startQuiz(questions, grade));
    contentDiv.querySelector('#btn-back-quiz')?.addEventListener('click', () => renderQuizSelector(
      questions.map(q => ({ en: q.word || q.answer, zh: q.answer })),
      grade
    ));
  });

  contentDiv.appendChild(quiz.element);
}
