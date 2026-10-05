/**
 * Progress service: profile, SM-2 card state, history, today's in-flight lesson.
 * MOCK implementation persists to localStorage. A Supabase implementation would replace the
 * bodies of these functions (same signatures) and read/write rows instead.
 */
import { loadContent } from "@/data/index";
import { seedCards, seedHistory, seedProfile, SEED_USER } from "@/data/seed";
import type { DayRecord, Language, LessonProgress, PersistedState, UserProfile } from "@/data/types";
import { addDays } from "@/lib/dates";
import { MAX_STORED_PHOTOS } from "./config";
import { clearState, loadState, saveState } from "./storage";

let cached: PersistedState | null = null;

function persist(state: PersistedState) {
  cached = state;
  saveState(state);
}

export function getState(): PersistedState {
  if (!cached) throw new Error("Progress service not initialised — call ensureInitialized() first");
  return cached;
}

function mutate(fn: (s: PersistedState) => PersistedState): PersistedState {
  const next = fn(getState());
  persist(next);
  return next;
}

/** Load or seed. Idempotent. */
export async function ensureInitialized(today: string): Promise<PersistedState> {
  if (cached) return cached;
  const existing = loadState();
  if (existing) {
    cached = existing;
    // Drop a stale in-flight lesson from a previous day.
    if (existing.todayLesson && existing.todayLesson.date !== today) {
      const stale = existing.todayLesson;
      const history = { ...existing.history };
      if (stale.status !== "complete" && !history[stale.date]) {
        history[stale.date] = { date: stale.date, status: "partial", language: stale.language, lessonLength: stale.lessonLength };
      }
      persist({ ...existing, history, todayLesson: undefined });
    }
    return cached!;
  }
  const profile = seedProfile();
  const content = await loadContent(profile.language);
  const state: PersistedState = {
    version: 1,
    profile,
    cards: seedCards(content, profile.level, today),
    seededLanguages: [profile.language],
    history: seedHistory(content, profile, today),
    seededOn: today,
  };
  persist(state);
  return state;
}

/** Seed SM-2 state for a language the first time it is selected. */
export async function ensureLanguageSeeded(language: Language, today: string): Promise<void> {
  const s = getState();
  if (s.seededLanguages.includes(language)) return;
  const content = await loadContent(language);
  const cards = { ...s.cards, ...seedCards(content, s.profile.level, today) };
  mutate((st) => ({ ...st, cards, seededLanguages: [...st.seededLanguages, language] }));
}

export function getProfile(): UserProfile {
  return getState().profile;
}

export function updateProfile(patch: Partial<UserProfile>): UserProfile {
  return mutate((s) => ({ ...s, profile: { ...s.profile, ...patch } })).profile;
}

export function getHistory(): Record<string, DayRecord> {
  return getState().history;
}

export function getDay(date: string): DayRecord | undefined {
  return getState().history[date];
}

/** Save a day record and keep only the most recent real photos. */
export function saveDay(record: DayRecord): void {
  mutate((s) => {
    const history = { ...s.history, [record.date]: record };
    const withPhotos = Object.values(history)
      .filter((d) => d.notebook && d.notebook.photo.startsWith("data:"))
      .sort((a, b) => (a.date < b.date ? 1 : -1));
    withPhotos.slice(MAX_STORED_PHOTOS).forEach((d) => {
      history[d.date] = { ...d, notebook: { ...d.notebook!, photo: "placeholder:1" } };
    });
    return { ...s, history };
  });
}

/** Consecutive complete days ending today or yesterday. */
export function getStreak(today: string): number {
  const history = getState().history;
  let streak = 0;
  let cursor = history[today]?.status === "complete" ? today : addDays(today, -1);
  while (history[cursor]?.status === "complete") {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function getTodayLesson(today: string): LessonProgress | undefined {
  const l = getState().todayLesson;
  return l && l.date === today ? l : undefined;
}

export function saveTodayLesson(lesson: LessonProgress): void {
  mutate((s) => ({ ...s, todayLesson: lesson }));
}

export function clearTodayLesson(): void {
  mutate((s) => ({ ...s, todayLesson: undefined }));
}

/** Wipe everything and reseed the demo. */
export async function resetDemo(today: string): Promise<PersistedState> {
  clearState();
  cached = null;
  return ensureInitialized(today);
}

export const DEMO_STREAK_AT_SEED = SEED_USER.streakAtSeed;
