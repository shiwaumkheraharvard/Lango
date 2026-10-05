import type { LanguageContent } from "@/data/index";
import type {
  BlockKind,
  ChatMessage,
  ConversationSummary,
  DailyPlan,
  FlashcardStats,
  LessonBlock,
  LessonLength,
  LessonProgress,
  Level,
  NotebookGrade,
  Sm2Grade,
  UserProfile,
  VocabCard,
} from "@/data/types";
import { daysSinceEpoch } from "./dates";
import { isDue, isNew } from "./sm2";

export const BLOCK_ORDER: BlockKind[] = ["flashcards", "conversation", "grammar", "notebook"];

/** Minutes per block for each lesson length. */
export const BLOCK_BUDGETS: Record<LessonLength, Record<BlockKind, number>> = {
  10: { flashcards: 3, conversation: 4, notebook: 2, grammar: 1 },
  20: { flashcards: 5, conversation: 8, notebook: 5, grammar: 2 },
  30: { flashcards: 7, conversation: 12, notebook: 8, grammar: 3 },
};

export const NEW_CARDS_PER_LESSON: Record<LessonLength, number> = { 10: 5, 20: 8, 30: 12 };
export const MAX_CARDS_PER_LESSON: Record<LessonLength, number> = { 10: 20, 20: 35, 30: 50 };

export const BLOCK_META: Record<BlockKind, { title: string; short: string; blurb: string }> = {
  flashcards: { title: "Flashcards", short: "Cards", blurb: "Spaced repetition on the words that are due." },
  conversation: { title: "Conversation", short: "Talk", blurb: "A real back-and-forth with Polo, out loud." },
  grammar: { title: "Grammar rule", short: "Rule", blurb: "One rule, copied into your notebook." },
  notebook: { title: "Notebook", short: "Write", blurb: "Handwrite a few sentences, snap a photo, get graded." },
};

export function emptyStats(): FlashcardStats {
  return { reviewed: 0, again: 0, hard: 0, good: 0, easy: 0, newLearned: 0 };
}

/** Deterministic daily plan so a refresh mid-lesson yields the same lesson. */
export function buildDailyPlan(content: LanguageContent, level: Level, date: string): DailyPlan {
  const dayIndex = Math.abs(daysSinceEpoch(date));
  const rules = content.grammar.filter((g) => g.level === level);
  const rule = rules[dayIndex % rules.length];
  const tasks = content.writing[level].filter((t) => t.grammarRuleId === rule.id);
  const pool = tasks.length ? tasks : content.writing[level];
  const task = pool[dayIndex % pool.length];
  const scenarios = content.scenarios[level];
  const scenario = scenarios[dayIndex % scenarios.length];
  return { scenarioId: scenario.id, grammarRuleId: rule.id, writingTaskId: task.id };
}

export function createLesson(profile: UserProfile, plan: DailyPlan, date: string): LessonProgress {
  const budgets = BLOCK_BUDGETS[profile.lessonLength];
  const blocks: LessonBlock[] = BLOCK_ORDER.map((kind) => ({
    kind,
    budgetSec: budgets[kind] * 60,
    remainingSec: budgets[kind] * 60,
    carriedSec: 0,
    timeUp: false,
  }));
  return {
    date,
    language: profile.language,
    level: profile.level,
    lessonLength: profile.lessonLength,
    status: "idle",
    blockIndex: 0,
    blocks,
    plan,
    flashcards: { stats: emptyStats(), reviewedCardIds: [], done: false },
    conversation: { transcript: [] },
    notebook: {},
  };
}

export type LessonEvent =
  | { type: "START"; at: string }
  | { type: "TICK" }
  | { type: "NEXT"; at: string }
  | { type: "FLASHCARD_GRADED"; cardId: string; grade: Sm2Grade; wasNew: boolean }
  | { type: "FLASHCARDS_DONE" }
  | { type: "MESSAGE"; message: ChatMessage }
  | { type: "SUMMARY"; summary: ConversationSummary }
  | { type: "PHOTO"; photo: string }
  | { type: "GRADE"; grade: NotebookGrade }
  | { type: "COMPLETE"; at: string };

