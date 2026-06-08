import { router } from '../router.js';
import { signUp, signIn, signOut, updateNickname, uploadAvatar, updatePassword, getProfile, onAuthChange, initAuth } from '../utils/auth.js';
import { pullAll } from '../utils/sync.js';
import { isConfigured } from '../lib/supabase.js';

function getMain() { return document.getElementById('main-content'); }

// ============ Login Page ============
export function showLogin(mode = 'login') {
  getMain().innerHTML = `
    <div class="page" style="max-width:420px;margin:0 auto;">
      <div class="auth-card">
        <div class="auth-logo">📚</div>
        <h1>英语学习助手</h1>
        <p class="text-secondary" style="text-align:center;margin-bottom:24px;">登录以同步学习数据</p>

        <div id="auth-tabs" style="display:flex;margin-bottom:20px;border-bottom:2px solid var(--color-border);">
          <button class="auth-tab ${mode === 'login' ? 'active' : ''}" data-tab="login">登录</button>
          <button class="auth-tab ${mode === 'signup' ? 'active' : ''}" data-tab="signup">注册</button>
        </div>

        <form id="auth-form" style="display:${mode === 'login' ? 'block' : 'none'};">
          <div class="form-group">
            <label>邮箱</label>
            <input type="email" class="input" id="login-email" placeholder="you@example.com" required>
          </div>
          <div class="form-group">
            <label>密码</label>
            <input type="password" class="input" id="login-password" placeholder="至少6位" required minlength="6">
          </div>
          <p id="login-error" style="color:var(--color-danger);font-size:var(--fs-sm);min-height:20px;"></p>
          <button type="submit" class="btn btn-primary" style="width:100%;" id="btn-login">登 录</button>
        </form>

        <form id="signup-form" style="display:${mode === 'signup' ? 'block' : 'none'};">
          <div class="form-group">
            <label>昵称</label>
            <input type="text" class="input" id="signup-name" placeholder="你的名字" required>
          </div>
          <div class="form-group">
            <label>邮箱</label>
            <input type="email" class="input" id="signup-email" placeholder="you@example.com" required>
          </div>
          <div class="form-group">
            <label>密码</label>
            <input type="password" class="input" id="signup-password" placeholder="至少6位" required minlength="6">
          </div>
          <p id="signup-error" style="color:var(--color-danger);font-size:var(--fs-sm);min-height:20px;"></p>
          <button type="submit" class="btn btn-primary" style="width:100%;" id="btn-signup">注 册</button>
        </form>
      </div>
    </div>
  `;

  // Tab switching
  getMain().querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      showLogin(tab.dataset.tab);
    });
  });

  // Login form
  getMain().querySelector('#auth-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = getMain().querySelector('#login-email').value.trim();
    const pwd = getMain().querySelector('#login-password').value;
    const errEl = getMain().querySelector('#login-error');
    errEl.textContent = '';

    try {
      await signIn(email, pwd);
      await pullAll();
      router.navigate('/');
    } catch (err) {
      errEl.textContent = err.message || '登录失败';
    }
  });

  // Signup form
  getMain().querySelector('#signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = getMain().querySelector('#signup-name').value.trim();
    const email = getMain().querySelector('#signup-email').value.trim();
    const pwd = getMain().querySelector('#signup-password').value;
    const errEl = getMain().querySelector('#signup-error');
    errEl.textContent = '';

    try {
      await signUp(email, pwd, name);
      // Email confirmation disabled — auto login
      await pullAll();
      router.navigate('/');
    } catch (err) {
      errEl.style.color = 'var(--color-danger)';
      errEl.textContent = err.message || '注册失败';
    }
  });
}

