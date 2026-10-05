/**
 * Speech service: speech-to-text (/api/stt → Whisper) and text-to-speech (/api/tts → OpenAI "alloy").
 * In mock mode STT returns a scripted learner line and TTS returns null so the caller uses the
 * browser's speechSynthesis.
 */
import type { ConversationScenario, Language } from "@/data/types";
import { mockTranscription } from "./mock/tutor";

export interface TranscribeOptions {
  language: Language;
  scenario?: ConversationScenario;
  /** Zero-based index of the learner turn being recorded (used by the mock). */
  turnIndex: number;
}

export async function transcribe(blob: Blob, opts: TranscribeOptions): Promise<{ text: string; mock: boolean }> {
  try {
    const form = new FormData();
    const ext = blob.type.includes("mp4") ? "mp4" : blob.type.includes("ogg") ? "ogg" : "webm";
    form.append("audio", blob, `turn.${ext}`);
    form.append("language", opts.language);
    form.append("scenarioId", opts.scenario?.id ?? "");
    form.append("turnIndex", String(opts.turnIndex));
    const res = await fetch("/api/stt", { method: "POST", body: form });
    if (!res.ok) throw new Error(`stt ${res.status}`);
    const data = (await res.json()) as { text: string; mock?: boolean };
    return { text: data.text, mock: !!data.mock };
  } catch {
    return { text: mockTranscription(opts.language, opts.scenario, opts.turnIndex), mock: true };
  }
}

const ttsCache = new Map<string, Blob | null>();

/** Returns an mp3 blob, or null when the server is in mock mode (use speechSynthesis). */
export async function synthesize(text: string, language: Language): Promise<Blob | null> {
  const key = `${language}:${text}`;
  if (ttsCache.has(key)) return ttsCache.get(key)!;
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text, language }),
    });
    if (res.status === 204 || res.headers.get("x-lango-mock") === "1") {
      ttsCache.set(key, null);
      return null;
    }
    if (!res.ok) throw new Error(`tts ${res.status}`);
    const blob = await res.blob();
    ttsCache.set(key, blob);
    return blob;
  } catch {
    ttsCache.set(key, null);
    return null;
  }
}
