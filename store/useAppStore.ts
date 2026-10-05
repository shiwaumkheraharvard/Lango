"use client";

import { create } from "zustand";
import { loadContent, type LanguageContent } from "@/data/index";
import type { DayRecord, LessonProgress, Sm2Grade, Sm2State, UserProfile, VocabCard } from "@/data/types";
import { todayISO } from "@/lib/dates";
import { buildDailyPlan, createLesson, lessonReducer, type LessonEvent } from "@/lib/lesson-engine";
import { flashcards, progress } from "@/services";
import type { CardCounts } from "@/services/flashcards";
import { mockSummary } from "@/services/mock/tutor";

interface AppState {
  hydrated: boolean;
  today: string;
  profile: UserProfile | null;
  content: LanguageContent | null;
  cards: VocabCard[];
  counts: CardCounts;
  history: Record<string, DayRecord>;
  streak: number;
  lesson: LessonProgress | null;
  /** True once any AI call has been served by a mock (shows the Demo badge). */
  demoMode: boolean;
  speaking: boolean;

  hydrate: () => Promise<void>;
  refresh: () => void;
  updateProfile: (patch: Partial<UserProfile>) => Promise<void>;
  gradeCard: (cardId: string, grade: Sm2Grade) => Sm2State;
  startLesson: () => LessonProgress;
  dispatch: (event: LessonEvent) => void;
  completeLesson: () => DayRecord;
  abandonLesson: () => void;
  resetDemo: () => Promise<void>;
  setDemoMode: (on: boolean) => void;
  setSpeaking: (on: boolean) => void;
}

let hydrating: Promise<void> | null = null;
let tickCounter = 0;

export const useAppStore = create<AppState>((set, get) => ({
  hydrated: false,
  today: "",
  profile: null,
  content: null,
  cards: [],
  counts: { due: 0, fresh: 0, learned: 0, total: 0 },
  history: {},
  streak: 0,
  lesson: null,
  demoMode: false,
  speaking: false,

  hydrate: async () => {
    if (get().hydrated) return;
    if (hydrating) return hydrating;
    hydrating = (async () => {
      const today = todayISO();
      const state = await progress.ensureInitialized(today);
      const content = await loadContent(state.profile.language);
      await progress.ensureLanguageSeeded(state.profile.language, today);
      const cards = flashcards.getCards(content, today);
      set({
        hydrated: true,
        today,
        profile: progress.getProfile(),
        content,
        cards,
        counts: flashcards.countCards(cards, today),
        history: progress.getHistory(),
        streak: progress.getStreak(today),
        lesson: progress.getTodayLesson(today) ?? null,
      });
    })();
    try {
      await hydrating;
    } finally {
      hydrating = null;
    }
  },

  refresh: () => {
    const { content, today } = get();
    if (!content) return;
    const cards = flashcards.getCards(content, today);
    set({
      profile: progress.getProfile(),
      cards,
      counts: flashcards.countCards(cards, today),
      history: progress.getHistory(),
      streak: progress.getStreak(today),
      lesson: progress.getTodayLesson(today) ?? null,
    });
  },

  updateProfile: async (patch) => {
    const { today, profile } = get();
    const next = progress.updateProfile(patch);
    if (!profile || next.language !== profile.language || !get().content) {
      await progress.ensureLanguageSeeded(next.language, today);
      const content = await loadContent(next.language);
      set({ content });
    }
    get().refresh();
  },

  gradeCard: (cardId, grade) => {
    const { today } = get();
    const next = flashcards.gradeCard(cardId, grade, today);
    set((s) => {
      const cards = s.cards.map((c) => (c.id === cardId ? { ...c, ...next } : c));
      return { cards, counts: flashcards.countCards(cards, today) };
    });
    return next;
  },

  startLesson: () => {
    const { content, profile, today } = get();
    if (!content || !profile) throw new Error("not hydrated");
    const existing = progress.getTodayLesson(today);
    if (existing && existing.status !== "complete") return existing;
    const plan = buildDailyPlan(content, profile.level, today);
    const lesson = createLesson(profile, plan, today);
    progress.saveTodayLesson(lesson);
    set({ lesson });
    return lesson;
  },

  dispatch: (event) => {
    const { lesson } = get();
    if (!lesson) return;
    const next = lessonReducer(lesson, event);
    if (next === lesson) return;
    set({ lesson: next });
    if (event.type === "TICK") {
      tickCounter = (tickCounter + 1) % 10;
      if (tickCounter !== 0) return;
    }
    progress.saveTodayLesson(next);
  },

  completeLesson: () => {
    const { lesson, content, today } = get();
    if (!lesson || !content) throw new Error("no lesson");
    const now = new Date().toISOString();
    const done = lesson.status === "complete" ? lesson : lessonReducer(lesson, { type: "COMPLETE", at: now });
    const scenario = content.scenarioById.get(lesson.plan.scenarioId)!;
    const summary =
      done.conversation.summary ??
      mockSummary({ language: lesson.language, level: lesson.level, scenario, transcript: done.conversation.transcript });
    const record: DayRecord = {
      date: today,
      status: "complete",
      language: lesson.language,
      lessonLength: lesson.lessonLength,
      flashcards: done.flashcards.stats,
      conversation: { scenarioId: scenario.id, transcript: done.conversation.transcript, summary },
      grammarRuleId: lesson.plan.grammarRuleId,
      notebook: done.notebook.grade
        ? { taskId: lesson.plan.writingTaskId, photo: done.notebook.photo ?? "placeholder:1", grade: done.notebook.grade }
        : undefined,
      completedAt: now,
    };
    progress.saveDay(record);
    progress.saveTodayLesson({ ...done, status: "complete", completedAt: now });
    get().refresh();
    return record;
  },

  abandonLesson: () => {
    progress.clearTodayLesson();
    set({ lesson: null });
  },

  resetDemo: async () => {
    const today = todayISO();
    await progress.resetDemo(today);
    const prof = progress.getProfile();
    const content = await loadContent(prof.language);
    set({ content, today, demoMode: false });
    get().refresh();
  },

  setDemoMode: (on) => set({ demoMode: on }),
  setSpeaking: (on) => set({ speaking: on }),
}));
