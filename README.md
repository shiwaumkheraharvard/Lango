# Lango

**Say one thing in Russian (or Spanish) today.**

Lango is a daily-lesson language app. Every day it runs one short, structured lesson of 10, 20 or 30
minutes made of four blocks, in order:

1. **Flashcards** — spaced repetition with a real SM-2 scheduler (Again / Hard / Good / Easy).
2. **Conversation** — a spoken back-and-forth with Polo, an AI tutor who stays in the target language,
   nudges you toward the day's target words and slips you one gentle correction per turn.
3. **Grammar rule** — one rule in plain English with three examples and a one-liner to copy into a paper notebook.
4. **Notebook** — handwrite 3–5 sentences that use the rule, photograph the page with your phone, and get it graded sentence by sentence.

Finish all four and the day lights up on your calendar and the streak grows. Polo, a round and slightly
confused polar bear in an orange scarf, guides the whole thing with nine animated poses.

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind · Framer Motion · lucide-react · Zustand · Vitest.
AI: Anthropic Claude (tutor + vision grading), OpenAI Whisper (speech-to-text), OpenAI TTS "alloy".

## Setup

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

```bash
npm run build          # production build, zero TypeScript errors
npm test               # SM-2 and lesson-engine unit tests
npm run validate-data  # checks every seed data file (counts, ids, scripts, cross-references)
npm run typecheck
```

## Demo mode (no keys needed)

Lango runs **fully without API keys**. When `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` are missing, each
route handler returns realistic canned responses:

| Route | With key | Without key (demo) |
|---|---|---|
| `POST /api/tutor` | Claude replies in the target language + English side-note; end-of-block summary | Scripted replies from the scenario's example turns, then natural follow-ups; summary built from the transcript |
| `POST /api/stt` | Whisper transcription with language hint | A plausible learner line for that turn |
| `POST /api/tts` | OpenAI `tts-1`, voice `alloy`, mp3 | `204` + `x-lango-mock: 1`; the browser speaks with `speechSynthesis` in ru-RU / es-ES |
| `POST /api/grade-notebook` | Claude vision reads the photo, forgiving on legibility, strict on grammar | Transcribes the model answers with one believable slip and grades it |

The client also falls back to the same mocks if a route is unreachable, so the whole lesson works
offline-ish. A small **Demo mode** badge appears on the dashboard once any mock response has been served.

There is one hardcoded user ("Sam", Russian, Intermediate, 20-minute lessons, 9:00 AM reminder,
6-day streak, America/New_York). All state lives in `localStorage` under `lango:v1`. **Settings → Reset
demo data** reseeds everything. Switching to Spanish is one tap in Settings.

### Adding real AI

```bash
cp .env.example .env.local
# fill in OPENAI_API_KEY and ANTHROPIC_API_KEY
```

Optional: `LANGO_TUTOR_MODEL` (default `claude-opus-5-5`), `LANGO_FORCE_MOCK=1` to keep mocks even with keys.

## Project layout

```
app/            routes: / (landing), /start, /today, /lesson, /review, /history, /settings, /polo (pose gallery), /api/*
components/     polo/ (mascot), ui/, lesson/, dashboard/, history/, onboarding/, review/, settings/, nav/
data/           seed content: vocab (300/lang), scenarios (40/lang/level), writing (30/lang/level), grammar (30/lang), fake user
lib/            sm2.ts (+tests), lesson-engine.ts (+tests), dates, audio (recorder, speech), image
services/       data access behind a MOCK flag: progress, flashcards, grammar, conversation, speech, writing (+ mock/)
store/          Zustand store (reactive cache over the services)
scripts/        validate-data.ts
```

See `PLAN.md` for the data model, SM-2 spec and lesson state machine; `DECISIONS.md` for choices made
along the way; `NOT_NOW.md` for what was deliberately left out.

## Swapping the mock backend

Every service in `services/` has a single implementation today (localStorage). To move to Supabase:
set `NEXT_PUBLIC_LANGO_BACKEND=supabase`, then replace the bodies in `services/progress.ts` and
`services/flashcards.ts` with queries. Components only ever import from `services/index.ts`.

## Mobile notes

- The record button uses `MediaRecorder` with an `audio/mp4` fallback for iOS Safari and asks for the
  microphone on tap (inside the user gesture).
- The notebook photo input uses `<input type="file" accept="image/*" capture="environment">` plus a
  plain upload; photos are downscaled client-side to ≤1400px JPEG before upload.
- The layout is designed at 390px first and tested on desktop.
