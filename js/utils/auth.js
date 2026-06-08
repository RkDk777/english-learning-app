import { getSupabase, isConfigured } from '../lib/supabase.js';

// In-memory user profile cache
let _profile = null;
let _listeners = [];

// ============ Init ============

export function onAuthChange(fn) {
  _listeners.push(fn);
  return () => { _listeners = _listeners.filter(f => f !== fn); };
}

function notify() {
  _listeners.forEach(fn => fn(_profile));
}

// ============ Profile ============

export function getProfile() {
  return _profile;
}

async function fetchProfile(userId) {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    // Default avatar
    if (!data.avatar_url) {
      data.avatar_url = null;
    }
    return data;
  } catch (e) {
    console.warn('fetchProfile failed:', e.message);
    return null;
  }
}

// ============ Sign Up / In / Out ============

export async function signUp(email, password, nickname) {
  const supabase = await getSupabase();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;

  if (data.user) {
    // Create profile
    await supabase.from('profiles').upsert({
      id: data.user.id,
      nickname: nickname || email.split('@')[0],
      avatar_url: null,
      updated_at: new Date().toISOString(),
    });
    _profile = { id: data.user.id, nickname, avatar_url: null };
    notify();
  }
  return data;
}

export async function signIn(email, password) {
  const supabase = await getSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  if (data.user) {
    _profile = await fetchProfile(data.user.id);
    notify();
  }
  return data;
}

export async function signOut() {
  const supabase = await getSupabase();
  await supabase.auth.signOut();
  _profile = null;
  notify();
}

// ============ Init Session ============

export async function initAuth() {
  if (!isConfigured()) {
    console.warn('Supabase not configured — running in offline mode');
    _profile = null;
    notify();
    return;
  }

  const supabase = await getSupabase();
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.user) {
    _profile = await fetchProfile(session.user.id);
    notify();
  }

  // Listen for auth changes
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      _profile = await fetchProfile(session.user.id);
      notify();
    } else if (event === 'SIGNED_OUT') {
      _profile = null;
      notify();
    }
  });
}

// ============ Update Profile ============

export async function updateNickname(nickname) {
  const supabase = await getSupabase();
  if (!_profile) throw new Error('Not logged in');

  await supabase.from('profiles').upsert({
    id: _profile.id,
    nickname,
    updated_at: new Date().toISOString(),
  });
  _profile.nickname = nickname;
  notify();
}

export async function uploadAvatar(file) {
  const supabase = await getSupabase();
  if (!_profile) throw new Error('Not logged in');

  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${_profile.id}/avatar.${ext}`;

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, cacheControl: '3600' });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(path);

  await supabase.from('profiles').upsert({
    id: _profile.id,
    avatar_url: publicUrl,
    updated_at: new Date().toISOString(),
  });

  _profile.avatar_url = publicUrl;
  notify();
}

export async function updatePassword(newPassword) {
  const supabase = await getSupabase();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}
