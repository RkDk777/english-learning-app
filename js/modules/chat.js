import { router } from '../router.js';
import { getSupabase } from '../lib/supabase.js';
import { getProfile } from '../utils/auth.js';

function getMain() { return document.getElementById('main-content'); }

let _channel = null;

// ============ Chat Page ============
export async function showChat(friendId) {
  const profile = getProfile();
  if (!profile) { router.navigate('/login'); return; }

  const supabase = await getSupabase();

  // Load friend info
  const { data: friendProfile } = await supabase.from('profiles').select('*').eq('id', friendId).single();

  // Load existing messages
  const { data: messages } = await supabase
    .from('chat_messages')
    .select('*')
    .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
    .or(`sender_id.eq.${friendId},receiver_id.eq.${friendId}`)
    .order('created_at', { ascending: true });

  // Filter: only messages between these two users
  const conv = (messages || []).filter(m =>
    (m.sender_id === profile.id && m.receiver_id === friendId) ||
    (m.sender_id === friendId && m.receiver_id === profile.id)
  );

  getMain().innerHTML = `
    <div class="page chat-page">
      <div class="chat-header">
        <button class="btn btn-secondary btn-sm" id="btn-back">← 返回</button>
        <div class="chat-friend-info">
          <div class="chat-friend-avatar">
            ${friendProfile?.avatar_url ? `<img src="${friendProfile.avatar_url}">` : `<span>${(friendProfile?.nickname || '?')[0]?.toUpperCase()}</span>`}
          </div>
          <div>
            <div class="chat-friend-name">${friendProfile?.nickname || '用户'}</div>
            <div style="font-size:11px;color:var(--color-text-muted);">在线</div>
          </div>
        </div>
      </div>
      <div class="chat-messages" id="chat-messages">
        ${conv.map(m => renderMessage(m, profile.id)).join('')}
      </div>
      <div class="chat-input-bar">
        <input type="text" class="input" id="chat-input" placeholder="输入消息..." autocomplete="off">
        <button class="btn btn-primary" id="btn-send">发送</button>
      </div>
    </div>
  `;

  // Back
  getMain().querySelector('#btn-back').addEventListener('click', () => router.navigate('/social'));

  // Scroll to bottom
  const msgContainer = getMain().querySelector('#chat-messages');
  msgContainer.scrollTop = msgContainer.scrollHeight;

  // Subscribe to realtime
  if (_channel) _channel.unsubscribe();
  _channel = supabase
    .channel('chat-room')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'chat_messages',
    }, (payload) => {
      const m = payload.new;
      if ((m.sender_id === profile.id && m.receiver_id === friendId) ||
          (m.sender_id === friendId && m.receiver_id === profile.id)) {
        msgContainer.insertAdjacentHTML('beforeend', renderMessage(m, profile.id));
        msgContainer.scrollTop = msgContainer.scrollHeight;
      }
    })
    .subscribe();

  // Send
  async function sendMessage() {
    const input = getMain().querySelector('#chat-input');
    const content = input.value.trim();
    if (!content) return;
    input.value = '';
    await supabase.from('chat_messages').insert({
      sender_id: profile.id,
      receiver_id: friendId,
      content,
    });
  }

  getMain().querySelector('#btn-send').addEventListener('click', sendMessage);
  getMain().querySelector('#chat-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') sendMessage();
  });
}

function renderMessage(m, myId) {
  const isMe = m.sender_id === myId;
  const time = new Date(m.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  return `
    <div class="chat-msg ${isMe ? 'chat-msg-me' : 'chat-msg-them'}">
      <div class="chat-msg-bubble">${escapeHtml(m.content)}</div>
      <div class="chat-msg-time">${time}</div>
    </div>
  `;
}

function escapeHtml(text) {
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}
