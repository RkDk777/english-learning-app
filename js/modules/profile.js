import { router } from '../router.js';
import { getSupabase } from '../lib/supabase.js';
import { getProfile } from '../utils/auth.js';

function getMain() { return document.getElementById('main-content'); }

export async function showProfile(userId) {
  const myProfile = getProfile();
  const supabase = await getSupabase();

  // Load user info
  const { data: user } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (!user) { router.navigate('/social'); return; }

  // Load learning stats
  const { data: learning } = await supabase.from('learning_data').select('word_progress').eq('user_id', userId).single();
  const wordProgress = learning?.word_progress || {};
  const mastered = Object.values(wordProgress).filter(p => p.status === 'mastered').length;
  const total = Object.keys(wordProgress).length;

  // Load wall posts
  const { data: posts } = await supabase
    .from('wall_posts')
    .select('*, author:author_id(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30);

  // Check friendship status
  const isMe = myProfile?.id === userId;
  let friendshipStatus = 'none';
  if (!isMe && myProfile) {
    const { data: fs } = await supabase
      .from('friendships')
      .select('*')
      .or(`user_id.eq.${myProfile.id},friend_id.eq.${myProfile.id}`)
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

    const rel = (fs || []).find(f =>
      (f.user_id === myProfile.id && f.friend_id === userId) ||
      (f.user_id === userId && f.friend_id === myProfile.id)
    );
    if (rel) friendshipStatus = rel.status;
  }

  getMain().innerHTML = `
    <div class="page" style="max-width:560px;margin:0 auto;">
      <div class="page-header">
        <button class="btn btn-secondary btn-sm mb-1" id="btn-back">← 返回</button>
      </div>

      <div class="profile-card">
        <div class="profile-avatar">
          ${user.avatar_url ? `<img src="${user.avatar_url}">` : `<span>${(user.nickname || '?')[0]?.toUpperCase()}</span>`}
        </div>
        <h2>${user.nickname || '用户'}</h2>
        <div class="profile-stats">
          <div><strong>${mastered}</strong> 已掌握</div>
          <div><strong>${total}</strong> 总学习</div>
        </div>
        ${!isMe && myProfile ? `
          <div class="mt-1">
            ${friendshipStatus === 'accepted' ? '<span class="tag success">已是好友</span>' :
              friendshipStatus === 'pending' ? '<span class="tag warning">好友申请中</span>' :
              `<button class="btn btn-primary btn-sm" id="btn-add-friend">+ 加好友</button>`}
          </div>
        ` : ''}
      </div>

      ${friendshipStatus === 'accepted' || isMe ? `
      <div class="card mt-2">
        <div class="card-body">
          <h4>💬 留言板</h4>
          <div class="wall-form">
            <textarea class="input" id="wall-input" rows="2" placeholder="留个言..."></textarea>
            <button class="btn btn-primary btn-sm mt-1" id="btn-wall-post">留言</button>
          </div>
          <div class="wall-posts mt-2">
            ${(posts || []).map(p => `
              <div class="wall-post">
                <div class="wall-post-author">${p.author?.nickname || '用户'}</div>
                <div class="wall-post-content">${escapeHtml(p.content)}</div>
                <div class="wall-post-time">${new Date(p.created_at).toLocaleDateString('zh-CN')}</div>
              </div>
            `).join('')}
            ${(posts || []).length === 0 ? '<p class="text-muted text-center">暂无留言</p>' : ''}
          </div>
        </div>
      </div>
      ` : ''}
    </div>
  `;

  // Back
  getMain().querySelector('#btn-back').addEventListener('click', () => router.navigate('/social'));

  // Add friend
  getMain().querySelector('#btn-add-friend')?.addEventListener('click', async () => {
    await supabase.from('friendships').insert({
      user_id: myProfile.id,
      friend_id: userId,
      status: 'pending',
    });
    showProfile(userId);
  });

  // Wall post
  getMain().querySelector('#btn-wall-post')?.addEventListener('click', async () => {
    const input = getMain().querySelector('#wall-input');
    const content = input.value.trim();
    if (!content) return;
    await supabase.from('wall_posts').insert({
      user_id: userId,
      author_id: myProfile.id,
      content,
    });
    input.value = '';
    showProfile(userId);
  });
}

function escapeHtml(text) {
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}
