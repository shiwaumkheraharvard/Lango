# Decisions log

Decisions made without asking, with the reasoning. Anything that would change what the user does in
the daily lesson gets flagged in the summary instead.

- **Project git repo.** `~` was itself a git repo, so `~/Lango` got its own `git init` to keep commits scoped.
- **No `src/` dir.** Spec paths are `/data` and `services/`; keeping `app/`, `components/`, `data/`, `lib/`, `services/`, `store/` at the root matches it.
- **Data as TypeScript modules, user as JSON.** Content files are typed TS arrays so `tsc` catches shape errors; `data/user.json` keeps the "JSON" half of the spec. A validator script checks counts, ids, script (Cyrillic vs Latin) and cross-references.
- **SM-2 state is seeded relative to today, not baked into the files.** The spec wants ~20 due / ~40 learned "today"; static due dates would rot. `seed.ts` materialises `Sm2State` on first load.
- **SM-2 variant.** Ease factor updates on every grade (Wikipedia pseudocode); lapses reset reps and interval to 1. Cards graded < 3 re-queue within the session (SM-2 step 7).
- **UI grade mapping.** Again=1, Hard=3, Good=4, Easy=5 as specified; grades 0 and 2 are not exposed.
- **New cards per lesson.** 10 min → 5, 20 min → 8, 30 min → 12. Keeps the flashcard block inside its budget at ~10s per card.
- **Soft block timeouts.** When a block's time is up, flashcards finish the current card then advance; conversation shows its summary; grammar and notebook wait for the user (you cannot auto-submit a photo). Remaining time always rolls forward.
- **Deterministic daily plan.** Scenario, rule and task are chosen from the date so a refresh mid-lesson gives the same lesson. In-flight progress is persisted too.
- **History grid is 14 past days + today (15 tiles, 3×5).** The fake history covers days −14…−1; today sits as the last tile and fills when the lesson completes.
- **Contrast.** White on #FF6B1A fails WCAG AA, so primary buttons use deep orange #E85D04 with bold 18px+ white text (large-text 3:1), body text is #1A1A1A / #6B6B6B, and #FF6B1A is used for fills, rings and gradients rather than text on white.
- **Fonts.** Inter Tight (display) + Inter (body), both via `next/font/google` with Cyrillic subsets.
- **TTS mock uses the browser's `speechSynthesis`** so the tutor is audible with zero keys; the real route uses OpenAI `tts-1` / `alloy`.
- **Tutor model.** `claude-opus-5-5` (current Opus) with `effort: "low"` for one-sentence tutor turns and `medium` for vision grading; server-side refusal fallbacks enabled. Overridable via `LANGO_TUTOR_MODEL`.
- **Images are downscaled client-side** to ≤1600px JPEG before upload to stay under the 4.5 MB function body limit.
- **Zustand store is a reactive cache; services own persistence.** Store actions call services, then refresh the snapshot — swapping a service to Supabase does not touch components.
