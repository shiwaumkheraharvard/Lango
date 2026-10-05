# Lango — build plan

Lango gets language learners (Russian or Spanish) to use the language every day through one short,
structured lesson: SM-2 flashcards → spoken conversation with an AI tutor → a grammar rule to copy →
a handwritten notebook exercise that is photographed and graded. Polo, a confused polar bear, guides it.

This version has no auth and no database: one hardcoded user ("Sam"), seed data in `/data`, state in
`localStorage` behind a `services/` layer with a `MOCK` flag.

---

## 1. File structure

```
app/
  layout.tsx                 fonts (Inter Tight display, Inter body), providers, nav shell
  globals.css                tokens, base styles, mesh gradient, card flip utilities
  page.tsx                   / Landing
  start/page.tsx             /start Onboarding (language → level → time → meet Polo)
  today/page.tsx             /today Dashboard
  lesson/page.tsx            /lesson Full-screen lesson flow
  review/page.tsx            /review Standalone flashcard review
  history/page.tsx           /history 14-day calendar + day detail
  settings/page.tsx          /settings
  api/stt/route.ts           Whisper (OpenAI) → mock
  api/tutor/route.ts         Claude tutor turn + summary → mock
  api/tts/route.ts           OpenAI TTS "alloy" → 204 + mock header (client uses speechSynthesis)
  api/grade-notebook/route.ts Claude vision grading → mock

components/
  polo/Polo.tsx              inline SVG mascot, `pose` prop, Framer Motion animations (9 poses)
  ui/                        Button, Card, Pill, ProgressRing, Sheet, Toast, Waveform, FlipCard, Skeleton
  nav/AppNav.tsx             bottom tab bar (mobile) / top bar (desktop)
  lesson/TimerRing.tsx       lesson timer ring + block indicator
  lesson/FlashcardsBlock.tsx
  lesson/ConversationBlock.tsx
  lesson/GrammarBlock.tsx
  lesson/NotebookBlock.tsx
  lesson/LessonComplete.tsx
  history/DayDetail.tsx, NotebookPlaceholder.tsx (SVG "photo" of a notebook page)

data/
  types.ts                   shared content + state types
  grammar-topics.ts          canonical 30 rule ids/titles per language
  vocab/{ru,es}-{beginner,intermediate,advanced}.ts   100 cards each (600 total)
  scenarios/{ru,es}-{level}.ts                        40 each (240 total)
  writing/{ru,es}-{level}.ts                          30 each (180 total)
  grammar/{ru,es}.ts                                  30 each (60 total)
  user.json                  the fake user "Sam"
  seed.ts                    composes content → initial VocabCard SM-2 state, 14-day fake history
  index.ts                   typed accessors (vocabFor, scenariosFor, …)

lib/
  sm2.ts                     pure SM-2 scheduler            (unit-tested)
  sm2.test.ts
  dates.ts                   local ISO dates, day offsets, streak math
  lesson-engine.ts           block budgets, state machine reducer, daily plan selection
  lesson-engine.test.ts
  audio/recorder.ts          MediaRecorder wrapper with audio/mp4 fallback (iOS Safari)
  audio/speech.ts            TTS playback (API or speechSynthesis), mute aware
  image.ts                   downscale photo → JPEG data URL (< 1.5 MB)
  seeded.ts                  tiny deterministic PRNG for fake data

services/
  config.ts                  MOCK flag (true unless NEXT_PUBLIC_LANGO_BACKEND=supabase)
  storage.ts                 localStorage adapter (SSR-safe, in-memory fallback)
  flashcards.ts              getCards/getDue/grade/resetDemo      (mock = localStorage)
  conversation.ts            tutorTurn/summarize                  (→ /api/tutor; local mock fallback)
  speech.ts                  transcribe/synthesize                (→ /api/stt, /api/tts; fallback)
  writing.ts                 gradeNotebook                        (→ /api/grade-notebook; fallback)
  grammar.ts                 ruleFor(day)/rules
  progress.ts                profile, history, today's lesson, streak
  index.ts                   re-exports the active implementation per service
  mock/*.ts                  canned AI responses used by both the routes and client fallbacks

store/
  useAppStore.ts             Zustand: hydrated snapshot of services + UI state, actions call services

scripts/validate-data.ts     seed data validator (counts, ids, scripts, cross-refs)
PLAN.md · DECISIONS.md · NOT_NOW.md · README.md · .env.example
```

## 2. Data model

**Content (static, `/data`)** — see `data/types.ts`.

| Type | Key fields | Count |
|---|---|---|
| `VocabContent` | id, language, level, word, translation, example, exampleTranslation, audioText, tags | 300 / language |
| `ConversationScenario` | id, title, goal, opening (+translation), targetWords[5–8], exampleTurns[3]{user,tutor,note} | 40 / language / level |
| `WritingTask` | id, grammarRuleId, instruction, sentences[3–5]{prompt, model}, targetVocab, grammarFocus | 30 / language / level |
| `GrammarRule` | id, title, rule, examples[3], writeDown | 30 / language (10 per level) |

Cross-references: `WritingTask.grammarRuleId → GrammarRule.id` (same language+level). Validated by
`scripts/validate-data.ts`.

**State (localStorage, key `lango:v1`)**

