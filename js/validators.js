// Username and score validators
(function() {
  function sanitizeUsername(input) {
    const trimmed = (input || '').trim();
    const sanitized = trimmed.replace(/\s+/g, '_').replace(/[^A-Za-z0-9_]/g, '');
    return sanitized.slice(0, 16);
  }

  function isValidUsername(name) {
    if (!name) return false;
    if (name.length < 3 || name.length > 16) return false;
    return /^[A-Za-z0-9_]+$/.test(name);
  }

  function isValidScore(score) {
    return Number.isFinite(score) && score >= 0 && score <= 2000; // cap for anti-abuse
  }

  window.Validators = { sanitizeUsername, isValidUsername, isValidScore };
})();
