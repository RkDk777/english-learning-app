import { router } from '../router.js';

const BASE = location.hostname.endsWith('.github.io')
  ? 'https://cdn.jsdelivr.net/gh/RkDk777/english-learning-app@master/data/reader-pages'
  : './data/reader-pages';

function getMain() { return document.getElementById('main-content'); }

let currentManifest = null;
let currentBook = null;
let currentPageIdx = 0;
let currentPages = [];  // flat list of {file, title}

// ========== Home: pick a book ==========
export async function showReaderHome() {
  const manifest = await loadManifest();

  getMain().innerHTML = `
    <div class="page">
      <div class="page-header">
        <h1>📖 教材词汇表（原版）</h1>
        <p>浏览和下载教材生词表原文图片</p>
      </div>
      <h2 style="font-size:var(--fs-xl);font-weight:700;margin:24px 0 12px;">🏫 初中</h2>
      <div class="grid-3" style="gap:14px;">
        ${['grade7','grade8','grade9'].map(k => bookCard(manifest[k])).join('')}
      </div>
      <h2 style="font-size:var(--fs-xl);font-weight:700;margin:28px 0 12px;">🎓 高中</h2>
      <div class="grid-3" style="gap:14px;">
        ${['book_b1','book_b2','book_b3','book_xb1','book_xb2','book_xb3','book_xb4'].map(k => bookCard(manifest[k])).join('')}
      </div>
      <h2 style="font-size:var(--fs-xl);font-weight:700;margin:28px 0 12px;">📕 词汇手册</h2>
      <div class="grid-3" style="gap:14px;">
        ${['vocab_3500'].map(k => bookCard(manifest[k])).join('')}
      </div>
    </div>
  `;

  getMain().querySelectorAll('.grade-card').forEach(card => {
    card.addEventListener('click', () => router.navigate(`/reader/${card.dataset.book}`));
  });
}

function bookCard(info) {
  if (!info) return '';
  const total = info.parts.reduce((s, p) => s + p.total, 0);
  return `
    <div class="grade-card" data-book="${info.id}">
      <div class="grade-icon">📖</div>
      <h3>${info.name}</h3>
      <div class="grade-subtitle">${total} 页</div>
    </div>
  `;
}

// ========== Book gallery page ==========
export async function showReaderBook(bookId) {
  const manifest = await loadManifest();
  const book = manifest[bookId];
  if (!book) { router.navigate('/reader'); return; }

  currentBook = book;
  currentManifest = manifest;

  // Build flat page list
  currentPages = [];
  for (const part of book.parts) {
    const label = part.part ? ` (${part.part === 'part1' ? '上册' : '下册'})` : '';
    for (const pg of part.pages) {
      currentPages.push({ file: pg.file, title: book.name + label });
    }
  }

  currentPageIdx = 0;
  renderGallery();
}

function renderGallery() {
  const book = currentBook;
  const pages = currentPages;
  const idx = currentPageIdx;
  const pg = pages[idx];

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const bgColor = isDark ? '#1a1a2e' : '#f0f0f0';

  getMain().innerHTML = `
    <div class="page">
      <div class="page-header" style="margin-bottom:12px;">
        <button class="btn btn-secondary btn-sm mb-1" id="btn-back">← 返回目录</button>
        <h1>📖 ${book.name}</h1>
        <p>第 ${idx + 1} / ${pages.length} 页 · 点击图片可放大/下载</p>
      </div>

      <div class="gallery-toolbar">
        <button class="btn btn-sm btn-secondary" id="btn-prev" ${idx === 0 ? 'disabled' : ''}>◀ 上一页</button>
        <span class="gallery-page-info">${idx + 1} / ${pages.length}</span>
        <button class="btn btn-sm btn-secondary" id="btn-next" ${idx >= pages.length - 1 ? 'disabled' : ''}>下一页 ▶</button>
        <a class="btn btn-sm btn-primary" href="${BASE}/${book.id}/${pg.file}" download id="btn-download">⬇ 下载当前页</a>
      </div>

      <div class="gallery-image-wrap" style="background:${bgColor};">
        <img
          src="${BASE}/${book.id}/${pg.file}"
          alt="${pg.title} — 第${idx + 1}页"
          class="gallery-image"
          id="gallery-img"
          loading="lazy"
        >
        <div class="gallery-image-caption">${pg.title} — 第 ${idx + 1} 页</div>
      </div>

      <div class="gallery-pager mt-2 flex justify-center gap-1" style="flex-wrap:wrap;">
        ${pages.map((p, i) => {
          const cls = i === idx ? 'gallery-dot active' : 'gallery-dot';
          return `<button class="${cls}" data-idx="${i}" title="第${i+1}页">${i+1}</button>`;
        }).join('')}
      </div>
    </div>
  `;

  // Bind events
  getMain().querySelector('#btn-back').addEventListener('click', () => router.navigate('/reader'));
  getMain().querySelector('#btn-prev').addEventListener('click', () => { currentPageIdx--; renderGallery(); window.scrollTo(0, 0); });
  getMain().querySelector('#btn-next').addEventListener('click', () => { currentPageIdx++; renderGallery(); window.scrollTo(0, 0); });
  getMain().querySelectorAll('.gallery-dot').forEach(btn => {
    btn.addEventListener('click', () => { currentPageIdx = parseInt(btn.dataset.idx); renderGallery(); window.scrollTo(0, 0); });
  });

  // Click image to open full-size in new tab (for zooming)
  getMain().querySelector('#gallery-img').addEventListener('click', () => {
    window.open(`${BASE}/${book.id}/${pg.file}`, '_blank');
  });

  // Click image caption = same as download
  getMain().querySelector('.gallery-image-caption').addEventListener('click', () => {
    window.open(`${BASE}/${book.id}/${pg.file}`, '_blank');
  });

  // Keyboard navigation
  const handler = (e) => {
    if (e.key === 'ArrowLeft') { if (currentPageIdx > 0) { currentPageIdx--; renderGallery(); window.scrollTo(0, 0); } }
    if (e.key === 'ArrowRight') { if (currentPageIdx < currentPages.length - 1) { currentPageIdx++; renderGallery(); window.scrollTo(0, 0); } }
    if (e.key === 'Escape') router.navigate('/reader');
    const num = parseInt(e.key);
    if (num >= 1 && num <= 9 && !e.ctrlKey && !e.metaKey && e.target === document.body) {
      currentPageIdx = num - 1;
      renderGallery();
      window.scrollTo(0, 0);
    }
  };
  document.addEventListener('keydown', handler);
  const cleanup = () => { document.removeEventListener('keydown', handler); window.removeEventListener('hashchange', cleanup); };
  window.addEventListener('hashchange', cleanup, { once: true });
}

// ========== Manifest loader ==========
async function loadManifest() {
  if (currentManifest) return currentManifest;
  const resp = await fetch(`${BASE}/manifest.json`);
  if (!resp.ok) throw new Error('Failed to load manifest');
  currentManifest = await resp.json();
  return currentManifest;
}
