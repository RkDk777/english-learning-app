import { router } from '../router.js';
import { dataLoader } from '../utils/data-loader.js';
import { storage } from '../utils/storage.js';

function getMain() { return document.getElementById('main-content'); }

// ========== Reading List Page ==========
export async function showReadingHome() {
  getMain().innerHTML = `<div class="page"><div class="page-header"><h1>📖 阅读理解</h1><p>加载中...</p></div><div class="spinner"></div></div>`;

  try {
    const [junior, senior] = await Promise.all([
      dataLoader.loadReading('junior').catch(() => ({ passages: [] })),
      dataLoader.loadReading('senior').catch(() => ({ passages: [] })),
    ]);

    const readingProgress = storage.getReadingProgress();

    getMain().innerHTML = `
      <div class="page">
        <div class="page-header">
          <h1>📖 阅读理解</h1>
          <p>提升阅读能力，掌握解题技巧</p>
        </div>
        ${renderPassageSection('🏫 初中阅读', 'junior', junior.passages || [], readingProgress)}
        ${renderPassageSection('🎓 高中阅读', 'senior', senior.passages || [], readingProgress)}
      </div>
    `;

    // Bind click events
    getMain().querySelectorAll('.passage-card').forEach(card => {
      card.addEventListener('click', () => {
        const level = card.dataset.level;
        const idx = parseInt(card.dataset.index);
        const passages = level === 'junior' ? (junior.passages || []) : (senior.passages || []);
        if (passages[idx]) showReadingPage(passages[idx], level);
      });
    });
  } catch (e) {
    getMain().innerHTML = `<div class="page"><div class="page-header"><h1>📖 阅读理解</h1><p>加载失败: ${e.message}</p></div></div>`;
  }
}

