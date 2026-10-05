"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Keyboard, Mic, Send, Square, Volume2, VolumeX } from "lucide-react";
import type { ChatMessage, ConversationScenario, ConversationSummary, LessonProgress } from "@/data/types";
import { Recorder, recordingSupported } from "@/lib/audio/recorder";
import { speakText, stopSpeaking, warmVoices } from "@/lib/audio/speech";
import type { LessonEvent } from "@/lib/lesson-engine";
import { conversation, speech } from "@/services";
import { useAppStore } from "@/store/useAppStore";
import { Polo } from "@/components/polo/Polo";
import { Button } from "@/components/ui/Button";
import { Waveform } from "@/components/ui/Waveform";

interface Props {
  lesson: LessonProgress;
  scenario: ConversationScenario;
  dispatch: (e: LessonEvent) => void;
  onDone: () => void;
  muted: boolean;
  onToggleMute: () => void;
}

let idCounter = 0;
const mkId = () => `${Date.now().toString(36)}-${(idCounter++).toString(36)}`;

export function ConversationBlock({ lesson, scenario, dispatch, onDone, muted, onToggleMute }: Props) {
  const setDemoMode = useAppStore((s) => s.setDemoMode);
  const transcript = lesson.conversation.transcript;
  const summary = lesson.conversation.summary;
  const timeUp = lesson.blocks[lesson.blockIndex].timeUp;

  const [recording, setRecording] = useState(false);
  const [levels, setLevels] = useState<number[]>(Array(24).fill(0));
  const [thinking, setThinking] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [textMode, setTextMode] = useState(false);
  const [draft, setDraft] = useState("");
  const [summarizing, setSummarizing] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const recorderRef = useRef<Recorder | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const openedRef = useRef(false);
  const language = lesson.language;

  const say = useCallback(
    (text: string) =>
      speakText(text, language, {
        muted,
        onStart: () => setSpeaking(true),
        onEnd: () => setSpeaking(false),
      }),
    [language, muted],
  );

  // Tutor opens the conversation.
  useEffect(() => {
    warmVoices();
    if (transcript.length === 0 && !openedRef.current) {
      openedRef.current = true;
      const msg: ChatMessage = { id: mkId(), role: "tutor", text: scenario.opening, createdAt: new Date().toISOString() };
      dispatch({ type: "MESSAGE", message: msg });
      void say(scenario.opening);
    }
    return () => stopSpeaking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [transcript.length, thinking, summary]);

  const userTurns = transcript.filter((m) => m.role === "user").length;

  const sendUser = useCallback(
    async (text: string, viaVoice: boolean) => {
      const clean = text.trim();
      if (!clean) return;
      const userMsg: ChatMessage = { id: mkId(), role: "user", text: clean, viaVoice, createdAt: new Date().toISOString() };
      const nextTranscript = [...transcript, userMsg];
      dispatch({ type: "MESSAGE", message: userMsg });
      setThinking(true);
      const reply = await conversation.tutorTurn({ language, level: lesson.level, scenario, transcript: nextTranscript });
      if (reply.mock) setDemoMode(true);
      setThinking(false);
      const tutorMsg: ChatMessage = { id: mkId(), role: "tutor", text: reply.reply, note: reply.note, createdAt: new Date().toISOString() };
      dispatch({ type: "MESSAGE", message: tutorMsg });
      void say(reply.reply);
    },
    [dispatch, language, lesson.level, say, scenario, setDemoMode, transcript],
  );

  async function toggleRecord() {
    if (recording) {
      const rec = recorderRef.current;
      recorderRef.current = null;
      setRecording(false);
      if (!rec) return;
      const blob = await rec.stop();
      setThinking(true);
      const { text, mock } = await speech.transcribe(blob, { language, scenario, turnIndex: userTurns });
      if (mock) setDemoMode(true);
      setThinking(false);
      await sendUser(text, true);
      return;
    }
    if (!recordingSupported()) {
      setTextMode(true);
      setMicError("Recording isn't available in this browser — type instead.");
      return;
    }
    try {
      stopSpeaking();
      const rec = new Recorder(setLevels);
      await rec.start();
      recorderRef.current = rec;
      setMicError(null);
      setRecording(true);
    } catch {
      setMicError("Microphone blocked. Allow access or type your reply.");
      setTextMode(true);
    }
  }

  async function wrapUp() {
    stopSpeaking();
    if (recorderRef.current) {
      recorderRef.current.cancel();
      recorderRef.current = null;
      setRecording(false);
    }
    setSummarizing(true);
    const s = await conversation.summarizeConversation({ language, level: lesson.level, scenario, transcript });
    if (s.mock) setDemoMode(true);
    const { mock: _m, ...rest } = s;
    void _m;
    dispatch({ type: "SUMMARY", summary: rest as ConversationSummary });
    setSummarizing(false);
  }

  const usedWords = new Set(
    scenario.targetWords.filter((w) => transcript.some((m) => m.role === "user" && m.text.toLowerCase().includes(w.toLowerCase().slice(0, 4)))),
  );

  const pose = recording ? "listen" : speaking ? "talk" : "idle";

  if (summary) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto w-full max-w-xl">
        <div className="flex items-center gap-3">
          <Polo pose="celebrate" size={88} />
          <div>
            <p className="text-sm font-semibold text-orange-deep">Conversation summary</p>
            <h2 className="text-2xl font-bold tracking-tighter">{summary.praise}</h2>
          </div>
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-3">
          <div className="card p-4">
            <dt className="text-xs font-semibold text-warm">Turns taken</dt>
            <dd className="text-3xl font-bold tracking-tightest">{summary.turns}</dd>
          </div>
          <div className="card p-4">
            <dt className="text-xs font-semibold text-warm">Target words used</dt>
            <dd className="text-3xl font-bold tracking-tightest">
              {summary.targetWordsUsed.length}
              <span className="text-base text-warm"> / {scenario.targetWords.length}</span>
            </dd>
          </div>
        </dl>
        <div className="card mt-3 p-4">
          <p className="text-xs font-semibold text-warm">Target words</p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {scenario.targetWords.map((w) => {
              const used = summary.targetWordsUsed.includes(w);
              return (
                <li key={w} lang={language} className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-semibold ${used ? "bg-ink text-white" : "bg-orange-soft text-warm line-through decoration-warm/50"}`}>
                  {used && <Check className="h-3.5 w-3.5" aria-hidden />}
                  {w}
                </li>
              );
            })}
          </ul>
        </div>
        <div className="card mt-3 p-4">
          <p className="text-xs font-semibold text-warm">Two corrections</p>
          <ul className="mt-2 space-y-3">
            {summary.corrections.map((c, i) => (
              <li key={i}>
                <p lang={language} className="text-sm text-warm line-through decoration-[#B42318]/60">{c.said}</p>
                <p lang={language} className="font-display text-lg font-semibold tracking-tight">{c.better}</p>
                <p className="text-sm text-warm">{c.why}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-3 rounded-2xl bg-ink p-4 text-white">
          <p className="text-xs font-semibold text-white/60">Say this better</p>
          <p lang={language} className="mt-1 text-sm text-white/60 line-through">{summary.sayThisBetter.original}</p>
          <p lang={language} className="font-display text-xl font-semibold tracking-tight text-orange">{summary.sayThisBetter.better}</p>
        </div>
        <Button size="xl" full className="mt-5" onClick={onDone}>
          Continue to grammar
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-xl flex-col">
      {/* scenario header */}
      <div className="flex items-start gap-3">
        <motion.div animate={{ scale: speaking ? 1.04 : 1 }} className="shrink-0">
          <Polo pose={pose} talking={speaking} size={84} />
        </motion.div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold tracking-tighter">{scenario.title}</h2>
          <p className="text-sm text-warm">{scenario.goal}</p>
          <ul className="no-scrollbar mt-2 flex gap-1.5 overflow-x-auto pb-1" aria-label="Target words">
            {scenario.targetWords.map((w) => (
              <li key={w} lang={language} className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${usedWords.has(w) ? "bg-ink text-white" : "bg-orange-soft text-orange-deep"}`}>
                {usedWords.has(w) ? "✓ " : ""}
                {w}
              </li>
            ))}
          </ul>
        </div>
        <button type="button" onClick={onToggleMute} aria-pressed={muted} aria-label={muted ? "Unmute tutor" : "Mute tutor"} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-ink shadow-soft hover:bg-orange-soft">
          {muted ? <VolumeX className="h-5 w-5" aria-hidden /> : <Volume2 className="h-5 w-5" aria-hidden />}
        </button>
      </div>

      {/* transcript */}
      <div ref={listRef} className="mt-4 flex-1 space-y-3 overflow-y-auto rounded-3xl bg-orange-mist p-4" role="log" aria-live="polite" aria-label="Conversation">
        <AnimatePresence initial={false}>
          {transcript.map((m) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] ${m.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                <div lang={language} className={`rounded-2xl px-4 py-2.5 text-[16px] leading-snug shadow-soft ${m.role === "user" ? "rounded-br-md bg-orange-deep text-white" : "rounded-bl-md bg-white text-ink"}`}>
                  {m.text}
                </div>
                {m.role === "tutor" && m.note && <p className="mt-1 max-w-[95%] px-1 text-xs text-warm">{m.note}</p>}
                {m.role === "tutor" && (
                  <button type="button" onClick={() => void say(m.text)} className="mt-0.5 flex items-center gap-1 px-1 text-[11px] font-semibold text-orange-deep hover:underline" aria-label="Replay">
                    <Volume2 className="h-3 w-3" aria-hidden /> Replay
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {thinking && (
          <div className="flex justify-start">
            <div className="flex gap-1 rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-soft" aria-label="Polo is thinking">
              {[0, 1, 2].map((i) => (
                <motion.span key={i} className="h-2 w-2 rounded-full bg-orange" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.12 }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* input */}
      <div className="mt-3">
        {micError && <p className="mb-2 text-center text-xs font-medium text-warm">{micError}</p>}
        {timeUp && (
          <p className="mb-2 text-center text-xs font-semibold text-orange-deep" role="status">
            Time's up for talking — wrap up when you're ready.
          </p>
        )}
        {textMode ? (
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const t = draft;
              setDraft("");
              void sendUser(t, false);
            }}
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              lang={language}
              placeholder={language === "ru" ? "Напишите ответ…" : "Escribe tu respuesta…"}
              className="h-12 flex-1 rounded-2xl border border-line bg-white px-4 text-[16px] outline-none focus:border-orange"
              aria-label="Your reply"
              autoComplete="off"
            />
            <Button type="submit" size="md" aria-label="Send" disabled={!draft.trim() || thinking}>
              <Send className="h-4 w-4" aria-hidden />
            </Button>
            <Button type="button" variant="ghost" size="md" aria-label="Use microphone" onClick={() => setTextMode(false)}>
              <Mic className="h-5 w-5" aria-hidden />
            </Button>
            <Button type="button" variant={timeUp ? "dark" : "ghost"} size="md" onClick={() => void wrapUp()} disabled={summarizing || userTurns === 0}>
              {summarizing ? "…" : "Wrap up"}
            </Button>
          </form>
        ) : (
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" size="md" aria-label="Type instead" onClick={() => setTextMode(true)}>
              <Keyboard className="h-5 w-5" aria-hidden />
            </Button>
            <div className="relative flex flex-1 flex-col items-center">
              <Waveform levels={levels} active={recording} className="absolute -top-14 left-0 right-0" />
              <motion.button
                type="button"
                onClick={() => void toggleRecord()}
                disabled={thinking || summarizing}
                whileTap={{ scale: 0.94 }}
                aria-pressed={recording}
                aria-label={recording ? "Stop recording" : "Record your reply"}
                className={`relative grid h-20 w-20 place-items-center rounded-full text-white shadow-orange transition-colors disabled:opacity-60 ${recording ? "bg-ink" : "bg-orange-deep hover:bg-[#d95500]"}`}
              >
                {recording && <span className="absolute inset-0 rounded-full bg-ink/40 animate-pulseRing" aria-hidden />}
                {recording ? <Square className="h-7 w-7 fill-current" aria-hidden /> : <Mic className="h-8 w-8" aria-hidden />}
              </motion.button>
              <span className="mt-1.5 text-xs font-semibold text-warm">{recording ? "Listening… tap to send" : "Tap to speak"}</span>
            </div>
            <Button type="button" variant={timeUp ? "dark" : "ghost"} size="md" onClick={() => void wrapUp()} disabled={summarizing || userTurns === 0}>
              {summarizing ? "…" : "Wrap up"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
