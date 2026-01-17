# VCT History Quiz

A static mini-game for event booths: answer 5 VCT history questions with a 10s timer per question. Faster answers earn more points. Scores are saved locally in your browser (no external services).

## Features

- 5-question quiz: 1 easy → 3 medium → 1 hard
- 10s timer per question; time-left scoring
- 30-question JSON bank
- Local leaderboard (browser localStorage only), top 50
- Deterministic tie-breaking via insertion order (newer wins)
- Cross-tab auto-refresh of leaderboard (BroadcastChannel + storage event)
- Duplicate-save protection per attempt; Save button disables after success
- Choices shuffled per question without breaking correctness; 1–4 shortcuts
- Accessible UI and responsive layout

## Project Structure

- index.html — single-page app shell
- styles/main.css — visual styles
- js/app.js — wiring views & events
- js/quiz.js — selection, timer, scoring
- js/ui.js — DOM helpers
- js/validators.js — username & score validation
- js/storage.js — leaderboard API (localStorage)
- data/questions.json — 30 questions (easy/medium/hard)

## Quick Start (Local)

Open directly or use a simple local server.

### Option A: Open file

Double-click `index.html` or run:

```powershell
Start-Process "$PWD\index.html"
```

### Option B: Local HTTP server

If you have Python:

```powershell
python -m http.server 5500
```

Then open <http://localhost:5500/index.html>

## Leaderboard Storage

- Storage key: `vct-quiz-scores` (array of `{ username, score, created_at, seq, attemptId }`)
- Sequence key: `vct-quiz-scores-seq` (monotonic counter for tie-breaking)
- Fetch returns the top 50 sorted by score desc, then `seq` desc
- Cross-tab updates: posts to `BroadcastChannel("vct-quiz-events")` and touches a `vct-quiz-ping` key as a fallback
- Device-local only: clearing site data removes all saved scores

## Gameplay & Scoring

- Base per difficulty: easy 100, medium 200, hard 400
- Score per question: `base × (timeLeft / 10)` (rounded)
- Timeouts yield 0 points
- Total score is sum of 5 questions

## Multi-Tab Behavior

- When a score is saved or cleared, other open tabs listening on the leaderboard view refresh automatically.
- Uses `BroadcastChannel` where supported; falls back to the `storage` event.

## Deployment

- Static hosting friendly. GitHub Pages recommended.
- Ensure Pages is enabled for the repository (source: `main` branch).

## Notes

- Content based on widely known VCT results up to 2024.
- Questions will be adjusted over time to reflect new events.

## Credits

- Event: Cloud9 × JetBrains — Booth Mini-Game
- Built by: [@sunrayyourdev](https://github.com/sunrayyourdev)
