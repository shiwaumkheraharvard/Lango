import { NextResponse } from "next/server";
import { loadContent } from "@/data/index";
import type { Language } from "@/data/types";
import { hasOpenAI, openaiClient } from "@/lib/server/ai";
import { mockTranscription } from "@/services/mock/tutor";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const language = (form.get("language") === "es" ? "es" : "ru") as Language;
  const scenarioId = String(form.get("scenarioId") ?? "");
  const turnIndex = Number(form.get("turnIndex") ?? 0);
  const audio = form.get("audio");

  async function mock() {
    const content = await loadContent(language);
    return NextResponse.json({ text: mockTranscription(language, content.scenarioById.get(scenarioId), turnIndex), mock: true });
  }

  if (!hasOpenAI() || !(audio instanceof Blob) || audio.size === 0) return mock();

  try {
    const name = audio instanceof File && audio.name ? audio.name : audio.type.includes("mp4") ? "turn.mp4" : "turn.webm";
    const file = new File([audio], name, { type: audio.type || "audio/webm" });
    const result = await openaiClient().audio.transcriptions.create({
      file,
      model: "whisper-1",
      language,
      response_format: "json",
      temperature: 0,
    });
    const text = result.text?.trim();
    if (!text) return mock();
    return NextResponse.json({ text, mock: false });
  } catch (err) {
    console.error("[stt] falling back to mock:", err);
    return mock();
  }
}
