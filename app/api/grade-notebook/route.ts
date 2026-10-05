import { NextResponse } from "next/server";
import { z } from "zod";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { loadContent } from "@/data/index";
import { anthropicClient, hasAnthropic, LANGUAGE_NAME, TUTOR_MODEL } from "@/lib/server/ai";
import { mockNotebookGrade } from "@/services/mock/grade";

export const runtime = "nodejs";
export const maxDuration = 60;

const Body = z.object({
  image: z.string().startsWith("data:image/"),
  taskId: z.string(),
  language: z.enum(["ru", "es"]),
  level: z.enum(["beginner", "intermediate", "advanced"]),
});

const GradeSchema = z.object({
  transcription: z.array(z.string()).describe("Each handwritten sentence as you read it, in order, in the target language. Keep the learner's spelling, including mistakes."),
  scores: z.array(
    z.object({
      sentence: z.string(),
      correct: z.boolean(),
      issue: z.string().optional().describe("English: what is wrong, one short sentence."),
      fix: z.string().optional().describe("The corrected sentence or phrase in the target language."),
    }),
  ),
  overall: z.number().int().min(1).max(5),
  encouragement: z.string().describe("One or two warm English sentences in Polo's voice (a slightly goofy polar bear tutor)."),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const { image, taskId, language, level } = parsed.data;
  const content = await loadContent(language);
  const task = content.taskById.get(taskId);
  if (!task) return NextResponse.json({ error: "unknown task" }, { status: 404 });

  if (!hasAnthropic()) return NextResponse.json({ ...mockNotebookGrade(task, language, String(image.length)), mock: true });

  try {
    const [head, data] = image.split(",");
    const mediaType = (head.match(/data:(.*?);/)?.[1] ?? "image/jpeg") as "image/jpeg" | "image/png" | "image/webp" | "image/gif";
    const lang = LANGUAGE_NAME[language];
    const res = await anthropicClient().beta.messages.parse({
      model: TUTOR_MODEL,
      max_tokens: 2048,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium", format: betaZodOutputFormat(GradeSchema) },
      system: `You are Polo, a kind polar bear tutor grading a ${lang} learner's handwritten notebook page (level: ${level}).
Be forgiving about legibility: if a letter is ambiguous, assume the learner meant the correct one. Be strict about grammar, spelling that changes meaning, case endings, verb forms, accents and agreement.
Transcribe every sentence you can see, in order. Compare each to the task's model answer, but accept any correct, natural alternative that satisfies the prompt. Mark "correct" false only for real errors, and give a short English "issue" plus the corrected ${lang} "fix". "overall" is 1–5: 5 = all correct, 4 = one small slip, 3 = a couple of errors, 2 = most sentences flawed, 1 = unreadable or off-task.`,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data } },
            {
              type: "text",
              text: `Task instruction: ${task.instruction}\n\nExpected sentences:\n${task.sentences.map((s, i) => `${i + 1}. Prompt: ${s.prompt}\n   Model answer: ${s.model}`).join("\n")}\n\nGrade the page.`,
            },
          ],
        },
      ],
    });
    if (res.stop_reason === "refusal" || !res.parsed_output) throw new Error("no output");
    return NextResponse.json({ ...res.parsed_output, mock: false });
  } catch (err) {
    console.error("[grade-notebook] falling back to mock:", err);
    return NextResponse.json({ ...mockNotebookGrade(task, language, String(image.length)), mock: true });
  }
}
