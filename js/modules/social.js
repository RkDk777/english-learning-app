import { router } from '../router.js';
import { getSupabase } from '../lib/supabase.js';
import { getProfile } from '../utils/auth.js';

function getMain() { return document.getElementById('main-content'); }

const PENDING_TIMEOUT_MS = 60000; // 1 minute

// ============ Friends Page ============
export async function showSocial() {
  const profile = getProfile();
  if (!profile) { router.navigate('/login'); return; }
  const supabase = await getSupabase();
  const me = profile.id;

  // ============ Data loading ============
  async function loadData() {
    const [mySent, myReceived, acceptedA, acceptedB] = await Promise.all([
      supabase.from('friendships').select('*').eq('user_id', me),
      supabase.from('friendships').select('*').eq('friend_id', me),
      supabase.from('friendships').select('id, friend_id, friend:friend_id(id, nickname, avatar_url)').eq('user_id', me).eq('status', 'accepted'),
      supabase.from('friendships').select('id, user_id, user:user_id(id, nickname, avatar_url)').eq('friend_id', me).eq('status', 'accepted'),
    ]);

    // Friends (bidirectional)
    const friendSet = new Map();
    (acceptedA.data || []).forEach(f => {
      if (f.friend_id !== me) friendSet.set(f.friend_id, { id: f.id, userId: f.friend_id, profile: f.friend });
    });
    (acceptedB.data || []).forEach(f => {
      if (f.user_id !== me && !friendSet.has(f.user_id)) {
        friendSet.set(f.user_id, { id: f.id, userId: f.user_id, profile: f.user });
      }
    });
    const friends = [...friendSet.values()];

    // Pending received (others want to add me)
    const now = Date.now();
    const pending = (myReceived.data || []).filter(r => {
      if (r.status !== 'pending') return false;
      if (r.user_id === me) return false;
      // Expire after 1 minute
      const age = now - (new Date(r.created_at).getTime() || now);
      if (age > PENDING_TIMEOUT_MS) return false;
      return true;
    });

    // All friendships I've sent (for status map)
    const allSent = mySent.data || [];
    const allReceived = myReceived.data || [];

    return { friends, pending, allSent, allReceived };
  }

  let data = await loadData();
  let friends = data.friends;
  let pending = data.pending;
  let allSent = data.allSent;
  let allReceived = data.allReceived;

  // ============ Status map ============
  function buildStatusMap() {
    const map = {};
    allSent.forEach(f => { map[f.friend_id] = f.status; });
    allReceived.forEach(f => { map[f.user_id] = f.status; });
    return map;
  }

  let statusMap = buildStatusMap();

  // ============ Learning data ============
  const learningRes = await supabase.from('learning_data').select('user_id, word_progress');
  const learningMap = {};
  (learningRes.data || []).forEach(d => {
    learningMap[d.user_id] = Object.values(d.word_progress || {}).filter(p => p.status === 'mastered').length;
  });

  // Friends with stats
  const friendsWithStats = friends.map(f => ({ ...f, masteredWords: learningMap[f.userId] || 0 }))
    .sort((a, b) => b.masteredWords - a.masteredWords);

  // ============ Leaderboard: all users ============
  const { data: allProfiles } = await supabase.from('profiles').select('*');
  const allUsers = (allProfiles || [])
    .map(p => ({ userId: p.id, profile: p, masteredWords: learningMap[p.id] || 0 }))
    .sort((a, b) => b.masteredWords - a.masteredWords);

  const topUser = allUsers.find(u => u.masteredWords >= 2000);
  const ranked = topUser ? allUsers.filter(u => u.userId !== topUser.userId) : allUsers;

  // ============ Render ============
  getMain().innerHTML = `
    <div class="page">
      <div class="page-header">
        <h1>👥 好友</h1>
        <div class="flex gap-1" style="flex-wrap:wrap;">
          <input type="text" class="input" id="social-search" placeholder="搜索用户昵称...">
          <button class="btn btn-primary btn-sm" id="btn-search">🔍 搜索</button>
          <button class="btn btn-secondary btn-sm" id="btn-refresh" title="刷新">🔄</button>
        </div>
      </div>
      <div class="flex gap-2 mb-3" style="flex-wrap:wrap;">
        <button class="btn btn-sm btn-secondary social-tab active" data-tab="friends">好友 (${friends.length})</button>
        <button class="btn btn-sm btn-secondary social-tab" data-tab="pending">好友申请 <span id="pending-count">${pending.length}</span></button>
        <button class="btn btn-sm btn-secondary social-tab" data-tab="leaderboard">🏆 排行榜</button>
      </div>
      <div id="social-content"></div>
    </div>
  `;

  const content = getMain().querySelector('#social-content');
  updatePendingBadge();

  function updatePendingBadge() {
    const badge = getMain().querySelector('#pending-count');
    if (!badge) return;
    badge.textContent = pending.length;
    if (pending.length > 0) {
      badge.style.cssText = 'background:var(--color-danger);color:#fff;padding:2px 7px;border-radius:10px;font-size:11px;margin-left:2px;';
    } else {
      badge.style.cssText = '';
    }
  }

  // ============ Tabs ============
  function showTab(tab) {
    window._socialActiveTab = tab;
    getMain().querySelectorAll('.social-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    if (tab === 'friends') renderFriends();
    else if (tab === 'pending') renderPending();
    else if (tab === 'leaderboard') renderLeaderboard();
  }

  getMain().querySelectorAll('.social-tab').forEach(t => {
    t.addEventListener('click', () => showTab(t.dataset.tab));
  });

  // ============ Search ============
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

  // ============ Refresh button ============
  getMain().querySelector('#btn-refresh').addEventListener('click', async () => {
    const btn = getMain().querySelector('#btn-refresh');
    btn.textContent = '⏳'; btn.disabled = true;
    data = await loadData();
    friends = data.friends; pending = data.pending;
    allSent = data.allSent; allReceived = data.allReceived;
    statusMap = buildStatusMap();
    updatePendingBadge();
    btn.textContent = '🔄'; btn.disabled = false;
    showTab(window._socialActiveTab || 'friends');
  });

  // ============ Polling ============
  let pollTimer = setInterval(async () => {
    const res = await supabase.from('friendships')
      .select('id, user_id, created_at, user:user_id(id, nickname, avatar_url)')
      .eq('friend_id', me).eq('status', 'pending');
    const now = Date.now();
    const fresh = (res.data || []).filter(r => {
      if (r.user_id === me) return false;
      const age = now - (new Date(r.created_at).getTime() || now);
      return age <= PENDING_TIMEOUT_MS;
    });
    if (fresh.length !== pending.length) {
      pending = fresh;
      allReceived = [...(allReceived.filter(r => r.status !== 'pending' || r.user_id === me)),
        ...(res.data || [])];
      statusMap = buildStatusMap();
      updatePendingBadge();
      if (window._socialActiveTab === 'pending') renderPending();
    }
  }, 3000);

  window.addEventListener('hashchange', () => { clearInterval(pollTimer); }, { once: true });

  // ============ Render functions ============

  function renderFriends() {
    if (friendsWithStats.length === 0) {
      content.innerHTML = '<p class="text-muted text-center mt-3">还没有好友，搜索昵称来添加吧！</p>';
      return;
    }
    content.innerHTML = `<div class="friend-list">${friendsWithStats.map((f, i) => `
      <div class="friend-card">
        <span class="friend-rank">${i + 1}</span>
        <div class="friend-avatar" style="cursor:pointer;" onclick="window.appRouter?.navigate('/profile/${f.userId}')">
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
    `).join('')}</div>`;
    content.querySelectorAll('.chat-btn').forEach(b => b.addEventListener('click', () => router.navigate(`/chat/${b.dataset.user}`)));
  }

  function renderPending() {
    if (pending.length === 0) {
      content.innerHTML = '<p class="text-muted text-center mt-3">暂无好友申请</p>';
      return;
    }
    content.innerHTML = `<div class="friend-list">${pending.map(r => `
      <div class="friend-card">
        <div class="friend-avatar">
          ${r.user?.avatar_url ? `<img src="${r.user.avatar_url}">` : `<span>${(r.user?.nickname || '?')[0]?.toUpperCase()}</span>`}
        </div>
        <div class="friend-info">
          <div class="friend-name">${r.user?.nickname || '用户'}</div>
          <div class="friend-stats">想加你为好友</div>
        </div>
        <div class="friend-actions flex gap-1">
          <button class="btn btn-success btn-sm accept-btn" data-id="${r.id}">✓ 接受</button>
          <button class="btn btn-danger btn-sm reject-btn" data-id="${r.id}">✗ 拒绝</button>
        </div>
      </div>
    `).join('')}</div>`;
    content.querySelectorAll('.accept-btn').forEach(b => b.addEventListener('click', async () => {
      await supabase.from('friendships').update({ status: 'accepted' }).eq('id', b.dataset.id);
      showSocial();
    }));
    content.querySelectorAll('.reject-btn').forEach(b => b.addEventListener('click', async () => {
      await supabase.from('friendships').delete().eq('id', b.dataset.id);
      showSocial();
    }));
  }

  function renderLeaderboard() {
    let html = '<div class="leaderboard"><h3 style="text-align:center;margin-bottom:16px;">🏆 学习总排行榜</h3>';

    // Rank 0
    if (topUser) {
      const stat = statusMap[topUser.userId];
      html += `
        <div class="leaderboard-row top rank-zero">
          <span class="leaderboard-rank rank-zero-badge">👑 0</span>
          <div class="leaderboard-avatar" style="cursor:pointer;" onclick="window.appRouter?.navigate('/profile/${topUser.userId}')">
            ${topUser.profile?.avatar_url ? `<img src="${topUser.profile.avatar_url}">` : `<span>${(topUser.profile?.nickname || '?')[0]?.toUpperCase()}</span>`}
          </div>
          <div class="leaderboard-name">${topUser.profile?.nickname || '英语学习助手'}</div>
          <div class="leaderboard-score">📚 ${topUser.masteredWords || 2368} 词</div>
          ${topUser.userId !== me ? `<div class="friend-actions">${friendBtn(topUser.userId, stat)}</div>` : ''}
        </div>
        <div class="leaderboard-divider"><span>— 排行榜 —</span></div>`;
    }

    if (ranked.length === 0) {
      html += '<p class="text-muted text-center">暂无其他用户</p>';
    } else {
      ranked.forEach((u, i) => {
        const pos = i + 1;
        const medal = pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : `${pos}`;
        const isMe = u.userId === me;
        const stat = statusMap[u.userId];
        html += `
          <div class="leaderboard-row ${pos <= 3 ? 'top' : ''} ${isMe ? 'is-me' : ''}">
            <span class="leaderboard-rank">${medal}</span>
            <div class="leaderboard-avatar" style="cursor:pointer;" onclick="window.appRouter?.navigate('/profile/${u.userId}')">
              ${u.profile?.avatar_url ? `<img src="${u.profile.avatar_url}">` : `<span>${(u.profile?.nickname || '?')[0]?.toUpperCase()}</span>`}
            </div>
            <div class="leaderboard-name">${u.profile?.nickname || '用户'}${isMe ? ' (你)' : ''}</div>
            <div class="leaderboard-score">📚 ${u.masteredWords} 词</div>
            ${!isMe ? `<div class="friend-actions">${friendBtn(u.userId, stat)}</div>` : ''}
          </div>`;
      });
    }
    html += '</div>';
    content.innerHTML = html;
    bindLeaderboardButtons();
  }

  function friendBtn(userId, stat) {
    if (stat === 'accepted') return '<span class="tag success" style="font-size:11px;">好友</span>';
    if (stat === 'pending') return '<span class="tag warning" style="font-size:11px;">已申请</span>';
    return `<button class="btn btn-primary btn-sm lb-add-btn" data-user="${userId}">+ 加好友</button>`;
  }

  function bindLeaderboardButtons() {
    content.querySelectorAll('.lb-add-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await sendFriendRequest(btn.dataset.user, btn);
      });
    });
  }

  // ============ Send friend request ============
  async function sendFriendRequest(targetId, btn) {
    // Delete any expired pending request first
    const existing = allSent.find(f => f.friend_id === targetId && f.status === 'pending');
    if (existing) {
      const age = Date.now() - (new Date(existing.created_at).getTime() || Date.now());
      if (age > PENDING_TIMEOUT_MS) {
        await supabase.from('friendships').delete().eq('id', existing.id);
      } else {
        // Still valid — show countdown
        startCountdown(btn, PENDING_TIMEOUT_MS - age);
        return;
      }
    }

    const { error } = await supabase.from('friendships').insert({
      user_id: me, friend_id: targetId, status: 'pending',
    });

    if (error) {
      if (error.code === '23505') {
        // Duplicate — delete old and retry
        await supabase.from('friendships').delete().eq('user_id', me).eq('friend_id', targetId).eq('status','pending');
        return sendFriendRequest(targetId, btn);
      }
      console.warn('Friend request failed:', error.message);
      return;
    }

    allSent = [...allSent, { user_id: me, friend_id: targetId, status: 'pending', created_at: new Date().toISOString() }];
    statusMap = buildStatusMap();
    startCountdown(btn, PENDING_TIMEOUT_MS);
  }

  function startCountdown(btn, remaining) {
    btn.disabled = true;
    btn.classList.add('btn-secondary');
    btn.classList.remove('btn-primary');
    const update = () => {
      const sec = Math.ceil(remaining / 1000);
      if (sec <= 0) {
        btn.textContent = '+ 加好友';
        btn.disabled = false;
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary');
        return;
      }
      btn.textContent = `已发送 ${sec}s`;
      remaining -= 1000;
      setTimeout(update, 1000);
    };
    update();
  }

  // ============ Search ============
  async function searchUsers(query) {
    const { data } = await supabase.from('profiles').select('*').ilike('nickname', `%${query}%`).limit(20);
    const results = (data || []).filter(u => u.id !== me);
    if (results.length === 0) { content.innerHTML = '<p class="text-muted text-center mt-3">未找到用户</p>'; return; }

    content.innerHTML = `<div class="friend-list">${results.map(u => {
      const stat = statusMap[u.id];
      return `
        <div class="friend-card">
          <div class="friend-avatar" style="cursor:pointer;" onclick="window.appRouter?.navigate('/profile/${u.id}')">
            ${u.avatar_url ? `<img src="${u.avatar_url}">` : `<span>${(u.nickname || '?')[0]?.toUpperCase()}</span>`}
          </div>
          <div class="friend-info"><div class="friend-name">${u.nickname || '用户'}</div></div>
          <div class="friend-actions">${friendBtn(u.id, stat)}</div>
        </div>`;
    }).join('')}</div>`;
    bindLeaderboardButtons();
  }

  showTab('friends');
}
