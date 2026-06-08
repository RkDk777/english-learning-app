// Supabase client — CDN loaded as ES Module
// Replace these with your own Supabase project keys after creating a project

const SUPABASE_URL = 'https://ocjzegtdgmgepsfwhurw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9janplZ3RkZ21nZXBzZndodXJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MTY0MjMsImV4cCI6MjA5NjQ5MjQyM30.I22h6M--SqBxDRtlPfYypsFm1oPKxFWxGTwWS1Zuars';

let _client = null;

export async function getSupabase() {
  if (_client) return _client;

  const { createClient } = await import(
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'
  );
  _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  return _client;
}

export function isConfigured() {
  return !SUPABASE_URL.startsWith('__');
}
