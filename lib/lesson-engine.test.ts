import { describe, expect, it } from "vitest";
import type { DailyPlan, UserProfile } from "@/data/types";
import { BLOCK_BUDGETS, createLesson, currentBlock, lessonReducer, totalRemainingSec } from "./lesson-engine";

const profile: UserProfile = {
  name: "Sam",
  language: "ru",
  level: "intermediate",
  lessonLength: 20,
  reminderTime: "09:00",
  timezone: "America/New_York",
  muteTutor: false,
  onboarded: true,
};
const plan: DailyPlan = { scenarioId: "s", grammarRuleId: "g", writingTaskId: "w" };
const AT = "2026-10-04T09:00:00";

describe("lesson engine", () => {
  it("budgets sum to the lesson length", () => {
    for (const len of [10, 20, 30] as const) {
      const total = Object.values(BLOCK_BUDGETS[len]).reduce((a, b) => a + b, 0);
      expect(total).toBe(len);
    }
  });

  it("runs blocks in order and completes after the fourth", () => {
    let p = createLesson(profile, plan, "2026-10-04");
    expect(p.blocks.map((b) => b.kind)).toEqual(["flashcards", "conversation", "grammar", "notebook"]);
    p = lessonReducer(p, { type: "START", at: AT });
    expect(p.status).toBe("running");
    for (let i = 0; i < 3; i++) p = lessonReducer(p, { type: "NEXT", at: AT });
    expect(currentBlock(p).kind).toBe("notebook");
    p = lessonReducer(p, { type: "NEXT", at: AT });
    expect(p.status).toBe("complete");
  });

  it("rolls unused time into the next block", () => {
    let p = createLesson(profile, plan, "2026-10-04");
    p = lessonReducer(p, { type: "START", at: AT });
    for (let i = 0; i < 60; i++) p = lessonReducer(p, { type: "TICK" });
    expect(currentBlock(p).remainingSec).toBe(5 * 60 - 60);
    p = lessonReducer(p, { type: "NEXT", at: AT });
    expect(currentBlock(p).kind).toBe("conversation");
    expect(currentBlock(p).remainingSec).toBe(8 * 60 + 4 * 60);
    expect(currentBlock(p).carriedSec).toBe(240);
    expect(totalRemainingSec(p)).toBe(20 * 60 - 60);
  });

  it("flags timeUp at zero and never goes negative", () => {
    let p = createLesson({ ...profile, lessonLength: 10 }, plan, "2026-10-04");
    p = lessonReducer(p, { type: "START", at: AT });
    for (let i = 0; i < 3 * 60 + 5; i++) p = lessonReducer(p, { type: "TICK" });
    expect(currentBlock(p).remainingSec).toBe(0);
    expect(currentBlock(p).timeUp).toBe(true);
  });

  it("tracks flashcard stats by grade", () => {
    let p = createLesson(profile, plan, "2026-10-04");
    p = lessonReducer(p, { type: "FLASHCARD_GRADED", cardId: "a", grade: 1, wasNew: false });
    p = lessonReducer(p, { type: "FLASHCARD_GRADED", cardId: "b", grade: 3, wasNew: false });
    p = lessonReducer(p, { type: "FLASHCARD_GRADED", cardId: "c", grade: 4, wasNew: true });
    p = lessonReducer(p, { type: "FLASHCARD_GRADED", cardId: "d", grade: 5, wasNew: true });
    p = lessonReducer(p, { type: "FLASHCARD_GRADED", cardId: "a", grade: 4, wasNew: false });
    expect(p.flashcards.stats).toEqual({ reviewed: 5, again: 1, hard: 1, good: 2, easy: 1, newLearned: 2 });
    expect(p.flashcards.reviewedCardIds).toEqual(["a", "b", "c", "d"]);
  });
});
