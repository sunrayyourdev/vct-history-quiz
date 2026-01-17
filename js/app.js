// Wire up events and views
(function() {
  const btnStart = document.getElementById('btn-start');
  const btnLeaderboard = document.getElementById('btn-leaderboard');
  const btnPlayAgain = document.getElementById('btn-play-again');
  const btnViewLeaderboard = document.getElementById('btn-view-leaderboard');
  const btnLeaderboardBack = document.getElementById('btn-leaderboard-back');
  const btnRefreshLb = document.getElementById('btn-refresh-lb');
  const btnSave = document.getElementById('btn-save');
  const usernameInput = document.getElementById('username');
  const lbBody = document.getElementById('lb-body');
  const lbStatus = document.getElementById('lb-status');
  const saveStatus = document.getElementById('save-status');

  function goLanding() { UI.show('landing'); }
  function goQuiz() { Quiz.startQuiz(); }
  function goResults() { UI.show('results'); }
  function goLeaderboard() { UI.show('leaderboard'); refreshLeaderboard(); }

  async function refreshLeaderboard() {
    lbStatus.textContent = 'Loading…';
    lbBody.innerHTML = '';
    try {
      const rows = await LeaderboardAPI.fetchTopScores();
      if (!rows || rows.length === 0) {
        lbStatus.textContent = LeaderboardAPI.hasSupabase ? 'No scores yet.' : 'Offline leaderboard (local to device).';
        return;
      }
      lbStatus.textContent = LeaderboardAPI.hasSupabase ? 'Live leaderboard' : 'Offline leaderboard (local to device).';
      rows.forEach((row, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${i + 1}</td><td>${row.username}</td><td>${row.score}</td><td>${UI.formatDate(row.created_at)}</td>`;
        lbBody.appendChild(tr);
      });
    } catch (e) {
      lbStatus.textContent = 'Failed to load leaderboard';
      console.error(e);
    }
  }

  async function saveScore() {
    saveStatus.textContent = '';
    let name = Validators.sanitizeUsername(usernameInput.value);
    if (!Validators.isValidUsername(name)) {
      saveStatus.textContent = 'Username must be 3–16 chars (A–Z, 0–9, _).';
      return;
    }
    const score = parseInt(document.getElementById('final-score').textContent, 10) || 0;
    if (!Validators.isValidScore(score)) {
      saveStatus.textContent = 'Invalid score.';
      return;
    }
    try {
      const saved = await LeaderboardAPI.saveScore(name, score);
      saveStatus.textContent = LeaderboardAPI.hasSupabase ? 'Score saved!' : 'Saved offline to this device.';
    } catch (e) {
      console.error(e);
      saveStatus.textContent = 'Failed to save score.';
    }
  }

  // Events
  btnStart.addEventListener('click', goQuiz);
  btnLeaderboard.addEventListener('click', goLeaderboard);
  btnPlayAgain.addEventListener('click', goQuiz);
  btnViewLeaderboard.addEventListener('click', goLeaderboard);
  btnLeaderboardBack.addEventListener('click', goLanding);
  btnRefreshLb.addEventListener('click', refreshLeaderboard);
  btnSave.addEventListener('click', saveScore);

  // Initial view
  goLanding();
})();
