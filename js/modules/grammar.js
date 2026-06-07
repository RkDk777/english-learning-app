import { router } from '../router.js';
import { dataLoader } from '../utils/data-loader.js';
import { storage } from '../utils/storage.js';
import { createQuiz } from '../components/quiz.js';
import { generateGrammarQuiz } from '../utils/quiz-engine.js';

function getMain() { return document.getElementById('main-content'); }

// ========== Grammar List Page ==========
export async function showGrammarHome() {
  getMain().innerHTML = `<div class="page"><div class="page-header"><h1>📝 语法学习</h1><p>加载中...</p></div><div class="spinner"></div></div>`;

  try {
    const [junior, senior] = await Promise.all([
      dataLoader.loadGrammar('junior').catch(() => ({ categories: [] })),
      dataLoader.loadGrammar('senior').catch(() => ({ categories: [] })),
    ]);

    const grammarProgress = storage.getGrammarProgress();

    getMain().innerHTML = `
      <div class="page">
        <div class="page-header">
          <h1>📝 语法学习</h1>
          <p>系统学习初中到高中全部核心语法点</p>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
          ${renderGrammarPanel('初中语法', 'junior', junior.categories || [], grammarProgress)}
          ${renderGrammarPanel('高中语法', 'senior', senior.categories || [], grammarProgress)}
        </div>
      </div>
    `;

    bindGrammarEvents(junior.categories || [], senior.categories || []);
  } catch (e) {
    getMain().innerHTML = `<div class="page"><div class="page-header"><h1>📝 语法学习</h1><p>加载失败: ${e.message}</p></div></div>`;
  }
}

function renderGrammarPanel(title, level, categories, progress) {
  const total = categories.reduce((sum, c) => sum + (c.items?.length || 0), 0);
  const completed = categories.reduce((sum, c) =>
    sum + (c.items || []).filter(it => progress[it.id]?.completed).length, 0);

  return `
    <div class="card">
      <div class="card-header">
        <h3>${level === 'junior' ? '🏫' : '🎓'} ${title}</h3>
        <span class="text-muted" style="font-size:var(--fs-xs);">${completed}/${total} 已学</span>
      </div>
      <div class="card-body" id="grammar-${level}">
        ${categories.map(cat => `
          <div class="grammar-category" data-category="${cat.name}" data-level="${level}">
            <div class="grammar-category-header">
              <span class="expand-icon">▶</span>
              <span>${cat.name}</span>
              <span class="text-muted" style="font-size:var(--fs-xs);margin-left:auto;">
                ${cat.items?.length || 0} 个知识点
              </span>
            </div>
            <div class="grammar-items">
              ${(cat.items || []).map(item => `
                <div class="grammar-item" data-id="${item.id}" data-level="${level}">
                  <span>${progress[item.id]?.completed ? '✅ ' : '📌 '}${item.title}</span>
                  ${progress[item.id]?.completed
                    ? `<span class="tag success">得分 ${progress[item.id].score || 0}</span>`
                    : `<span class="tag">未学</span>`
                  }
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function bindGrammarEvents(juniorCategories, seniorCategories) {
  // Category toggle
  getMain().querySelectorAll('.grammar-category-header').forEach(header => {
    header.addEventListener('click', () => {
      header.parentElement.classList.toggle('open');
    });
  });

  // Grammar item click → detail page
  getMain().querySelectorAll('.grammar-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.dataset.id;
      const level = item.dataset.level;
      const categories = level === 'junior' ? juniorCategories : seniorCategories;
      let grammarItem = null;
      for (const cat of categories) {
        const found = (cat.items || []).find(it => it.id === id);
        if (found) { grammarItem = found; break; }
      }
      if (grammarItem) showGrammarDetail(grammarItem, level);
    });
  });
}

// ========== Grammar Detail Page ==========
function showGrammarDetail(item, level) {
  getMain().innerHTML = `
    <div class="page grammar-detail">
      <div class="page-header">
        <button class="btn btn-secondary btn-sm mb-1" id="btn-back">← 返回语法列表</button>
        <h1>${item.title}</h1>
        <p>${item.category || ''} · ${level === 'junior' ? '初中' : '高中'}</p>
      </div>

      <div class="card mb-3">
        <div class="card-body">
          <h3>📖 语法讲解</h3>
          <div style="margin-top:16px;line-height:1.9;color:var(--color-text);">
            ${(item.explanation || '').split('\n').map(p => `<p style="margin-bottom:12px;">${p}</p>`).join('')}
          </div>

          ${item.formula ? `
            <div class="grammar-formula">${item.formula}</div>
          ` : ''}
        </div>
      </div>

      ${item.examples?.length ? `
        <div class="card mb-3">
          <div class="card-header"><h3>💡 例句</h3></div>
          <div class="card-body">
            ${item.examples.map(ex => `
              <div class="grammar-example">
                <div class="en">${ex.en}</div>
                <div class="zh">${ex.zh}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${item.commonMistakes?.length ? `
        <div class="card mb-3">
          <div class="card-header"><h3>⚠️ 常见错误</h3></div>
          <div class="card-body">
            ${item.commonMistakes.map(m => `
              <div class="grammar-mistake">
                <div><span class="wrong">✗ ${m.wrong}</span></div>
                <div><span class="right">✓ ${m.right}</span></div>
                ${m.note ? `<div class="text-muted" style="font-size:var(--fs-xs);margin-top:4px;">${m.note}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${item.exercises?.length ? `
        <div class="card mb-3">
          <div class="card-header">
            <h3>✏️ 随堂练习</h3>
            <button class="btn btn-primary btn-sm" id="btn-start-exercise">开始练习</button>
          </div>
          <div class="card-body" id="exercise-area">
            <p class="text-muted">共 ${item.exercises.length} 道练习题</p>
          </div>
        </div>
      ` : ''}
    </div>
  `;

  getMain().querySelector('#btn-back')?.addEventListener('click', () => showGrammarHome());
  getMain().querySelector('#btn-start-exercise')?.addEventListener('click', () => {
    startGrammarExercise(item.exercises, item.id);
  });
}

// ========== Grammar Exercise ==========
function startGrammarExercise(exercises, grammarId) {
  const exerciseArea = getMain().querySelector('#exercise-area');
  if (!exerciseArea) return;

  const questions = generateGrammarQuiz(exercises, Math.min(10, exercises.length));

  const quiz = createQuiz(questions, (result) => {
    storage.updateGrammar(grammarId, { completed: true, score: result.score });
    storage.logActivity('grammar', result.correct);

    // Record errors
    result.results.forEach(r => {
      if (!r.isCorrect) {
        storage.addError({
          module: 'grammar',
          itemKey: r.itemKey,
          question: r.prompt,
          userAnswer: r.userAnswer,
          correctAnswer: r.answer,
        });
      }
    });

    exerciseArea.innerHTML = `
      <div class="quiz-result">
        <div style="font-size:4rem;">${result.score >= 80 ? '🎉' : result.score >= 60 ? '👍' : '💪'}</div>
        <div class="score">${result.score}%</div>
        <p class="text-secondary">正确 ${result.correct} / ${result.total} 题</p>
        <div class="flex justify-center gap-1 mt-2">
          <button class="btn btn-primary" id="btn-retry-ex">🔄 再做一次</button>
        </div>
      </div>
    `;
    exerciseArea.querySelector('#btn-retry-ex')?.addEventListener('click', () => {
      startGrammarExercise(exercises, grammarId);
    });
  });

  exerciseArea.innerHTML = '';
  exerciseArea.appendChild(quiz.element);
}
