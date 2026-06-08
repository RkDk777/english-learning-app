import { router } from '../router.js';
import { getSupabase } from '../lib/supabase.js';
import { getProfile, isAdmin } from '../utils/auth.js';

function getMain() { return document.getElementById('main-content'); }

export async function showFeedback() {
  const prof = getProfile();
  if (!prof) { router.navigate('/login'); return; }
  const supabase = await getSupabase();
  const admin = isAdmin();

  // Load all feedback (admin) or just the user's (regular user)
  let { data: all } = await supabase.from('feedback').select('*, author:author_id(nickname, avatar_url)').order('created_at', { ascending: false });
  if (!admin) {
    all = (all || []).filter(f => f.author_id === prof.id);
  }

  render();

  function render() {
    getMain().innerHTML = `
      <div class="page" style="max-width:600px;margin:0 auto;">
        <div class="page-header"><h1>🐛 反馈</h1><p>${admin ? '查看所有用户反馈' : '提交问题或建议'}</p></div>
        <div class="card mb-3"><div class="card-body">
          <textarea class="input" id="fb-input" rows="4" placeholder="描述你遇到的问题或建议..."></textarea>
          <button class="btn btn-primary btn-sm mt-2" id="btn-fb">提交反馈</button>
          <p id="fb-msg" style="font-size:12px;margin-top:8px;"></p>
        </div></div>
        <div id="fb-list">${renderList(all)}</div>
      </div>`;

    getMain().querySelector('#btn-fb').addEventListener('click', async () => {
      const txt = getMain().querySelector('#fb-input').value.trim();
      if (!txt) return;
      const { error } = await supabase.from('feedback').insert({ author_id: prof.id, content: txt });
      if (error) {
        getMain().querySelector('#fb-msg').innerHTML = '<span style="color:var(--color-danger);">提交失败</span>';
        return;
      }
      getMain().querySelector('#fb-input').value = '';
      getMain().querySelector('#fb-msg').innerHTML = '<span style="color:var(--color-success);">✓ 已提交</span>';
      // Reload
      const { data: fresh } = await supabase.from('feedback').select('*, author:author_id(nickname, avatar_url)').order('created_at', { ascending: false });
      all = admin ? fresh : (fresh||[]).filter(f => f.author_id === prof.id);
      getMain().querySelector('#fb-list').innerHTML = renderList(all);
    });
  }
}

function renderList(items) {
  if (!items || items.length === 0) return '<p class="text-muted text-center mt-3">暂无反馈</p>';
  return items.map(f => `
    <div class="card mb-2"><div class="card-body" style="padding:12px 16px;">
      <div class="flex items-center gap-2 mb-1">
        <div class="friend-avatar" style="width:28px;height:28px;font-size:12px;">
          ${f.author?.avatar_url ? `<img src="${f.author.avatar_url}">` : `<span>${(f.author?.nickname||'?')[0]?.toUpperCase()}</span>`}
        </div>
        <strong style="font-size:14px;">${f.author?.nickname||'用户'}</strong>
        <span class="text-muted" style="font-size:11px;margin-left:auto;">${new Date(f.created_at).toLocaleString('zh-CN')}</span>
      </div>
      <div style="font-size:14px;color:var(--color-text);line-height:1.6;">${esc(f.content)}</div>
    </div></div>
  `).join('');
}

function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