```ts
PersistedState {
  version: 1
  profile: UserProfile           // name, language, level, lessonLength, reminderTime, timezone, muteTutor, onboarded
  cards: Record<cardId, Sm2State> // only the scheduling state; content is joined from /data at read time
  history: Record<isoDate, DayRecord>
  todayLesson?: LessonProgress   // in-flight lesson so refresh resumes it
  seededOn: isoDate              // when the demo data was materialised
}
```

Vocab SM-2 state is seeded on first load relative to *today* (so "~20 due, ~40 learned" holds whenever
the demo is opened): per language, 40 cards learned (reps 3–6, interval 15–60, due in the future),
20 due today or overdue (reps 1–2), 240 new (reps 0, due today, shown as "new" up to the daily cap).

`DayRecord` holds everything History needs: flashcard stats, scenario + transcript + summary,
grammarRuleId, notebook photo (data URL or `placeholder:<n>`) + grade.

## 3. SM-2 specification (`lib/sm2.ts`)

Input: `Sm2State {easeFactor, interval, repetitions, dueDate}`, grade `q ∈ 0..5`, `today`.

```
if q >= 3:
  interval = repetitions == 0 ? 1
           : repetitions == 1 ? 6
           : round(interval * easeFactor)
  repetitions += 1
else:
  repetitions = 0
  interval = 1
easeFactor = easeFactor + (0.1 − (5 − q) × (0.08 + (5 − q) × 0.02))
easeFactor = max(1.3, easeFactor)
dueDate = today + interval days
```

UI mapping: Again = 1, Hard = 3, Good = 4, Easy = 5. Cards graded < 3 are re-queued at the end of
the current session (SM-2 step 7) so a lesson ends with every card answered once correctly.
Tests cover: first review, second review (6), third review (×EF), lapse resets reps/interval and
lowers EF, EF floor at 1.3, easy streak raises EF (2.6 → 2.7 → 2.8) and intervals (1, 6, 16),
Hard keeps progress but lowers EF, and `previewInterval(grade)` used for the "next review in X days" hint.

## 4. Lesson engine (`lib/lesson-engine.ts`)

Block budgets (minutes):

| Length | Flashcards | Conversation | Grammar | Notebook |
|---|---|---|---|---|
| 10 | 3 | 4 | 1 | 2 |
| 20 | 5 | 8 | 2 | 5 |
| 30 | 7 | 12 | 3 | 8 |

Order: **Flashcards → Conversation → Grammar rule → Notebook writing** (the notebook task practises the
day's rule, and shows the day's reviewed words as bonus vocabulary).

State machine:

```
idle ──START──▶ flashcards ──NEXT──▶ conversation ──NEXT──▶ grammar ──NEXT──▶ notebook ──NEXT──▶ complete
                   ▲ TICK (1s)           ▲ TICK                ▲ TICK            ▲ TICK
```

```ts
LessonProgress {
  date, lessonLength, status: 'idle'|'running'|'complete'
  blockIndex: 0..3, blocks: [{kind, budgetSec, remainingSec, carriedSec, startedAt?, endedAt?}]
  flashcards: { stats, reviewedCardIds }
  conversation: { scenarioId, transcript, summary? }
  grammarRuleId
  notebook: { taskId, photo?, grade? }
}
```

Events: `START`, `TICK` (decrement current block's remainingSec; at 0 the block is flagged `timeUp`
and the UI nudges to move on — flashcards auto-advance after the current card, conversation shows the
summary, grammar/notebook wait for the user), `NEXT` (end block early; `remainingSec` is added to the
next block as `carriedSec`), `COMPLETE` (all four done → DayRecord written, streak recomputed).

Daily plan selection is deterministic from the date and profile so a refresh produces the same lesson:
`dayIndex = daysSince(2024-01-01)`; rule = rulesFor(lang, level)[dayIndex % 10];
task = tasksFor(rule)[dayIndex % 3]; scenario = scenariosFor(lang, level)[dayIndex % 40].

Streak = consecutive `complete` days ending today or yesterday. Completing today increments it.

## 5. AI behaviour and mock mode

- `/api/tutor` (Claude `claude-opus-5-5` by default, override with `LANGO_TUTOR_MODEL`): system prompt
  pins language, level, one short sentence/question per turn, nudge toward target words, never lecture;
  returns `{ reply, note }` JSON. `mode: "summary"` returns `ConversationSummary`.
- `/api/stt`: Whisper `whisper-1` with `language` hint; mock returns the scenario's example user line.
- `/api/tts`: OpenAI `tts-1` voice `alloy`, mp3; mock responds `204` + `x-lango-mock: 1` and the client
  speaks with `speechSynthesis` (ru-RU / es-ES).
- `/api/grade-notebook`: Claude vision with task + model answers; forgiving on legibility, strict on
  grammar; returns `NotebookGrade` JSON. Mock transcribes the model answers with one plausible slip.
- Every route checks its key; missing key → mock. Client fetch failure → local mock. Demo runs with zero keys.

## 6. Build order & commits

1. scaffold + plan + SM-2 + services + data (this commit series)
2. onboarding
3. dashboard
4. lesson flow (flashcards, conversation, grammar, notebook, complete)
5. review + history
6. settings
7. Polo + motion polish, README, Lighthouse pass
