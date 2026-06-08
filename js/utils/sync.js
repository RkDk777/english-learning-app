import { getSupabase, isConfigured } from '../lib/supabase.js';
import { getProfile } from './auth.js';

let _dirty = {};
let _timer = null;

const DEBOUNCE_MS = 2000; // batch writes every 2 seconds

// ============ Public API ============

/**
 * Push all learning data to Supabase (called after data changes).
 * Uses debouncing to avoid flooding the server.
 */
export async function pushAll() {
  if (!isConfigured()) return;
  const profile = getProfile();
  if (!profile) return;

  const supabase = await getSupabase();
  const mod = await import('./storage.js');
  const data = mod.storage.exportAll();

  const row = {
    user_id: profile.id,
    word_progress: data.wordProgress || {},
    grammar_progress: data.grammarProgress || {},
    reading_progress: data.readingProgress || {},
    error_book: data.errorBook || [],
    exam_history: data.examHistory || [],
    daily_log: data.dailyLog || {},
    settings: data.settings || {},
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('learning_data')
    .upsert(row, { onConflict: 'user_id' });

  if (error) console.warn('sync push failed:', error.message);
}

/**
 * Pull all learning data from Supabase and write to localStorage.
 * Called once after login. Merges — newer timestamps win.
 */
export async function pullAll() {
  if (!isConfigured()) return;
  const profile = getProfile();
  if (!profile) return;

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('learning_data')
    .select('*')
    .eq('user_id', profile.id)
    .single();

  if (error || !data) return; // no remote data yet

  const mod = await import('./storage.js');
  mod.storage.importAll({
    wordProgress: mergeObjects(mod.storage.getWordProgress(), data.word_progress || {}),
    grammarProgress: mergeObjects(mod.storage.getGrammarProgress(), data.grammar_progress || {}),
    readingProgress: mergeObjects(mod.storage.getReadingProgress(), data.reading_progress || {}),
    errorBook: mergeArrays(mod.storage.getErrorBook(), data.error_book || []),
    examHistory: mergeArrays(mod.storage.getExamHistory(), data.exam_history || []),
    dailyLog: mergeObjects(mod.storage.getDailyLog(), data.daily_log || {}),
    settings: mergeObjects(mod.storage.getSettings(), data.settings || {}),
  });
}

/**
 * Mark dirty and schedule a push.
 */
export function markDirty() {
  if (!isConfigured()) return;
  _dirty = {};
  if (_timer) clearTimeout(_timer);
  _timer = setTimeout(() => pushAll(), DEBOUNCE_MS);
}

// ============ Helpers ============

function mergeObjects(local, remote) {
  const result = { ...local };
  for (const key of Object.keys(remote)) {
    if (!result[key]) {
      result[key] = remote[key];
    } else {
      const lt = typeof result[key]?.lastReview === 'number' ? result[key].lastReview : 0;
      const rt = typeof remote[key]?.lastReview === 'number' ? remote[key].lastReview : 0;
      if (rt > lt) result[key] = remote[key];
    }
  }
  return result;
}

function mergeArrays(local, remote) {
  const seen = new Set(local.map(e => e.itemKey || JSON.stringify(e)));
  for (const entry of remote) {
    const key = entry.itemKey || JSON.stringify(entry);
    if (!seen.has(key)) {
      local.push(entry);
      seen.add(key);
    }
  }
  return local;
}