export function lessonReducer(p: LessonProgress, e: LessonEvent): LessonProgress {
  switch (e.type) {
    case "START": {
      if (p.status !== "idle") return p;
      const blocks = p.blocks.map((b, i) => (i === 0 ? { ...b, startedAt: e.at } : b));
      return { ...p, status: "running", startedAt: e.at, blocks };
    }
    case "TICK": {
      if (p.status !== "running") return p;
      const blocks = p.blocks.map((b, i) => {
        if (i !== p.blockIndex) return b;
        const remainingSec = Math.max(0, b.remainingSec - 1);
        return { ...b, remainingSec, timeUp: remainingSec === 0 };
      });
      return { ...p, blocks };
    }
    case "NEXT": {
      if (p.status !== "running") return p;
      const current = p.blocks[p.blockIndex];
      const carry = current.remainingSec;
      const nextIndex = p.blockIndex + 1;
      const blocks = p.blocks.map((b, i) => {
        if (i === p.blockIndex) return { ...b, remainingSec: 0, endedAt: e.at };
        if (i === nextIndex) return { ...b, remainingSec: b.remainingSec + carry, carriedSec: b.carriedSec + carry, startedAt: e.at };
        return b;
      });
      if (nextIndex >= p.blocks.length) {
        return { ...p, blocks, blockIndex: p.blocks.length - 1, status: "complete", completedAt: e.at };
      }
      return { ...p, blocks, blockIndex: nextIndex };
    }
    case "FLASHCARD_GRADED": {
      const s = { ...p.flashcards.stats };
      s.reviewed += 1;
      if (e.grade < 3) s.again += 1;
      else if (e.grade === 3) s.hard += 1;
      else if (e.grade === 4) s.good += 1;
      else s.easy += 1;
      if (e.wasNew && e.grade >= 3) s.newLearned += 1;
      const reviewedCardIds = p.flashcards.reviewedCardIds.includes(e.cardId)
        ? p.flashcards.reviewedCardIds
        : [...p.flashcards.reviewedCardIds, e.cardId];
      return { ...p, flashcards: { ...p.flashcards, stats: s, reviewedCardIds } };
    }
    case "FLASHCARDS_DONE":
      return { ...p, flashcards: { ...p.flashcards, done: true } };
    case "MESSAGE":
      return { ...p, conversation: { ...p.conversation, transcript: [...p.conversation.transcript, e.message] } };
    case "SUMMARY":
      return { ...p, conversation: { ...p.conversation, summary: e.summary } };
    case "PHOTO":
      return { ...p, notebook: { ...p.notebook, photo: e.photo, grade: undefined } };
    case "GRADE":
      return { ...p, notebook: { ...p.notebook, grade: e.grade } };
    case "COMPLETE":
      return { ...p, status: "complete", completedAt: e.at };
    default:
      return p;
  }
}

export function currentBlock(p: LessonProgress): LessonBlock {
  return p.blocks[Math.min(p.blockIndex, p.blocks.length - 1)];
}

export function totalRemainingSec(p: LessonProgress): number {
  return p.blocks.slice(p.blockIndex).reduce((sum, b) => sum + b.remainingSec, 0);
}

export function totalBudgetSec(p: LessonProgress): number {
  return p.blocks.reduce((sum, b) => sum + b.budgetSec, 0);
}

export function formatClock(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Build the review queue for a session: all due (non-new) cards first, oldest due first,
 * then new cards from the learner's level (then other levels) up to the new-card cap.
 */
export function buildFlashcardQueue(cards: VocabCard[], level: Level, today: string, lessonLength: LessonLength): VocabCard[] {
  const due = cards.filter((c) => !isNew(c) && isDue(c, today)).sort((a, b) => (a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0));
  const newCap = NEW_CARDS_PER_LESSON[lessonLength];
  const levelOrder: Level[] = [level, ...(["beginner", "intermediate", "advanced"] as Level[]).filter((l) => l !== level)];
  const fresh: VocabCard[] = [];
  for (const l of levelOrder) {
    for (const c of cards) {
      if (fresh.length >= newCap) break;
      if (isNew(c) && c.level === l) fresh.push(c);
    }
  }
  const max = MAX_CARDS_PER_LESSON[lessonLength];
  return [...due, ...fresh].slice(0, max);
}
