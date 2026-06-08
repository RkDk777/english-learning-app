import { router } from '../router.js';
import { getSupabase } from '../lib/supabase.js';
import { getProfile } from '../utils/auth.js';

function getMain() { return document.getElementById('main-content'); }

// ============ Friends Page ============
export async function showSocial() {
  const profile = getProfile();
  if (!profile) { router.navigate('/login'); return; }

  const supabase = await getSupabase();

  // Load friends + pending requests
  const [friendsRes, pendingRes] = await Promise.all([
    supabase.from('friendships').select('*, friend:friend_id(*)').eq('user_id', profile.id).eq('status', 'accepted'),
    supabase.from('friendships').select('*, user:user_id(*)').eq('friend_id', profile.id).eq('status', 'pending'),
  ]);

  const friends = (friendsRes.data || []).map(f => ({
    id: f.id, userId: f.friend_id, profile: f.friend,
  }));
  // Also get friends where I'm the friend (bidirectional)
  const friendsOf = (await supabase.from('friendships').select('*, user:user_id(*)').eq('friend_id', profile.id).eq('status', 'accepted')).data || [];
  friendsOf.forEach(f => {
    if (!friends.find(x => x.userId === f.user_id)) {
      friends.push({ id: f.id, userId: f.user_id, profile: f.user });
    }
  });

  const pending = (pendingRes.data || []).filter(r => r.user_id !== profile.id);

  // Get all friends' learning stats
  const learningRes = await supabase.from('learning_data').select('user_id, word_progress');
  const learningMap = {};
  (learningRes.data || []).forEach(d => {
    const words = Object.values(d.word_progress || {}).filter(p => p.status === 'mastered').length;
    learningMap[d.user_id] = words;
  });

  // Build friends list with stats
  const friendsWithStats = friends.map(f => ({
    ...f,
    masteredWords: learningMap[f.userId] || 0,
  })).sort((a, b) => b.masteredWords - a.masteredWords);

  getMain().innerHTML = `
    <div class="page">
      <div class="page-header">
        <h1>👥 好友</h1>
        <div class="flex gap-1" style="flex-wrap:wrap;">
          <input type="text" class="input" id="social-search" placeholder="搜索用户昵称...">
          <button class="btn btn-primary btn-sm" id="btn-search">🔍 搜索</button>
        </div>
      </div>

      <div class="flex gap-2 mb-3" style="flex-wrap:wrap;">
        <button class="btn btn-sm btn-secondary social-tab active" data-tab="friends">好友 (${friends.length})</button>
        <button class="btn btn-sm btn-secondary social-tab" data-tab="pending">好友申请 (${pending.length})</button>
        <button class="btn btn-sm btn-secondary social-tab" data-tab="leaderboard">🏆 排行榜</button>
      </div>

      <div id="social-content"></div>
    </div>
  `;

  const content = getMain().querySelector('#social-content');

  function showTab(tab) {
    getMain().querySelectorAll('.social-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    if (tab === 'friends') renderFriends();
    else if (tab === 'pending') renderPending();
    else if (tab === 'leaderboard') renderLeaderboard();
  }

  getMain().querySelectorAll('.social-tab').forEach(t => {
    t.addEventListener('click', () => showTab(t.dataset.tab));
  });

  getMain().querySelector('#btn-search').addEventListener('click', () => {
    const q = getMain().querySelector('#social-search').value.trim();
    if (q) searchUsers(q);
  });
  getMain().querySelector('#social-search').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const q = getMain().querySelector('#social-search').value.trim();
      if (q) searchUsers(q);
    }
  });

  function renderFriends() {
    if (friendsWithStats.length === 0) {
      content.innerHTML = '<p class="text-muted text-center mt-3">还没有好友，搜索昵称来添加吧！</p>';
      return;
    }
    content.innerHTML = `
      <div class="friend-list">
        ${friendsWithStats.map((f, i) => `
          <div class="friend-card">
            <span class="friend-rank">${i + 1}</span>
            <div class="friend-avatar" onclick="window.appRouter.navigate('/profile/${f.userId}')" style="cursor:pointer;">
              ${f.profile?.avatar_url ? `<img src="${f.profile.avatar_url}">` : `<span>${(f.profile?.nickname || '?')[0]?.toUpperCase()}</span>`}
            </div>
            <div class="friend-info">
              <div class="friend-name">${f.profile?.nickname || '用户'}</div>
              <div class="friend-stats">📚 已掌握 ${f.masteredWords} 词</div>
            </div>
            <div class="friend-actions">
              <button class="btn btn-primary btn-sm chat-btn" data-user="${f.userId}">💬 聊天</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    content.querySelectorAll('.chat-btn').forEach(btn => {
      btn.addEventListener('click', () => router.navigate(`/chat/${btn.dataset.user}`));
    });
  }

  function renderPending() {
    if (pending.length === 0) {
      content.innerHTML = '<p class="text-muted text-center mt-3">暂无好友申请</p>';
      return;
    }
    content.innerHTML = `
      <div class="friend-list">
        ${pending.map(r => `
          <div class="friend-card">
            <div class="friend-avatar">
              ${r.user?.avatar_url ? `<img src="${r.user.avatar_url}">` : `<span>${(r.user?.nickname || '?')[0]?.toUpperCase()}</span>`}
            </div>
            <div class="friend-info">
              <div class="friend-name">${r.user?.nickname || '用户'}</div>
              <div class="friend-stats">想加你为好友</div>
            </div>
            <div class="friend-actions">
              <button class="btn btn-success btn-sm accept-btn" data-id="${r.id}">✓ 接受</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    content.querySelectorAll('.accept-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        await supabase.from('friendships').update({ status: 'accepted' }).eq('id', btn.dataset.id);
        showSocial();
      });
    });
  }

  function renderLeaderboard() {
    const ranked = [...friendsWithStats].sort((a, b) => b.masteredWords - a.masteredWords);
    content.innerHTML = `
      <div class="leaderboard">
        <h3 style="text-align:center;margin-bottom:16px;">🏆 好友学习排行榜</h3>
        ${ranked.length === 0 ? '<p class="text-muted text-center">还没有好友</p>' : ''}
        ${ranked.map((f, i) => {
          const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`;
          return `
            <div class="leaderboard-row ${i < 3 ? 'top' : ''}">
              <span class="leaderboard-rank">${medal}</span>
              <div class="leaderboard-avatar">
                ${f.profile?.avatar_url ? `<img src="${f.profile.avatar_url}">` : `<span>${(f.profile?.nickname || '?')[0]?.toUpperCase()}</span>`}
              </div>
              <div class="leaderboard-name">${f.profile?.nickname || '用户'}</div>
              <div class="leaderboard-score">📚 ${f.masteredWords} 词</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  showTab('friends');
}

// ============ Search Users ============
async function searchUsers(query) {
  const profile = getProfile();
  if (!profile) return;

  const supabase = await getSupabase();
  const { data } = await supabase.from('profiles').select('*').ilike('nickname', `%${query}%`).limit(20);

  // Check existing friendship status
  const { data: existing } = await supabase.from('friendships').select('*').eq('user_id', profile.id);

  const content = document.getElementById('social-content');
  if (!content) return;

  const results = (data || []).filter(u => u.id !== profile.id);

  if (results.length === 0) {
    content.innerHTML = '<p class="text-muted text-center mt-3">未找到用户</p>';
    return;
  }

  const sentMap = {};
  (existing || []).forEach(f => { sentMap[f.friend_id] = f.status; });

  content.innerHTML = `
    <div class="friend-list">
      ${results.map(u => {
        const status = sentMap[u.id];
        let btn;
        if (status === 'accepted') btn = '<span class="tag success">已是好友</span>';
        else if (status === 'pending') btn = '<span class="tag warning">已发送申请</span>';
        else btn = `<button class="btn btn-primary btn-sm add-btn" data-user="${u.id}">+ 加好友</button>`;
        return `
          <div class="friend-card">
            <div class="friend-avatar" onclick="window.appRouter.navigate('/profile/${u.id}')" style="cursor:pointer;">
              ${u.avatar_url ? `<img src="${u.avatar_url}">` : `<span>${(u.nickname || '?')[0]?.toUpperCase()}</span>`}
            </div>
            <div class="friend-info">
              <div class="friend-name">${u.nickname || '用户'}</div>
            </div>
            <div class="friend-actions">${btn}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  content.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await supabase.from('friendships').insert({
        user_id: profile.id,
        friend_id: btn.dataset.user,
        status: 'pending',
      });
      btn.textContent = '已发送';
      btn.disabled = true;
      btn.classList.add('btn-secondary');
      btn.classList.remove('btn-primary');
    });
  });
}
