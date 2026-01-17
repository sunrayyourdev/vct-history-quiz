# VCT History Quiz

A static mini-game for event booths: answer 5 VCT history questions with a 10s timer per question. Faster answers earn more points. Scores are saved locally in your browser (no external services).

## Features

- 5-question quiz: 1 easy → 3 medium → 1 hard
- 10s timer per question; time-left scoring
- 30-question JSON bank
- Local leaderboard (browser localStorage only)
- Keyboard shortcuts (1–4), accessible UI, responsive design

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

Scores are stored and read from browser localStorage under the key `vct-quiz-scores`. Clearing site data will remove saved scores. Leaderboard is device-local and does not sync online.

## Gameplay & Scoring

- Base per difficulty: easy 100, medium 200, hard 400
- Score per question: `base × (timeLeft / 10)` (rounded)
- Timeouts yield 0 points
- Total score is sum of 5 questions

## Deployment

- Host on GitHub Pages.

## Notes

- Content based on widely known VCT results up to 2024.
- Questions will be adjusted over time to reflect new events.
