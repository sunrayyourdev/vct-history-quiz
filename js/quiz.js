// Quiz selection, timing, and scoring
(function() {
  const QUESTION_COUNT = 5;
  const TIMER_SECONDS = 10;
  const BASE_SCORES = { easy: 100, medium: 200, hard: 400 };

  let questions = [];
  let selected = [];
  let currentIndex = 0;
  let totalScore = 0;
  let timerId = null;
  let timeLeft = TIMER_SECONDS;
  let answering = false;
  let attemptId = null;

  const hudQuestion = document.getElementById('hud-question');
  const hudScore = document.getElementById('hud-score');
  const hudTimer = document.getElementById('hud-timer');
  const timerFill = document.getElementById('timer-fill');
  const questionText = document.getElementById('question-text');
  const choicesEl = document.getElementById('choices');
  const feedbackEl = document.getElementById('feedback');

  function pickQuestions(all) {
    const easy = all.filter(q => q.difficulty === 'easy');
    const med = all.filter(q => q.difficulty === 'medium');
    const hard = all.filter(q => q.difficulty === 'hard');

    function sample(arr, n) {
      const copy = [...arr];
      const out = [];
      for (let i = 0; i < n && copy.length; i++) {
        const idx = Math.floor(Math.random() * copy.length);
        out.push(copy.splice(idx, 1)[0]);
      }
      return out;
    }

    const selection = [
      ...sample(easy, 1),
      ...sample(med, 3),
      ...sample(hard, 1),
    ];
    return selection;
  }

  function renderQuestion(q) {
    questionText.textContent = q.question;
    UI.clearEl(choicesEl);
    feedbackEl.textContent = '';
    q.choices.forEach((choice, idx) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = choice;
      btn.setAttribute('data-index', String(idx));
      btn.addEventListener('click', () => handleAnswer(idx));
      li.appendChild(btn);
      choicesEl.appendChild(li);
    });
    // Keyboard shortcuts 1-4
    document.onkeydown = (e) => {
      if (!answering) return;
      const keyNum = parseInt(e.key, 10);
      if (keyNum >= 1 && keyNum <= 4) {
        const idx = keyNum - 1;
        const btn = choicesEl.querySelector(`.choice-btn[data-index="${idx}"]`);
        if (btn) btn.click();
      }
    };
  }

  function startTimer() {
    timeLeft = TIMER_SECONDS;
    answering = true;
    updateTimerUI();
    clearInterval(timerId);
    timerId = setInterval(() => {
      timeLeft = Math.max(0, Math.round((timeLeft - 0.1) * 10) / 10);
      updateTimerUI();
      if (timeLeft <= 0) {
        clearInterval(timerId);
        handleTimeout();
      }
    }, 100);
  }

  function updateTimerUI() {
    hudTimer.textContent = `${timeLeft.toFixed(1)}s`;
    const pct = Math.max(0, Math.min(1, timeLeft / TIMER_SECONDS));
    timerFill.style.transform = `scaleX(${pct})`;
  }

  function scoreFor(q, timeLeftSec, correct) {
    if (!correct) return 0;
    const base = BASE_SCORES[q.difficulty] || 0;
    return Math.round(base * (timeLeftSec / TIMER_SECONDS));
  }

  function handleAnswer(idx) {
    if (!answering) return;
    answering = false;
    clearInterval(timerId);
    const q = selected[currentIndex];
    const correct = idx === q.answerIndex;
    const added = scoreFor(q, timeLeft, correct);
    totalScore += added;
    hudScore.textContent = String(totalScore);

    // Feedback + mark choices
    const btns = choicesEl.querySelectorAll('.choice-btn');
    btns.forEach((b, i) => {
      if (i === q.answerIndex) b.classList.add('correct');
      if (i === idx && !correct) b.classList.add('incorrect');
      b.disabled = true;
    });
    feedbackEl.textContent = correct ? `Correct! +${added}` : 'Incorrect';

    setTimeout(nextQuestion, 800);
  }

  function handleTimeout() {
    if (!answering) return;
    answering = false;
    const q = selected[currentIndex];
    const btns = choicesEl.querySelectorAll('.choice-btn');
    btns.forEach((b, i) => {
      if (i === q.answerIndex) b.classList.add('correct');
      b.disabled = true;
    });
    feedbackEl.textContent = 'Time up! +0';
    setTimeout(nextQuestion, 800);
  }

  function nextQuestion() {
    currentIndex += 1;
    if (currentIndex >= selected.length) {
      endQuiz();
      return;
    }
    hudQuestion.textContent = `${currentIndex + 1}/${QUESTION_COUNT}`;
    renderQuestion(selected[currentIndex]);
    startTimer();
  }

  function endQuiz() {
    UI.show('results');
    UI.setText('final-score', String(totalScore));
  }

  async function startQuiz() {
    totalScore = 0;
    currentIndex = 0;
    hudScore.textContent = '0';
    hudQuestion.textContent = '1/5';

    // New attempt identifier for idempotent save
    try {
      attemptId = (crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now());
    } catch {
      attemptId = String(Date.now());
    }

    try {
      const res = await fetch('data/questions.json');
      questions = await res.json();
    } catch (e) {
      console.error('Failed to load questions', e);
      UI.setText('question-text', 'Failed to load questions.');
      return;
    }
    selected = pickQuestions(questions);
    UI.show('quiz');
    renderQuestion(selected[currentIndex]);
    startTimer();
  }

  function getAttemptId() { return attemptId; }

  window.Quiz = { startQuiz, getAttemptId };
})();
