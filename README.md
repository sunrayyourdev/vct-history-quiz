# VCT History Quiz

A static mini-game for event booths: answer 5 VCT history questions with a 10s timer per question. Faster answers earn more points. Save your score to a live Supabase leaderboard, with offline fallback.

## Features
- 5-question quiz: 1 easy → 3 medium → 1 hard
- 10s timer per question; time-left scoring
- 30-question JSON bank
- Supabase leaderboard (CDN client) + localStorage fallback
- Keyboard shortcuts (1–4), accessible UI, responsive design

## Project Structure
- index.html — single-page app shell
- styles/main.css — visual styles
- js/app.js — wiring views & events
- js/quiz.js — selection, timer, scoring
- js/ui.js — DOM helpers
- js/validators.js — username & score validation
- js/supabase.js — leaderboard API (Supabase/local)
- js/config.js — runtime config (fill with credentials)
- js/config.example.js — template for config
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
Then open http://localhost:5500/index.html

## Supabase Leaderboard
1. Create a Supabase project and a table `scores`:
   - Columns: `id: uuid default uuid_generate_v4()`, `username: text`, `score: int4`, `created_at: timestamp with time zone default now()`
2. Enable RLS and add policies:
   - Read: allow `anon` to select top scores
   - Insert: allow `anon` to insert with basic constraints (username length 3–16, score 0–2000)
3. Configure credentials:
   - Copy `js/config.example.js` to `js/config.js`
   - Fill `window.SUPABASE_URL` and `window.SUPABASE_ANON_KEY`
   - Optionally change `window.LEADERBOARD_TABLE` and `window.LEADERBOARD_LIMIT`

If Supabase isn’t configured or network fails, scores are stored in `localStorage` and shown as an offline leaderboard.

## Gameplay & Scoring
- Base per difficulty: easy 100, medium 200, hard 400
- Score per question: `base × (timeLeft / 10)` (rounded)
- Timeouts yield 0 points
- Total score is sum of 5 questions

## Deployment
- Host on Netlify, GitHub Pages, or any static host
- Restrict Supabase CORS to your domain

## Notes
- Content based on widely known VCT results up to 2024.
- Adjust questions over time to reflect new events.
