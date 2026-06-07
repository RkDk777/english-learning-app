import { storage } from '../utils/storage.js';
import { createProgressRing } from '../components/progress-ring.js';

function getMain() { return document.getElementById('main-content'); }

// ========== Stats Dashboard ==========
export function showStats() {
  const wordProgress = storage.getWordProgress();
  const grammarProgress = storage.getGrammarProgress();
  const readingProgress = storage.getReadingProgress();
  const errorBook = storage.getErrorBook();
  const dailyLog = storage.getDailyLog();
  const examHistory = storage.getExamHistory();
  const streak = storage.getStreak();

  const totalWords = Object.keys(wordProgress).length;
  const masteredWords = Object.values(wordProgress).filter(p => p.status === 'mastered').length;
  const totalGrammar = Object.keys(grammarProgress).length;
  const completedGrammar = Object.values(grammarProgress).filter(p => p.completed).length;
  const totalReading = Object.keys(readingProgress).length;
  const completedReading = Object.values(readingProgress).filter(p => p.completed).length;

  // Avg exam score
  const avgScore = examHistory.length > 0
    ? Math.round(examHistory.reduce((s, e) => s + e.score, 0) / examHistory.length)
    : 0;

  getMain().innerHTML = `
    <div class="page">
      <div class="page-header">
        <h1>📊 学习统计</h1>
        <p>追踪你的学习进度和成果</p>
      </div>

      <!-- Quick Stats -->
      <div class="home-quick-stats mb-3">
        <div class="quick-stat">
          <div class="qs-icon words">📚</div>
          <div>
            <div class="qs-value">${masteredWords}</div>
            <div class="qs-label">已掌握单词</div>
          </div>
        </div>
        <div class="quick-stat">
          <div class="qs-icon grammar">📝</div>
          <div>
            <div class="qs-value">${completedGrammar}</div>
            <div class="qs-label">已学语法点</div>
          </div>
        </div>
        <div class="quick-stat">
          <div class="qs-icon reading">📖</div>
          <div>
            <div class="qs-value">${completedReading}</div>
            <div class="qs-label">完成阅读</div>
          </div>
        </div>
        <div class="quick-stat">
          <div class="qs-icon streak">🔥</div>
          <div>
            <div class="qs-value">${streak}</div>
            <div class="qs-label">连续学习天数</div>
          </div>
        </div>
      </div>

      <div class="grid-2 mb-3">
        <!-- Progress Rings -->
        <div class="card">
          <div class="card-header"><h3>📈 学习进度</h3></div>
          <div class="card-body">
            <div class="flex justify-center gap-3" id="progress-rings"></div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="card">
          <div class="card-header"><h3>📅 最近7天学习</h3></div>
          <div class="card-body">
            <div id="weekly-chart" style="height:180px;"></div>
          </div>
        </div>

        <!-- Exam History -->
        <div class="card">
          <div class="card-header">
            <h3>📝 考试成绩</h3>
            ${avgScore > 0 ? `<span class="tag ${avgScore >= 80 ? 'success' : avgScore >= 60 ? 'warning' : 'danger'}">均分 ${avgScore}</span>` : ''}
          </div>
          <div class="card-body">
            ${examHistory.length > 0 ? `
              <div style="max-height:200px;overflow-y:auto;">
                ${examHistory.slice(-5).reverse().map((e, i) => `
                  <div class="flex justify-between items-center" style="padding:8px 0;border-bottom:1px solid var(--color-border-light);">
                    <span class="${i === 0 ? 'font-weight:600;' : ''}" style="font-size:var(--fs-sm);">
                      ${e.level === 'junior' ? '🏫 初中' : '🎓 高中'}模拟考
                    </span>
                    <span style="font-weight:700;color:${e.score >= 80 ? 'var(--color-success)' : e.score >= 60 ? 'var(--color-warning)' : 'var(--color-danger)'};">
                      ${e.score}分
                    </span>
                    <span class="text-muted" style="font-size:var(--fs-xs);">
                      ${new Date(e.date).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                `).join('')}
              </div>
            ` : '<p class="text-muted text-center">还没有考试记录</p>'}
          </div>
        </div>

        <!-- Error Book -->
        <div class="card">
          <div class="card-header">
            <h3>📕 错题本</h3>
            <div class="flex gap-1">
              <span class="text-muted" style="font-size:var(--fs-xs);">${errorBook.length} 条记录</span>
              ${errorBook.length > 0 ? `<button class="btn btn-sm btn-danger" id="btn-clear-errors">清空</button>` : ''}
            </div>
          </div>
          <div class="card-body">
            ${errorBook.length > 0 ? `
              <div style="max-height:280px;overflow-y:auto;" class="error-list">
                ${errorBook.slice(-20).reverse().map(e => `
                  <div class="error-item">
                    <span class="tag">${e.module}</span>
                    <div style="flex:1;min-width:0;">
                      <div style="font-size:var(--fs-sm);color:var(--color-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${e.question}</div>
                      <div style="font-size:var(--fs-xs);">
                        <span class="error-answer">${e.userAnswer || '未作答'}</span>
                        <span style="margin:0 4px;">→</span>
                        <span class="error-correct">${e.correctAnswer}</span>
                      </div>
                    </div>
                    <span class="error-count">✕${e.wrongCount || 1}</span>
                  </div>
                `).join('')}
              </div>
            ` : '<p class="text-muted text-center">🎉 暂无错题，继续保持！</p>'}
          </div>
        </div>
      </div>

      <!-- Data Management -->
      <div class="card">
        <div class="card-header"><h3>⚙️ 数据管理</h3></div>
        <div class="card-body">
          <div class="flex gap-1" style="flex-wrap:wrap;">
            <button class="btn btn-secondary btn-sm" id="btn-export">📥 导出学习数据</button>
            <button class="btn btn-secondary btn-sm" id="btn-import">📤 导入学习数据</button>
            <button class="btn btn-danger btn-sm" id="btn-reset">🗑 重置所有数据</button>
          </div>
          <input type="file" id="import-file" accept=".json" style="display:none;">
        </div>
      </div>
    </div>
  `;

  // Progress rings
  const ringsDiv = getMain().querySelector('#progress-rings');
  if (ringsDiv) {
    const wordRing = createProgressRing({
      size: 110,
      progress: totalWords > 0 ? (masteredWords / totalWords) * 100 : 0,
      color: 'var(--color-primary)',
      text: `${masteredWords}`,
      subtext: '单词',
    });
    const grammarRing = createProgressRing({
      size: 110,
      progress: totalGrammar > 0 ? (completedGrammar / totalGrammar) * 100 : 0,
      color: 'var(--color-success)',
      text: `${completedGrammar}`,
      subtext: '语法',
    });
    const readingRing = createProgressRing({
      size: 110,
      progress: totalReading > 0 ? (completedReading / totalReading) * 100 : 0,
      color: 'var(--color-warning)',
      text: `${completedReading}`,
      subtext: '阅读',
    });

    ringsDiv.appendChild(wordRing.element);
    ringsDiv.appendChild(grammarRing.element);
    ringsDiv.appendChild(readingRing.element);
  }

  // Weekly chart (simple bar chart)
  renderWeeklyChart(getMain().querySelector('#weekly-chart'), dailyLog);

  // Bind data management buttons
  getMain().querySelector('#btn-export')?.addEventListener('click', () => {
    const data = storage.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `english-learning-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('数据导出成功！', 'success');
  });

  getMain().querySelector('#btn-import')?.addEventListener('click', () => {
    getMain().querySelector('#import-file').click();
  });

  const importInput = getMain().querySelector('#import-file');
  importInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (confirm('导入数据将覆盖当前进度，确定继续吗？')) {
          storage.importAll(data);
          showToast('数据导入成功！', 'success');
          showStats(); // Refresh
        }
      } catch {
        showToast('文件格式错误', 'error');
      }
    };
    reader.readAsText(file);
  });

  getMain().querySelector('#btn-reset')?.addEventListener('click', () => {
    if (confirm('确定要重置所有学习数据吗？此操作不可恢复！')) {
      if (confirm('再次确认：所有进度、错题、考试记录将被清除。')) {
        storage.resetAll();
        showToast('数据已重置', 'success');
        showStats();
      }
    }
  });

  getMain().querySelector('#btn-clear-errors')?.addEventListener('click', () => {
    if (confirm('确定清空所有错题记录吗？')) {
      storage.clearErrors();
      showToast('错题本已清空', 'success');
      showStats();
    }
  });
}

// ========== Weekly Chart (Simple Canvas Bar Chart) ==========
function renderWeeklyChart(container, dailyLog) {
  if (!container) return;

  const days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const entry = dailyLog[key] || { words: 0, grammar: 0, reading: 0, listening: 0, exam: 0 };
    days.push({
      label: ['日', '一', '二', '三', '四', '五', '六'][d.getDay()],
      date: key,
      total: entry.words + entry.grammar + entry.reading + entry.listening,
      ...entry,
    });
  }

  const maxVal = Math.max(1, ...days.map(d => d.total));

  container.innerHTML = `
    <div style="display:flex;align-items:flex-end;gap:8px;height:150px;padding:8px 0;">
      ${days.map(d => `
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;height:100%;">
          <div style="display:flex;flex-direction:column-reverse;height:120px;width:100%;max-width:50px;background:var(--color-border-light);border-radius:6px;overflow:hidden;margin:0 auto;">
            <div style="height:${(d.total / maxVal) * 100}%;background:var(--color-primary);border-radius:6px 6px 0 0;transition:height 0.3s;min-height:${d.total > 0 ? '2px' : '0'};"></div>
          </div>
          <span style="font-size:var(--fs-xs);color:var(--color-text-muted);">${d.label}</span>
          ${d.total > 0 ? `<span style="font-size:10px;color:var(--color-text-secondary);">${d.total}</span>` : ''}
        </div>
      `).join('')}
    </div>
    <div style="display:flex;gap:12px;justify-content:center;font-size:var(--fs-xs);color:var(--color-text-muted);margin-top:8px;">
      <span>📚 单词</span><span>📝 语法</span><span>📖 阅读</span><span>🎧 听力</span>
    </div>
  `;
}

// ========== Toast ==========
function showToast(message, type = '') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