function renderPassageSection(title, level, passages, progress) {
  const completed = passages.filter(p => progress[p.id]?.completed).length;
  return `
    <div class="mb-3">
      <div class="flex justify-between items-center mb-2">
        <h2 style="font-size:var(--fs-xl);font-weight:700;color:var(--color-text);">${title}</h2>
        <span class="text-muted" style="font-size:var(--fs-sm);">已完成 ${completed}/${passages.length}</span>
      </div>
      <div class="grid-2" id="passages-${level}">
        ${passages.map((p, i) => `
          <div class="card passage-card" data-level="${level}" data-index="${i}" style="cursor:pointer;">
            <div class="card-body">
              <div class="flex justify-between items-center">
                <span class="tag">${p.topic || '综合'}</span>
                <span class="text-muted" style="font-size:var(--fs-xs);">约${p.wordCount || '?'} 词</span>
              </div>
              <h3 style="margin:8px 0;font-size:var(--fs-base);">${p.title}</h3>
              <p class="text-secondary" style="font-size:var(--fs-sm);">${p.questions?.length || 0} 道题目</p>
              ${progress[p.id]?.completed
                ? `<div class="progress-bar mt-2"><div class="progress-fill success" style="width:${progress[p.id].score || 0}%;"></div></div>
                   <span class="text-muted" style="font-size:var(--fs-xs);">得分: ${progress[p.id].score || 0}%</span>`
                : ''
              }
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ========== Reading Passage Page ==========
function showReadingPage(passage, level) {
  let userAnswers = new Array(passage.questions?.length || 0).fill('');
  let submitted = false;

  function render() {
    getMain().innerHTML = `
      <div class="page">
        <div class="page-header">
          <button class="btn btn-secondary btn-sm mb-1" id="btn-back-read">← 返回文章列表</button>
          <h1>${passage.title}</h1>
          <p>${passage.topic || ''} · 约${passage.wordCount || '?'}词 · ${level === 'junior' ? '初中' : '高中'}难度</p>
        </div>
        <div class="reading-layout">
          <div class="reading-passage" id="passage-text">
            ${passage.content.split('\n').map(p => `<p style="margin-bottom:12px;text-indent:2em;">${p}</p>`).join('')}
          </div>
          <div class="reading-questions" id="questions-panel">
            <h3 style="margin-bottom:16px;">📝 阅读理解题 (${passage.questions?.length || 0}题)</h3>
            ${(passage.questions || []).map((q, i) => `
              <div class="mb-2" style="padding-bottom:16px;border-bottom:1px solid var(--color-border-light);">
                <div style="font-weight:600;color:var(--color-text);margin-bottom:8px;">
                  ${i + 1}. ${q.question}
                </div>
                <div class="quiz-options" style="gap:6px;">
                  ${(q.options || []).map((opt, oi) => {
                    let cls = '';
                    if (submitted) {
                      if (opt === q.answer) cls = 'correct';
                      if (opt === userAnswers[i] && opt !== q.answer) cls = 'wrong';
                    } else if (opt === userAnswers[i]) {
                      cls = 'selected';
                    }
                    return `
                      <button class="quiz-option ${cls}"
                        data-q="${i}" data-answer="${escapeHtml(opt)}"
                        ${submitted ? 'disabled' : ''}
                        style="font-size:var(--fs-sm);padding:10px 14px;">
                        ${String.fromCharCode(65 + oi)}. ${opt}
                      </button>
                    `;
                  }).join('')}
                </div>
                ${submitted && userAnswers[i] !== q.answer ? `
                  <div style="margin-top:8px;font-size:var(--fs-sm);color:var(--color-success);">
                    ✓ 正确答案: ${q.answer}
                    ${q.explanation ? `<br><span class="text-muted">${q.explanation}</span>` : ''}
                  </div>
                ` : ''}
                ${submitted && userAnswers[i] === q.answer ? `
                  <div style="margin-top:4px;font-size:var(--fs-sm);"><span class="tag success">✓ 正确</span></div>
                ` : ''}
              </div>
            `).join('')}
            ${!submitted ? `
              <button class="btn btn-primary btn-block mt-2" id="btn-submit-reading">
                提交答案
              </button>
            ` : `
              <div style="text-align:center;padding:16px;">
                <div style="font-size:var(--fs-2xl);font-weight:800;color:var(--color-primary);">
                  ${Math.round(userAnswers.filter((a, i) => a === passage.questions[i].answer).length / passage.questions.length * 100)}%
                </div>
                <p class="text-secondary">
                  正确 ${userAnswers.filter((a, i) => a === passage.questions[i].answer).length} / ${passage.questions.length} 题
                </p>
                <button class="btn btn-secondary btn-sm mt-1" id="btn-reset-read">🔄 重新作答</button>
              </div>
            `}
          </div>
        </div>
      </div>
    `;

    bindEventListeners(passage, level);
  }

  function bindEventListeners(passage, level) {
    getMain().querySelector('#btn-back-read')?.addEventListener('click', () => showReadingHome());

    // Option selection
    getMain().querySelectorAll('.quiz-option:not([disabled])').forEach(btn => {
      btn.addEventListener('click', () => {
        const qIdx = parseInt(btn.dataset.q);
        const answer = btn.dataset.answer;
        userAnswers[qIdx] = answer;
        render();
        // Scroll back to the question panel
        document.getElementById('questions-panel')?.scrollIntoView({ behavior: 'smooth' });
      });
    });

    // Submit
    getMain().querySelector('#btn-submit-reading')?.addEventListener('click', () => {
      const unanswered = userAnswers.filter(a => !a).length;
      if (unanswered > 0) {
        if (!confirm(`还有 ${unanswered} 道题未作答，确定提交吗？`)) return;
      }
      submitted = true;
      const total = passage.questions.length;
      const correct = userAnswers.filter((a, i) => a === passage.questions[i].answer).length;
      const score = Math.round((correct / total) * 100);

      storage.updateReading(passage.id, { completed: true, score, answers: [...userAnswers] });
      storage.logActivity('reading', 1);

      // Record errors
      passage.questions.forEach((q, i) => {
        if (userAnswers[i] !== q.answer) {
          storage.addError({
            module: 'reading',
            itemKey: `${passage.id}:q${i}`,
            question: q.question,
            userAnswer: userAnswers[i] || '未作答',
            correctAnswer: q.answer,
          });
        }
      });

      render();
    });

    // Reset
    getMain().querySelector('#btn-reset-read')?.addEventListener('click', () => {
      userAnswers = new Array(passage.questions.length).fill('');
      submitted = false;
      render();
    });
  }

  render();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
