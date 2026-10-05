import type { ChatMessage, ConversationScenario, ConversationSummary, Language, Level } from "@/data/types";
import { hashString, pick, seededRandom } from "@/lib/seeded";
import { CORRECTIONS, MOCK_USER_LINES, PRAISE, SAY_THIS_BETTER, TUTOR_CLOSING, TUTOR_FOLLOWUPS } from "./pools";

export interface TutorContext {
  language: Language;
  level: Level;
  scenario: ConversationScenario;
  transcript: ChatMessage[];
}

/** Scripted reply: follow the scenario's example turns, then generic follow-ups. */
export function mockTutorReply(ctx: TutorContext): { reply: string; note: string } {
  const userTurns = ctx.transcript.filter((m) => m.role === "user").length;
  const idx = userTurns - 1;
  const turns = ctx.scenario.exampleTurns;
  if (idx >= 0 && idx < turns.length) {
    return { reply: turns[idx].tutor, note: turns[idx].note };
  }
  const rand = seededRandom(hashString(`${ctx.scenario.id}-${userTurns}`));
  const followups = TUTOR_FOLLOWUPS[ctx.language];
  const reply = followups[(userTurns - turns.length - 1 + followups.length) % followups.length];
  const lastUser = [...ctx.transcript].reverse().find((m) => m.role === "user");
  const used = ctx.scenario.targetWords.find((w) => lastUser?.text.toLowerCase().includes(w.toLowerCase().slice(0, 4)));
  const note = used ? `Nice — you used «${used}».` : pick(rand, PRAISE);
  return { reply, note };
}

export function mockClosingLine(language: Language): string {
  return TUTOR_CLOSING[language];
}

export function mockSummary(ctx: TutorContext): ConversationSummary {
  const rand = seededRandom(hashString(`${ctx.scenario.id}-summary`));
  const userMessages = ctx.transcript.filter((m) => m.role === "user");
  const userText = userMessages.map((m) => m.text.toLowerCase()).join(" ");
  const used = ctx.scenario.targetWords.filter((w) => userText.includes(w.toLowerCase().slice(0, 4)));
  const missed = ctx.scenario.targetWords.filter((w) => !used.includes(w));
  const pool = CORRECTIONS[ctx.language][ctx.level];
  const start = Math.floor(rand() * pool.length);
  const corrections = [pool[start % pool.length], pool[(start + 1) % pool.length]];
  return {
    turns: userMessages.length,
    targetWordsUsed: used,
    targetWordsMissed: missed,
    corrections,
    sayThisBetter: pick(rand, SAY_THIS_BETTER[ctx.language][ctx.level]),
    praise: pick(rand, PRAISE),
  };
}

/** Mock speech-to-text: return the scripted learner line for this turn, else a generic one. */
export function mockTranscription(language: Language, scenario: ConversationScenario | undefined, turnIndex: number): string {
  if (scenario && turnIndex < scenario.exampleTurns.length) return scenario.exampleTurns[turnIndex].user;
  const lines = MOCK_USER_LINES[language];
  return lines[turnIndex % lines.length];
}
