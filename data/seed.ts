import type { LanguageContent } from "./index";
import type { ChatMessage, DayRecord, Language, Level, Sm2State, UserProfile } from "./types";
import userJson from "./user.json";
import { addDays, daysSinceEpoch } from "@/lib/dates";
import { hashString, pick, randInt, seededRandom } from "@/lib/seeded";
import { CORRECTIONS, ENCOURAGEMENT, PRAISE, SAY_THIS_BETTER, TUTOR_CLOSING, introduceSlip } from "@/services/mock/pools";
import { buildDailyPlan } from "@/lib/lesson-engine";

export const SEED_USER = userJson as UserProfile & { streakAtSeed: number };

export function seedProfile(): UserProfile {
  const { streakAtSeed: _s, ...profile } = SEED_USER;
  return profile;
}

/**
 * Materialise SM-2 state for one language relative to `today`:
 * ~40 learned, ~20 due today/overdue, the rest new.
 */
export function seedCards(content: LanguageContent, level: Level, today: string): Record<string, Sm2State> {
  const rand = seededRandom(hashString(`${content.language}-cards`));
  const state: Record<string, Sm2State> = {};
  const byLevel = (l: Level) => content.vocab.filter((v) => v.level === l);
  const lower: Level = level === "beginner" ? "beginner" : "beginner";
  const own = byLevel(level);
  const below = level === "beginner" ? [] : byLevel(lower);

  // Learned: 40 cards (mostly from the level below when it exists)
  const learnedPool = [...below.slice(0, 60), ...own.slice(0, 30)];
  const learned = shuffle(rand, learnedPool).slice(0, 40);
  for (const card of learned) {
    const reps = randInt(rand, 3, 6);
    const interval = randInt(rand, 21, 60);
    const daysAgo = randInt(rand, 1, interval - 1);
    state[card.id] = {
      easeFactor: round2(2.3 + rand() * 0.5),
      interval,
      repetitions: reps,
      dueDate: addDays(today, interval - daysAgo),
      lastReviewed: addDays(today, -daysAgo),
    };
  }

  // Due: 20 cards in progress (own level first)
  const duePool = shuffle(rand, [...own.slice(30), ...below.slice(60)]).filter((c) => !state[c.id]);
  const due = duePool.slice(0, 20);
  for (const card of due) {
    const reps = randInt(rand, 1, 2);
    const interval = reps === 1 ? 1 : 6;
    const overdue = randInt(rand, 0, 2);
    state[card.id] = {
      easeFactor: round2(2.2 + rand() * 0.4),
      interval,
      repetitions: reps,
      dueDate: addDays(today, -overdue),
      lastReviewed: addDays(today, -(interval + overdue)),
    };
  }

  // Everything else is new
  for (const card of content.vocab) {
    if (!state[card.id]) {
      state[card.id] = { easeFactor: 2.5, interval: 0, repetitions: 0, dueDate: today };
    }
  }
  return state;
}

/** 14 days of fake history ending yesterday: 11 complete, 3 missed, streak of 6. */
export function seedHistory(content: LanguageContent, profile: UserProfile, today: string): Record<string, DayRecord> {
  const rand = seededRandom(hashString(`${content.language}-history`));
  const history: Record<string, DayRecord> = {};
  const missedOffsets = new Set([7, 10, 13]);
  for (let offset = 14; offset >= 1; offset--) {
    const date = addDays(today, -offset);
    if (missedOffsets.has(offset)) {
      history[date] = { date, status: "missed", language: content.language, lessonLength: profile.lessonLength };
      continue;
    }
    history[date] = buildCompleteDay(content, profile, date, rand);
  }
  return history;
}

function buildCompleteDay(content: LanguageContent, profile: UserProfile, date: string, rand: () => number): DayRecord {
  const plan = buildDailyPlan(content, profile.level, date);
  const scenario = content.scenarioById.get(plan.scenarioId)!;
  const task = content.taskById.get(plan.writingTaskId)!;
  const lang = content.language;
  const level = profile.level;

  const transcript: ChatMessage[] = [];
  const base = `${date}T09:0`;
  let n = 0;
  const push = (role: "tutor" | "user", text: string, note?: string) =>
    transcript.push({ id: `${date}-${n++}`, role, text, note, createdAt: `${base}${Math.min(9, n)}:00` });
  push("tutor", scenario.opening);
  scenario.exampleTurns.forEach((t) => {
    push("user", t.user);
    push("tutor", t.tutor, t.note);
  });
  push("tutor", TUTOR_CLOSING[lang], pick(rand, PRAISE));

  const corrections = shuffle(rand, CORRECTIONS[lang][level]).slice(0, 2);
  const userText = transcript.filter((m) => m.role === "user").map((m) => m.text.toLowerCase()).join(" ");
  const used = scenario.targetWords.filter((w) => userText.includes(w.toLowerCase().slice(0, 4)));
  const missed = scenario.targetWords.filter((w) => !used.includes(w));

  const reviewed = randInt(rand, 16, 26);
  const again = randInt(rand, 1, 4);
  const hard = randInt(rand, 2, 5);
  const easy = randInt(rand, 3, 7);
  const good = Math.max(0, reviewed - again - hard - easy);

  const models = task.sentences.map((s) => s.model);
  const slipIndex = Math.min(1, models.length - 1);
  const slip = introduceSlip(models[slipIndex], lang);
  const transcription = models.map((m, i) => (i === slipIndex && slip ? slip.text : m));
  const scores = models.map((m, i) =>
    i === slipIndex && slip ? { sentence: slip.text, correct: false, issue: slip.issue, fix: slip.fix } : { sentence: m, correct: true },
  );
  const perfect = rand() < 0.35;

  return {
    date,
    status: "complete",
    language: lang,
    lessonLength: profile.lessonLength,
    flashcards: { reviewed, again, hard, good, easy, newLearned: randInt(rand, 4, 8) },
    conversation: {
      scenarioId: scenario.id,
      transcript,
      summary: {
        turns: scenario.exampleTurns.length,
        targetWordsUsed: used,
        targetWordsMissed: missed,
        corrections,
        sayThisBetter: pick(rand, SAY_THIS_BETTER[lang][level]),
        praise: pick(rand, PRAISE),
      },
    },
    grammarRuleId: plan.grammarRuleId,
    notebook: {
      taskId: task.id,
      photo: `placeholder:${(daysSinceEpoch(date) % 4) + 1}`,
      grade: {
        transcription: perfect ? models : transcription,
        scores: perfect ? models.map((m) => ({ sentence: m, correct: true })) : scores,
        overall: perfect ? 5 : 4,
        encouragement: pick(rand, ENCOURAGEMENT),
      },
    },
    completedAt: `${date}T09:2${randInt(rand, 0, 9)}:00`,
  };
}

function shuffle<T>(rand: () => number, arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export type { Language };
