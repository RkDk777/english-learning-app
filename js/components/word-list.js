import { tts } from '../utils/tts.js';
import { storage } from '../utils/storage.js';

/**
 * Word list component — table with sort, search, and status display
 */
export function createWordList(words, gradeKey) {
  let filteredWords = [...words];
  let sortKey = null;
  let sortAsc = true;

  const container = document.createElement('div');

  // Search bar
  const searchDiv = document.createElement('div');
  searchDiv.className = 'search-wrapper mb-2';
  searchDiv.innerHTML = `
    <span class="search-icon">🔍</span>
    <input type="text" class="input input-search" placeholder="搜索单词..." id="word-search">
  `;

  // Stats row
  const statsDiv = document.createElement('div');
  statsDiv.className = 'flex items-center gap-2 mb-2';
  statsDiv.style.cssText = 'font-size:var(--fs-sm);color:var(--color-text-muted);';

  // Table
  const tableDiv = document.createElement('div');
  tableDiv.style.overflowX = 'auto';

  function renderTable() {
    updateStats();

    tableDiv.innerHTML = `
      <table class="word-table">
        <thead>
          <tr>
            <th data-sort="en">单词 <span class="sort-arrow">${sortKey === 'en' ? (sortAsc ? '▲' : '▼') : ''}</span></th>
            <th data-sort="zh">中文 <span class="sort-arrow">${sortKey === 'zh' ? (sortAsc ? '▲' : '▼') : ''}</span></th>
            <th data-sort="phonetic">音标</th>
            <th data-sort="pos">词性</th>
            <th>例句</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          ${filteredWords.map(w => {
            const status = storage.getWordStatus(`${gradeKey}:${w.en}`);
            const statusMap = {
              'mastered': '<span class="status-dot mastered"></span>已掌握',
              'learning': '<span class="status-dot learning"></span>学习中',
              'new': '<span class="status-dot new"></span>未学',
            };
            return `
              <tr>
                <td><span class="word-en">${w.en}</span></td>
                <td>${w.zh}</td>
                <td style="color:var(--color-text-muted);">${w.phonetic || '-'}</td>
                <td>${w.pos || '-'}</td>
                <td style="font-size:var(--fs-xs);color:var(--color-text-secondary);max-width:200px;">
                  ${w.example || '-'}
                </td>
                <td><span class="word-status">${statusMap[status]}</span></td>
                <td>
                  <button class="btn btn-sm btn-secondary speak-word-btn" data-word="${w.en}" title="听发音">🔊</button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;

    // Bind sort
    tableDiv.querySelectorAll('th[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        const key = th.dataset.sort;
        if (sortKey === key) {
          sortAsc = !sortAsc;
        } else {
          sortKey = key;
          sortAsc = true;
        }
        sortWords();
        renderTable();
      });
    });

    // Bind speak buttons
    tableDiv.querySelectorAll('.speak-word-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const word = btn.dataset.word;
        btn.textContent = '⏳';
        try { await tts.speakWord(word); } catch { /* ignore */ }
        btn.textContent = '🔊';
      });
    });
  }

  function sortWords() {
    if (!sortKey) return;
    filteredWords.sort((a, b) => {
      const va = (a[sortKey] || '').toLowerCase();
      const vb = (b[sortKey] || '').toLowerCase();
      if (va < vb) return sortAsc ? -1 : 1;
      if (va > vb) return sortAsc ? 1 : -1;
      return 0;
    });
  }

  function updateStats() {
    const total = words.length;
    const progress = storage.getWordProgress();
    const mastered = words.filter(w => progress[`${gradeKey}:${w.en}`]?.status === 'mastered').length;
    const learning = words.filter(w => progress[`${gradeKey}:${w.en}`]?.status === 'learning').length;
    statsDiv.innerHTML = `
      <span>共 <strong>${total}</strong> 个单词</span>
      <span class="tag success">已掌握 ${mastered}</span>
      <span class="tag warning">学习中 ${learning}</span>
      <span class="tag">未学 ${total - mastered - learning}</span>
    `;
  }

  // Search handler
  const searchInput = searchDiv.querySelector('#word-search');
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    if (query) {
      filteredWords = words.filter(w =>
        w.en.toLowerCase().includes(query) ||
        w.zh.includes(query)
      );
    } else {
      filteredWords = [...words];
    }
    sortKey = null;
    renderTable();
  });

  container.appendChild(searchDiv);
  container.appendChild(statsDiv);
  container.appendChild(tableDiv);

  renderTable();

  return {
    element: container,
    refresh: () => {
      filteredWords = [...words];
      renderTable();
    },
  };
}
