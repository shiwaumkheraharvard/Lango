import { NextResponse } from "next/server";
import { hasOpenAI, openaiClient } from "@/lib/server/ai";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Text-to-speech for tutor lines. With OPENAI_API_KEY → mp3 from tts-1 voice "alloy".
 * Without it → 204 + x-lango-mock so the client uses the browser's speechSynthesis.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { text?: string; language?: string } | null;
  const text = body?.text?.trim();
  if (!text) return NextResponse.json({ error: "bad request" }, { status: 400 });
  if (!hasOpenAI()) return new Response(null, { status: 204, headers: { "x-lango-mock": "1" } });
  try {
    const speech = await openaiClient().audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text.slice(0, 600),
      response_format: "mp3",
      speed: 0.95,
    });
    const buf = Buffer.from(await speech.arrayBuffer());
    return new Response(buf, { status: 200, headers: { "content-type": "audio/mpeg", "cache-control": "private, max-age=86400" } });
  } catch (err) {
    console.error("[tts] falling back to browser speech:", err);
    return new Response(null, { status: 204, headers: { "x-lango-mock": "1" } });
  }
}
