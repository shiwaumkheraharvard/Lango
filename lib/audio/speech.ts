"use client";

import type { Language } from "@/data/types";
import { LANGUAGE_META } from "@/data/index";
import { synthesize } from "@/services/speech";

interface SpeakOptions {
  muted?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
}

let currentAudio: HTMLAudioElement | null = null;
let currentUrl: string | null = null;

/** Stop whatever is playing (API audio or browser speech). */
export function stopSpeaking() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (currentUrl) {
    URL.revokeObjectURL(currentUrl);
    currentUrl = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}

/**
 * Speak a tutor line. Uses the /api/tts mp3 when available, otherwise the browser's
 * speechSynthesis with the right language voice. Resolves when playback ends.
 */
export async function speakText(text: string, language: Language, opts: SpeakOptions = {}): Promise<void> {
  if (opts.muted || typeof window === "undefined") return;
  stopSpeaking();
  const blob = await synthesize(text, language);
  if (blob) {
    await new Promise<void>((resolve) => {
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      currentAudio = audio;
      currentUrl = url;
      audio.onplay = () => opts.onStart?.();
      const done = () => {
        opts.onEnd?.();
        if (currentAudio === audio) {
          currentAudio = null;
          URL.revokeObjectURL(url);
          currentUrl = null;
        }
        resolve();
      };
      audio.onended = done;
      audio.onerror = done;
      audio.play().catch(done);
    });
    return;
  }
  if (!("speechSynthesis" in window)) return;
  await new Promise<void>((resolve) => {
    const utter = new SpeechSynthesisUtterance(text);
    const locale = LANGUAGE_META[language].locale;
    utter.lang = locale;
    utter.rate = 0.95;
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((v) => v.lang.replace("_", "-").toLowerCase().startsWith(language)) ?? null;
    if (voice) utter.voice = voice;
    utter.onstart = () => opts.onStart?.();
    const done = () => {
      opts.onEnd?.();
      resolve();
    };
    utter.onend = done;
    utter.onerror = done;
    window.speechSynthesis.speak(utter);
    // Safari sometimes never fires onend for cancelled utterances; guard with a timeout.
    setTimeout(done, Math.min(20000, 1500 + text.length * 90));
  });
}

/** Warm the voice list (Chrome loads it async). */
export function warmVoices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}
