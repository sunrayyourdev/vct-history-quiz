// Wire up events and views
(function() {
  const btnStart = document.getElementById('btn-start');
  const btnLeaderboard = document.getElementById('btn-leaderboard');
  const btnPlayAgain = document.getElementById('btn-play-again');
  const btnViewLeaderboard = document.getElementById('btn-view-leaderboard');
  const btnLeaderboardBack = document.getElementById('btn-leaderboard-back');
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
        lbStatus.textContent = 'No scores yet.';
        return;
      }
      lbStatus.textContent = 'Saved scores (local).';
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
      // Prevent duplicate submissions
      if (btnSave.disabled) return;
      btnSave.disabled = true;
      const saved = await LeaderboardAPI.saveScore(name, score, Quiz.getAttemptId && Quiz.getAttemptId());
      saveStatus.textContent = 'Score saved to this device.';
      btnSave.textContent = 'Saved';
      btnSave.setAttribute('aria-disabled', 'true');
    } catch (e) {
      console.error(e);
      saveStatus.textContent = 'Failed to save score.';
      // Allow retry on error
      btnSave.disabled = false;
      btnSave.textContent = 'Save Score';
    }
  }

  // Events
  btnStart.addEventListener('click', goQuiz);
  btnLeaderboard.addEventListener('click', goLeaderboard);
  btnPlayAgain.addEventListener('click', goQuiz);
  btnViewLeaderboard.addEventListener('click', goLeaderboard);
  btnLeaderboardBack.addEventListener('click', goLanding);
  btnSave.addEventListener('click', saveScore);

  // Initial view
  goLanding();
})();
