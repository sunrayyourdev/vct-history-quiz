// Local leaderboard adapter using browser localStorage only
(function() {
  const STORAGE_KEY = 'vct-quiz-scores';
  const SEQ_KEY = 'vct-quiz-scores-seq';
  const LIMIT = 50; // default top N
  const EVENT_CHANNEL = 'vct-quiz-events';
  const PING_KEY = 'vct-quiz-ping';

  // Cross-tab channel (if supported)
  const bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(EVENT_CHANNEL) : null;

  function storageAvailable() {
    try {
      const x = '__vct_test__';
      localStorage.setItem(x, '1');
      localStorage.removeItem(x);
      return true;
    } catch {
      return false;
    }
  }

  function loadScores() {
    if (!storageAvailable()) return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function persistScores(arr) {
    if (!storageAvailable()) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  }

  function signalUpdate() {
    // Notify other tabs that scores changed
    try {
      if (bc) bc.postMessage({ type: 'scores-updated', at: Date.now() });
    } catch {}
    try {
      // Fallback: trigger storage event in other tabs
      localStorage.setItem(PING_KEY, `${Date.now()}:${Math.random()}`);
    } catch {}
  }

  function nextSeq() {
    if (!storageAvailable()) return Date.now();
    const raw = localStorage.getItem(SEQ_KEY);
    const curr = raw ? parseInt(raw, 10) || 0 : 0;
    const next = curr + 1;
    localStorage.setItem(SEQ_KEY, String(next));
    return next;
  }

  function sortScores(a, b) {
    // Score desc, then by insertion order (seq desc) to prefer newer records on ties
    return (b.score || 0) - (a.score || 0) || (b.seq || 0) - (a.seq || 0);
  }

  async function saveScore(username, score, attemptId) {
    const uname = String(username || '').trim().slice(0, 16);
    const s = Number(score);
    if (!uname) throw new Error('Username required');
    if (!Number.isFinite(s) || s < 0) throw new Error('Invalid score');

    const arr = loadScores();
    // Idempotent save per attempt: if attemptId provided and exists, return existing
    if (attemptId) {
      const existing = arr.find(r => r.attemptId === attemptId);
      if (existing) return existing;
    }

    const payload = { username: uname, score: s, created_at: new Date().toISOString(), seq: nextSeq(), attemptId: attemptId || null };
    arr.push(payload);
    arr.sort(sortScores);
    persistScores(arr);
    signalUpdate();
    return payload;
  }

  async function fetchTopScores() {
    const arr = loadScores().slice().sort(sortScores);
    return arr.slice(0, LIMIT);
  }
  
  async function clearAllScores() {
    persistScores([]);
    signalUpdate();
    return [];
  }

  // Expose the same API name used by the app
  window.LeaderboardAPI = { saveScore, fetchTopScores, clearAllScores };
})();
