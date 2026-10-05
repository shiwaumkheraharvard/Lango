/**
 * Conversation service: tutor turns and end-of-block summaries.
 * Calls /api/tutor (Claude when ANTHROPIC_API_KEY is set, otherwise the server-side mock).
 * If the route itself is unreachable, falls back to the same mock locally.
 */
import type { ChatMessage, ConversationScenario, ConversationSummary, Language, Level } from "@/data/types";
import { mockSummary, mockTutorReply } from "./mock/tutor";

export interface TutorRequest {
  language: Language;
  level: Level;
  scenario: ConversationScenario;
  transcript: ChatMessage[];
}

export interface TutorReply {
  reply: string;
  note: string;
  mock: boolean;
}

export async function tutorTurn(req: TutorRequest): Promise<TutorReply> {
  try {
    const res = await fetch("/api/tutor", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mode: "turn", language: req.language, level: req.level, scenarioId: req.scenario.id, transcript: req.transcript }),
    });
    if (!res.ok) throw new Error(`tutor ${res.status}`);
    const data = (await res.json()) as { reply: string; note: string; mock?: boolean };
    return { reply: data.reply, note: data.note ?? "", mock: !!data.mock };
  } catch {
    return { ...mockTutorReply(req), mock: true };
  }
}

export async function summarizeConversation(req: TutorRequest): Promise<ConversationSummary & { mock: boolean }> {
  try {
    const res = await fetch("/api/tutor", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mode: "summary", language: req.language, level: req.level, scenarioId: req.scenario.id, transcript: req.transcript }),
    });
    if (!res.ok) throw new Error(`tutor ${res.status}`);
    const data = (await res.json()) as ConversationSummary & { mock?: boolean };
    return { ...data, mock: !!data.mock };
  } catch {
    return { ...mockSummary(req), mock: true };
  }
}
