import { router } from '../router.js';
import { dataLoader } from '../utils/data-loader.js';
import { tts } from '../utils/tts.js';

const BOOKS = {
  grade7:  { name: '初一（七年级）', sub: '上下册', icon: '📗' },
  grade8:  { name: '初二（八年级）', sub: '上下册', icon: '📘' },
  grade9:  { name: '初三（九年级）', sub: '全一册', icon: '📙' },
  book_b1: { name: '必修 第一册', sub: 'Welcome + Unit 1-5', icon: '📒' },
  book_b2: { name: '必修 第二册', sub: 'Unit 1-5', icon: '📒' },
  book_b3: { name: '必修 第三册', sub: 'Unit 1-5', icon: '📒' },
  book_xb1:{ name: '选择性必修 第一册', sub: 'Unit 1-5', icon: '📓' },
  book_xb2:{ name: '选择性必修 第二册', sub: 'Unit 1-5', icon: '📓' },
  book_xb3:{ name: '选择性必修 第三册', sub: 'Unit 1-5', icon: '📓' },
  book_xb4:{ name: '选择性必修 第四册', sub: 'Unit 1-5', icon: '📓' },
};

function getMain() { return document.getElementById('main-content'); }

// ========== Home: pick a book ==========
export async function showReaderHome() {
  getMain().innerHTML = `
    <div class="page">
      <div class="page-header">
        <h1>📖 教材词汇表</h1>
        <p>按教材逐页展示完整生词表，适合打印或对照课本学习</p>
      </div>
      <h2 style="font-size:var(--fs-xl);font-weight:700;margin:24px 0 12px;">🏫 初中</h2>
      <div class="grid-3" style="gap:14px;">
        ${['grade7','grade8','grade9'].map(k => bookCard(k)).join('')}
      </div>
      <h2 style="font-size:var(--fs-xl);font-weight:700;margin:28px 0 12px;">🎓 高中</h2>
      <div class="grid-3" style="gap:14px;">
        ${['book_b1','book_b2','book_b3','book_xb1','book_xb2','book_xb3','book_xb4'].map(k => bookCard(k)).join('')}
      </div>
    </div>
  `;

  getMain().querySelectorAll('.grade-card').forEach(card => {
    card.addEventListener('click', () => router.navigate(`/reader/${card.dataset.book}`));
  });
}

function bookCard(key) {
  const info = BOOKS[key];
  return `
    <div class="grade-card" data-book="${key}">
      <div class="grade-icon">${info.icon}</div>
      <h3>${info.name}</h3>
      <div class="grade-subtitle">${info.sub}</div>
    </div>
  `;
}

// ========== Book reader page ==========
export async function showReaderBook(grade) {
  const info = BOOKS[grade] || { name: grade, icon:'📖', sub:'' };
  getMain().innerHTML = `<div class="page"><div class="page-header"><h1>${info.icon} ${info.name}</h1><p>加载中...</p></div></div>`;

  try {
    const data = await dataLoader.loadVocabulary(grade);
    const total = data.units.reduce((s, u) => s + u.words.length, 0);

    let html = `
      <div class="page">
        <div class="page-header">
          <button class="btn btn-secondary btn-sm mb-1" id="btn-back">← 返回目录</button>
          <h1>${info.icon} ${info.name}</h1>
          <p>${data.textbook || ''} · ${data.units.length} 个单元 · 共 ${total} 词</p>
        </div>
        <div class="reader-toolbar">
          <button class="btn btn-sm btn-secondary" id="btn-expand-all">📖 展开全部</button>
          <button class="btn btn-sm btn-secondary" id="btn-collapse-all">📕 折叠全部</button>
        </div>
        <div class="reader-units">
    `;

    for (const unit of data.units) {
      const words = unit.words;
      html += `
        <div class="reader-unit">
          <div class="reader-unit-header">
            <h2>${unit.unit > 0 ? 'Unit ' + unit.unit + ' — ' : unit.unit === 0 ? '' : ''}${unit.title}</h2>
            <span class="reader-unit-count">${words.length} 词</span>
          </div>
          <div class="reader-word-table-wrap">
            <table class="reader-word-table">
              <thead>
                <tr>
                  <th style="width:5%;">#</th>
                  <th style="width:25%;">单词</th>
                  <th style="width:22%;">音标</th>
                  <th style="width:15%;">词性</th>
                  <th style="width:33%;">释义</th>
                </tr>
              </thead>
              <tbody>
                ${words.map((w, i) => `
                  <tr class="reader-word-row" data-word="${w.en}">
                    <td class="reader-word-num">${i + 1}</td>
                    <td class="reader-word-en">${w.en}</td>
                    <td class="reader-word-phonetic">${w.phonetic || ''}</td>
                    <td class="reader-word-pos">${w.pos || ''}</td>
                    <td class="reader-word-zh">${w.zh || ''}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    html += `</div></div>`;
    getMain().innerHTML = html;

    // Back button
    getMain().querySelector('#btn-back').addEventListener('click', () => router.navigate('/reader'));

    // Expand/collapse all
    const unitHeaders = getMain().querySelectorAll('.reader-unit-header');
    const tables = getMain().querySelectorAll('.reader-word-table-wrap');

    function collapseAll() {
      tables.forEach(t => t.style.display = 'none');
    }
    function expandAll() {
      tables.forEach(t => t.style.display = '');
    }

    getMain().querySelector('#btn-expand-all').addEventListener('click', expandAll);
    getMain().querySelector('#btn-collapse-all').addEventListener('click', collapseAll);

    // Toggle individual unit
    unitHeaders.forEach((hdr, i) => {
      hdr.addEventListener('click', () => {
        tables[i].style.display = tables[i].style.display === 'none' ? '' : 'none';
      });
      hdr.style.cursor = 'pointer';
    });

    // Click word to speak
    getMain().querySelectorAll('.reader-word-row').forEach(row => {
      row.addEventListener('click', async () => {
        const word = row.dataset.word;
        try { await tts.speakWord(word); } catch {}
      });
    });

    // Scroll to top
    window.scrollTo(0, 0);

    // Keyboard: left=back, 1-9 jump to unit
    const handler = (e) => {
      if (e.key === 'Escape') router.navigate('/reader');
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9 && !e.ctrlKey && !e.metaKey && e.target === document.body) {
        const hdr = getMain().querySelectorAll('.reader-unit-header')[num - 1];
        if (hdr) hdr.scrollIntoView({ behavior: 'smooth' });
      }
    };
    document.addEventListener('keydown', handler);
    // Clean up when navigating away
    const cleanup = () => {
      document.removeEventListener('keydown', handler);
      window.removeEventListener('hashchange', cleanup);
    };
    window.addEventListener('hashchange', cleanup, { once: true });

  } catch (e) {
    getMain().innerHTML = `
      <div class="page"><div class="page-header">
        <button class="btn btn-secondary btn-sm mb-1" id="btn-back">← 返回</button>
        <h1>加载失败</h1><p>${e.message}</p>
      </div></div>
    `;
    getMain().querySelector('#btn-back')?.addEventListener('click', () => router.navigate('/reader'));
  }
}
