import type { Sm2Grade, Sm2State } from "@/data/types";
import { addDays } from "./dates";

export const MIN_EASE = 1.3;
export const INITIAL_EASE = 2.5;

/** UI buttons → SM-2 quality grades. */
export const GRADE_BUTTONS = {
  again: 1,
  hard: 3,
  good: 4,
  easy: 5,
} as const satisfies Record<string, Sm2Grade>;

export type GradeButton = keyof typeof GRADE_BUTTONS;

export function newCardState(today: string): Sm2State {
  return { easeFactor: INITIAL_EASE, interval: 0, repetitions: 0, dueDate: today };
}

/** Ease-factor update, identical for every grade (SM-2 step 5). */
export function nextEase(ease: number, grade: Sm2Grade): number {
  const q = 5 - grade;
  const next = ease + (0.1 - q * (0.08 + q * 0.02));
  return Math.max(MIN_EASE, round2(next));
}

/** Interval (days) that a given grade would produce from the current state, without mutating it. */
export function previewInterval(state: Sm2State, grade: Sm2Grade): number {
  if (grade < 3) return 1;
  if (state.repetitions === 0) return 1;
  if (state.repetitions === 1) return 6;
  return Math.max(1, Math.round(state.interval * state.easeFactor));
}

/**
 * Standard SM-2 (SuperMemo 2) review.
 * - q >= 3: interval 1 → 6 → round(prev × EF); repetitions++
 * - q <  3: repetitions = 0, interval = 1
 * - EF' = EF + (0.1 − (5 − q)(0.08 + (5 − q)·0.02)), floor 1.3
 */
export function review(state: Sm2State, grade: Sm2Grade, today: string): Sm2State {
  let { interval, repetitions } = state;
  if (grade >= 3) {
    interval = previewInterval(state, grade);
    repetitions += 1;
  } else {
    repetitions = 0;
    interval = 1;
  }
  const easeFactor = nextEase(state.easeFactor, grade);
  return {
    easeFactor,
    interval,
    repetitions,
    dueDate: addDays(today, interval),
    lastReviewed: today,
  };
}

export function isDue(state: Sm2State, today: string): boolean {
  return state.dueDate <= today;
}

export function isNew(state: Sm2State): boolean {
  return state.repetitions === 0 && !state.lastReviewed;
}

/** "Learned" for display purposes: survived at least 3 reviews with a 3-week+ interval. */
export function isLearned(state: Sm2State): boolean {
  return state.repetitions >= 3 && state.interval >= 21;
}

export function describeInterval(days: number): string {
  if (days <= 0) return "today";
  if (days === 1) return "tomorrow";
  if (days < 30) return `in ${days} days`;
  const months = Math.round(days / 30);
  return months === 1 ? "in a month" : `in ${months} months`;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