// ============ Profile / Settings Page ============
export function showAccountSettings() {
  const profile = getProfile();

  getMain().innerHTML = `
    <div class="page" style="max-width:480px;margin:0 auto;">
      <div class="page-header">
        <button class="btn btn-secondary btn-sm mb-1" id="btn-back">← 返回</button>
        <h1>⚙️ 账号设置</h1>
      </div>

      <div class="card">
        <div class="card-body" style="text-align:center;">
          <div class="avatar-upload" id="avatar-area">
            ${profile?.avatar_url
              ? `<img src="${profile.avatar_url}" alt="头像" class="avatar-img">`
              : `<div class="avatar-placeholder">${(profile?.nickname || '?')[0].toUpperCase()}</div>`
            }
            <div class="avatar-overlay">📷</div>
          </div>
          <input type="file" id="avatar-file" accept="image/*" style="display:none;">
          <p style="margin-top:8px;color:var(--color-text-muted);font-size:var(--fs-xs);">点击更换头像</p>
        </div>
      </div>

      <div class="card mt-2">
        <div class="card-body">
          <div class="form-group">
            <label>邮箱</label>
            <input type="email" class="input" value="${profile?.email || ''}" disabled
              style="opacity:0.6;background:var(--bg-hover);">
          </div>
          <div class="form-group">
            <label>昵称</label>
            <input type="text" class="input" id="nickname-input" value="${profile?.nickname || ''}">
          </div>
          <button class="btn btn-primary btn-sm" id="btn-save-nickname">保存昵称</button>
        </div>
      </div>

      <div class="card mt-2">
        <div class="card-body">
          <h4>修改密码</h4>
          <div class="form-group">
            <input type="password" class="input" id="new-password" placeholder="新密码（至少6位）" minlength="6">
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-change-pwd">修改密码</button>
          <p id="pwd-msg" style="font-size:var(--fs-sm);margin-top:8px;"></p>
        </div>
      </div>

      <div class="card mt-2">
        <div class="card-body" style="text-align:center;">
          <button class="btn btn-danger" id="btn-logout" style="width:100%;">退出登录</button>
        </div>
      </div>
    </div>
  `;

  // Back
  getMain().querySelector('#btn-back').addEventListener('click', () => router.navigate('/'));

  // Avatar
  getMain().querySelector('#avatar-area').addEventListener('click', () => {
    getMain().querySelector('#avatar-file').click();
  });
  getMain().querySelector('#avatar-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await uploadAvatar(file);
      showAccountSettings(); // refresh
    } catch (err) {
      alert('头像上传失败: ' + err.message);
    }
  });

  // Nickname
  getMain().querySelector('#btn-save-nickname').addEventListener('click', async () => {
    const name = getMain().querySelector('#nickname-input').value.trim();
    if (!name) return;
    try {
      await updateNickname(name);
      updateSidebarUser();
      alert('昵称已保存');
    } catch (err) {
      alert('保存失败: ' + err.message);
    }
  });

  // Password
  getMain().querySelector('#btn-change-pwd').addEventListener('click', async () => {
    const pwd = getMain().querySelector('#new-password').value;
    if (pwd.length < 6) return;
    try {
      await updatePassword(pwd);
      getMain().querySelector('#pwd-msg').innerHTML =
        '<span style="color:var(--color-success);">密码修改成功</span>';
    } catch (err) {
      getMain().querySelector('#pwd-msg').textContent = '修改失败: ' + err.message;
    }
  });

  // Logout
  getMain().querySelector('#btn-logout').addEventListener('click', async () => {
    if (confirm('确定退出登录吗？本地数据不会被删除。')) {
      await signOut();
      router.navigate('/');
    }
  });
}

// ============ Sidebar User Widget ============
export function initSidebarUser() {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  // Create user widget area — insert before footer
  const widget = document.createElement('div');
  widget.className = 'sidebar-user-widget';
  widget.id = 'sidebar-user-widget';
  const footer = sidebar.querySelector('.sidebar-footer');
  if (footer) {
    sidebar.insertBefore(widget, footer);
  } else {
    sidebar.appendChild(widget);
  }

  renderSidebarUser(widget);

  onAuthChange(() => renderSidebarUser(widget));
}

function renderSidebarUser(container) {
  const profile = getProfile();

  if (profile) {
    container.innerHTML = `
      <div class="sidebar-user-avatar">
        ${profile.avatar_url
          ? `<img src="${profile.avatar_url}" alt="${profile.nickname}">`
          : `<span>${(profile.nickname || '?')[0].toUpperCase()}</span>`
        }
      </div>
      <div class="sidebar-user-info">
        <div class="sidebar-user-name">${profile.nickname || '用户'}</div>
        <div class="sidebar-user-menu" id="sidebar-user-menu">
          <button class="btn btn-sm" id="btn-account-settings">⚙️ 账号设置</button>
          <button class="btn btn-sm btn-danger" id="btn-account-logout">退出</button>
        </div>
      </div>
    `;

    container.querySelector('#btn-account-settings')?.addEventListener('click', () => {
      router.navigate('/account');
    });
    container.querySelector('#btn-account-logout')?.addEventListener('click', async () => {
      if (confirm('确定退出？')) { await signOut(); router.navigate('/'); }
    });
  } else {
    container.innerHTML = `
      <button class="btn btn-primary btn-sm" style="width:100%;" id="btn-sidebar-login">🔑 登录 / 注册</button>
    `;
    container.querySelector('#btn-sidebar-login')?.addEventListener('click', () => {
      router.navigate('/login');
    });
  }
}

export function updateSidebarUser() {
  const widget = document.getElementById('sidebar-user-widget');
  if (widget) renderSidebarUser(widget);
}
