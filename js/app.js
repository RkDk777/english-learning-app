/**
 * 英语练习 - 应用入口
 */
import { router } from './router.js';
import { storage } from './utils/storage.js';

import { showVocabularyHome, showVocabularyGrade } from './modules/vocabulary.js';
import { showGrammarHome } from './modules/grammar.js';
import { showReadingHome } from './modules/reading.js';
import { showListeningHome } from './modules/listening.js';
import { showExamHome } from './modules/exam.js';
import { showStats } from './modules/stats.js';
import { showReaderHome, showReaderBook } from './modules/reader.js';
import { showLogin, showAccountSettings, initSidebarUser } from './modules/account.js';
import { initAuth, getProfile } from './utils/auth.js';
import { pullAll } from './utils/sync.js';
import { showSocial } from './modules/social.js';
import { showChat } from './modules/chat.js';
import { showProfile } from './modules/profile.js';
import { showAdminPanel } from './modules/admin.js';
import { showLeaderboard } from './modules/leaderboard.js';
import { showFeedback } from './modules/feedback.js';
import { isAdmin } from './utils/auth.js';

// ========== Home Page ==========
async function showHome() {
  const main = document.getElementById('main-content');
  if (!main) return;

  // Load announcement
  let announcement = null;
  try {
    const { getSupabase } = await import('./lib/supabase.js');
    const supabase = await getSupabase();
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(1);
    if (data && data.length > 0) announcement = data[0];
  } catch {}

  const wordProgress = storage.getWordProgress();
  const masteredWords = Object.values(wordProgress).filter(p => p.status === 'mastered').length;
  const learningWords = Object.values(wordProgress).filter(p => p.status === 'learning').length;
  const streak = storage.getStreak();
  const examHistory = storage.getExamHistory();
  const lastExam = examHistory[examHistory.length - 1];

  main.innerHTML = `
    <div class="page">
      ${announcement ? `<div class="announcement-bar"><strong>📢 公告：</strong>${escHtml(announcement.content)}</div>` : ''}
      <div class="home-hero">
        <h1>📚 英语练习</h1>
      </div>

      <div class="home-quick-stats">
        <div class="quick-stat">
          <div class="qs-icon words">📚</div>
          <div><div class="qs-value">${masteredWords}</div><div class="qs-label">已掌握单词</div></div>
        </div>
        <div class="quick-stat">
          <div class="qs-icon grammar">📝</div>
          <div><div class="qs-value">${learningWords}</div><div class="qs-label">学习中单词</div></div>
        </div>
        <div class="quick-stat">
          <div class="qs-icon reading">📖</div>
          <div><div class="qs-value">${streak}</div><div class="qs-label">连续学习天数</div></div>
        </div>
        <div class="quick-stat">
          <div class="qs-icon streak">🔥</div>
          <div><div class="qs-value">${lastExam ? lastExam.score + '分' : '--'}</div><div class="qs-label">最近考试成绩</div></div>
        </div>
      </div>

      <div class="grid-3">
        ${[
          { nav:'/vocabulary', icon:'📚', title:'单词学习', sub:'按年级分组，闪卡+测验' },
          { nav:'/grammar', icon:'📝', title:'语法学习', sub:'系统讲解+配套练习' },
          { nav:'/reading', icon:'📖', title:'阅读理解', sub:'分级阅读+理解题' },
          { nav:'/listening', icon:'🎧', title:'听力练习', sub:'听写+听音选义' },
          { nav:'/exam', icon:'📝', title:'模拟考试', sub:'综合测试，计时答题' },
          { nav:'/stats', icon:'📊', title:'学习统计', sub:'进度追踪+错题本' },
        ].map(c => `
          <div class="grade-card" data-nav="${c.nav}">
            <div class="grade-icon">${c.icon}</div>
            <h3>${c.title}</h3>
            <div class="grade-subtitle">${c.sub}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  main.querySelectorAll('.grade-card').forEach(card => {
    card.addEventListener('click', () => router.navigate(card.dataset.nav));
  });
}

// ========== Theme ==========
function initTheme() {
  const settings = storage.getSettings();
  document.documentElement.setAttribute('data-theme', settings.theme || 'light');
  const icon = document.querySelector('#theme-toggle .nav-icon');
  if (icon) icon.textContent = settings.theme === 'dark' ? '☀️' : '🌙';

  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') || 'light';
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    const ic = document.querySelector('#theme-toggle .nav-icon');
    if (ic) ic.textContent = next === 'dark' ? '☀️' : '🌙';
    storage.saveSettings({ theme: next });
  });
}

// ========== Sidebar ==========
function initSidebar() {
  const navItems = document.querySelectorAll('.nav-item[data-route]');
  const sidebar = document.querySelector('.sidebar');

  function updateActive(path) {
    navItems.forEach(item => {
      const r = item.dataset.route;
      item.classList.toggle('active', path === r || (r !== '/' && path.startsWith(r)));
    });
  }

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      router.navigate(item.dataset.route);
      if (window.innerWidth <= 768) sidebar?.classList.remove('open');
    });
  });

  window.addEventListener('hashchange', () => {
    updateActive(window.location.hash.slice(1) || '/');
  });

  updateActive(window.location.hash.slice(1) || '/');

  const mobileBtn = document.getElementById('mobile-menu-btn');
  if (mobileBtn && sidebar) {
    mobileBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
    document.getElementById('main-content')?.addEventListener('click', () => {
      if (window.innerWidth <= 768) sidebar.classList.remove('open');
    });
  }
}

// ========== Routes ==========
function setupRoutes() {
  router
    .on('/', showHome)
    .on('/vocabulary', showVocabularyHome)
    .on('/vocabulary/:grade', (ctx) => showVocabularyGrade(ctx.params.grade))
    .on('/grammar', showGrammarHome)
    .on('/reading', showReadingHome)
    .on('/listening', showListeningHome)
    .on('/exam', showExamHome)
    .on('/stats', showStats)
    .on('/reader', showReaderHome)
    .on('/reader/:grade', (ctx) => showReaderBook(ctx.params.grade))
    .on('/login', () => showLogin('login'))
    .on('/account', showAccountSettings)
    .on('/social', showSocial)
    .on('/chat/:userId', (ctx) => showChat(ctx.params.userId))
    .on('/profile/:userId', (ctx) => showProfile(ctx.params.userId))
    .on('/admin', showAdminPanel)
    .on('/leaderboard', showLeaderboard)
    .on('/feedback', showFeedback);
}

// ========== Init ==========
async function init() {
  try { setupRoutes(); } catch(e) { console.error('Routes error:', e); return; }
  try { initTheme(); } catch(e) { console.error('Theme error:', e); }
  try { initSidebar(); } catch(e) { console.error('Sidebar error:', e); }
  try { initSidebarUser(); } catch(e) { console.error('User widget error:', e); }
  try { await initAuth(); } catch(e) { console.error('Auth init error:', e); }
  // Pull cloud data if logged in
  if (getProfile()) {
    try { await pullAll(); } catch(e) { console.error('Sync pull error:', e); }
  }
  // Auth guard: redirect to login for all routes except /login
  router.setAuthGuard(() => !!getProfile());
  try { router.start(); } catch(e) { console.error('Router start error:', e); }
  window.appRouter = router;
  console.log('✅ App initialized');
}

function escHtml(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

// Start when DOM is ready (init is async)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => init());
} else {
  init();
}
