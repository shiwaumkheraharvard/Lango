/**
 * Flashcards service: joins static vocab content with persisted SM-2 state and grades cards.
 * MOCK implementation reads/writes through the progress service (localStorage).
 */
import type { LanguageContent } from "@/data/index";
import type { Sm2Grade, Sm2State, VocabCard } from "@/data/types";
import { isDue, isLearned, isNew, newCardState, review } from "@/lib/sm2";
import { getState } from "./progress";
import { saveState } from "./storage";

export function getCards(content: LanguageContent, today: string): VocabCard[] {
  const state = getState();
  return content.vocab.map((c) => ({ ...c, ...(state.cards[c.id] ?? newCardState(today)) }));
}

export interface CardCounts {
  due: number;
  fresh: number;
  learned: number;
  total: number;
}

export function countCards(cards: VocabCard[], today: string): CardCounts {
  let due = 0;
  let fresh = 0;
  let learned = 0;
  for (const c of cards) {
    if (isNew(c)) fresh += 1;
    else if (isDue(c, today)) due += 1;
    if (isLearned(c)) learned += 1;
  }
  return { due, fresh, learned, total: cards.length };
}

/** Apply an SM-2 grade and persist. Returns the new state. */
export function gradeCard(cardId: string, grade: Sm2Grade, today: string): Sm2State {
  const state = getState();
  const prev = state.cards[cardId] ?? newCardState(today);
  const next = review(prev, grade, today);
  state.cards[cardId] = next;
  saveState(state);
  return next;
}

