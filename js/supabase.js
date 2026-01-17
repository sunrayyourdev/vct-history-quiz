// Supabase integration with offline fallback
(function() {
  let client = null;
  const table = window.LEADERBOARD_TABLE || 'scores';
  const limit = window.LEADERBOARD_LIMIT || 50;
  const hasSupabaseCreds = !!(window.SUPABASE_URL && window.SUPABASE_ANON_KEY);

  if (hasSupabaseCreds && window.supabase && typeof window.supabase.createClient === 'function') {
    try {
      client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
      console.log('[Supabase] Client initialized');
    } catch (e) {
      console.warn('[Supabase] init failed, using offline fallback', e);
    }
  } else {
    console.warn('[Supabase] credentials missing or CDN not loaded; using localStorage fallback');
  }

  async function saveScore(username, score) {
    const payload = { username, score, created_at: new Date().toISOString() };
    if (client) {
      const { data, error } = await client.from(table).insert(payload).select();
      if (error) throw error;
      return data?.[0] || payload;
    }
    // Offline fallback
    const key = 'vct-quiz-scores';
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    list.push(payload);
    localStorage.setItem(key, JSON.stringify(list));
    return payload;
  }

  async function fetchTopScores() {
    if (client) {
      const { data, error } = await client
        .from(table)
        .select('*')
        .order('score', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data || [];
    }
    const key = 'vct-quiz-scores';
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    return list
      .sort((a, b) => (b.score - a.score) || (new Date(b.created_at) - new Date(a.created_at)))
      .slice(0, limit);
  }

  window.LeaderboardAPI = { saveScore, fetchTopScores, hasSupabase: !!client };
})();
