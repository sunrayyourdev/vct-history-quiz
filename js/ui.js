// UI helpers for view switching and DOM updates
(function() {
  const views = {
    landing: document.getElementById('view-landing'),
    quiz: document.getElementById('view-quiz'),
    results: document.getElementById('view-results'),
    leaderboard: document.getElementById('view-leaderboard'),
  };

  function show(viewName) {
    Object.values(views).forEach(v => v.classList.remove('active'));
    views[viewName].classList.add('active');
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function setHTML(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }

  function clearEl(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  function formatDate(iso) {
    try { return new Date(iso).toLocaleString(); } catch { return iso; }
  }

  window.UI = { show, setText, setHTML, clearEl, formatDate };
})();
