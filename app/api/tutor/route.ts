import { NextResponse } from "next/server";
import { z } from "zod";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { loadContent } from "@/data/index";
import type { ChatMessage, Language, Level } from "@/data/types";
import { anthropicClient, hasAnthropic, LANGUAGE_NAME, LEVEL_DESCRIPTION, TUTOR_MODEL } from "@/lib/server/ai";
import { mockSummary, mockTutorReply } from "@/services/mock/tutor";

export const runtime = "nodejs";
export const maxDuration = 60;

const Body = z.object({
  mode: z.enum(["turn", "summary"]),
  language: z.enum(["ru", "es"]),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  scenarioId: z.string(),
  transcript: z.array(
    z.object({
      id: z.string(),
      role: z.enum(["tutor", "user"]),
      text: z.string(),
      note: z.string().optional(),
      viaVoice: z.boolean().optional(),
      createdAt: z.string(),
    }),
  ),
});

const TurnSchema = z.object({
  reply: z.string().describe("The tutor's next line in the target language. One short sentence or question, two at most."),
  note: z.string().describe("A tiny English side-note for the learner: at most one gentle correction of their last message, or specific praise. Max 15 words."),
});

const SummarySchema = z.object({
  turns: z.number().int(),
  targetWordsUsed: z.array(z.string()),
  targetWordsMissed: z.array(z.string()),
  corrections: z
    .array(z.object({ said: z.string(), better: z.string(), why: z.string() }))
    .describe("Exactly two corrections drawn from what the learner actually said. If they made fewer than two mistakes, use upgrades to more natural phrasing."),
  sayThisBetter: z.object({ original: z.string(), better: z.string() }),
  praise: z.string().describe("One warm, specific English sentence about what went well."),
});

function systemPrompt(language: Language, level: Level, scenario: { title: string; goal: string; targetWords: string[] }) {
  const lang = LANGUAGE_NAME[language];
  return `You are Polo, a friendly, slightly confused polar bear who tutors ${lang} inside the Lango app.

Rules for the conversation:
- Reply ONLY in ${lang}. Never switch to English in "reply". ${language === "ru" ? "Use proper Cyrillic and ё where it belongs." : "Use proper accents, ñ and opening ¿ ¡. Neutral Spanish; never vosotros."}
- Match the learner's level: ${LEVEL_DESCRIPTION[level]}.
- One short sentence or question per turn (two at most). Always keep the conversation going toward the scenario goal, and gently steer the learner toward the target words.
- Never lecture, never explain grammar mid-conversation, never list options. Corrections go only in the English "note" field, one per turn maximum, and only when the learner's last message had a real mistake. Otherwise the note is short, specific praise.
- Stay in character: warm, curious, a little goofy, never sarcastic.

Scenario: "${scenario.title}". Goal for the learner: ${scenario.goal}
Target words/structures: ${scenario.targetWords.join(", ")}`;
}

function toMessages(transcript: ChatMessage[]) {
  const msgs = transcript.map((m) => ({ role: m.role === "user" ? ("user" as const) : ("assistant" as const), content: m.text }));
  // The API needs the first message to be from the user; the tutor's opening is folded into the system context instead.
  while (msgs.length && msgs[0].role === "assistant") msgs.shift();
  return msgs;
}

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const { mode, language, level, scenarioId, transcript } = parsed.data;
  const content = await loadContent(language);
  const scenario = content.scenarioById.get(scenarioId);
  if (!scenario) return NextResponse.json({ error: "unknown scenario" }, { status: 404 });
  const ctx = { language, level, scenario, transcript: transcript as ChatMessage[] };

  if (!hasAnthropic()) {
    return NextResponse.json({ ...(mode === "turn" ? mockTutorReply(ctx) : mockSummary(ctx)), mock: true });
  }

  try {
    const client = anthropicClient();
    const system = systemPrompt(language, level, scenario) + `\n\nThe conversation so far opened with your line: "${scenario.opening}"`;
    const messages = toMessages(ctx.transcript);
    if (messages.length === 0) messages.push({ role: "user", content: "(The learner is ready to start.)" });

    if (mode === "turn") {
      const res = await client.beta.messages.parse({
        model: TUTOR_MODEL,
        max_tokens: 1024,
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        output_config: { effort: "low", format: betaZodOutputFormat(TurnSchema) },
        system,
        messages,
      });
      if (res.stop_reason === "refusal" || !res.parsed_output) throw new Error("no output");
      return NextResponse.json({ ...res.parsed_output, mock: false });
    }

    const res = await client.beta.messages.parse({
      model: TUTOR_MODEL,
      max_tokens: 2048,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium", format: betaZodOutputFormat(SummarySchema) },
      system:
        systemPrompt(language, level, scenario) +
        `\n\nThe conversation is over. Produce the end-of-conversation summary as JSON. "turns" is the number of learner messages. Judge target-word use leniently (inflected forms count). Corrections and "sayThisBetter" must quote the learner's real words in ${LANGUAGE_NAME[language]}; "why" is English.`,
      messages: [
        ...messages,
        { role: "user", content: `Transcript:\n${ctx.transcript.map((m) => `${m.role === "user" ? "Learner" : "Polo"}: ${m.text}`).join("\n")}\n\nNow write the summary.` },
      ],
    });
    if (res.stop_reason === "refusal" || !res.parsed_output) throw new Error("no output");
    return NextResponse.json({ ...res.parsed_output, mock: false });
  } catch (err) {
    console.error("[tutor] falling back to mock:", err);
    return NextResponse.json({ ...(mode === "turn" ? mockTutorReply(ctx) : mockSummary(ctx)), mock: true });
  }
}
