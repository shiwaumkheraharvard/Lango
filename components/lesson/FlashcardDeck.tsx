"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, Volume2 } from "lucide-react";
import type { Language, Sm2Grade, VocabCard } from "@/data/types";
import { GRADE_BUTTONS, describeInterval, isNew, previewInterval, type GradeButton } from "@/lib/sm2";
import { speakText } from "@/lib/audio/speech";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/Button";

interface Props {
  /** Initial queue (already filtered of reviewed cards when resuming). */
  queue: VocabCard[];
  language: Language;
  muted: boolean;
  /** Called after each grade with the card and whether it was new before grading. */
  onGraded?: (card: VocabCard, grade: Sm2Grade, wasNew: boolean) => void;
  onFinished?: () => void;
  /** When true, finish after the current card instead of continuing. */
  wrapUp?: boolean;
  compact?: boolean;
}

const BUTTONS: { key: GradeButton; label: string; cls: string; shortcut: string }[] = [
  { key: "again", label: "Again", cls: "bg-[#FDECEC] text-[#B42318] hover:bg-[#fbdede]", shortcut: "1" },
  { key: "hard", label: "Hard", cls: "bg-orange-soft text-orange-deep hover:bg-[#ffe6d3]", shortcut: "2" },
  { key: "good", label: "Good", cls: "bg-ink text-white hover:bg-black", shortcut: "3" },
  { key: "easy", label: "Easy", cls: "bg-[#E8F7EE] text-[#176B3A] hover:bg-[#d9f1e3]", shortcut: "4" },
];

export function FlashcardDeck({ queue: initial, language, muted, onGraded, onFinished, wrapUp, compact }: Props) {
  const gradeCard = useAppStore((s) => s.gradeCard);
  const [queue, setQueue] = useState<VocabCard[]>(initial);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [done, setDone] = useState(initial.length === 0);
  const total = useRef(initial.length);
  const finishedRef = useRef(false);

  const card = queue[index];
  const remaining = queue.length - index;
  const dueLeft = useMemo(() => queue.slice(index).filter((c) => !isNew(c)).length, [queue, index]);
  const newLeft = remaining - dueLeft;

  useEffect(() => {
    if (done && !finishedRef.current) {
      finishedRef.current = true;
      onFinished?.();
    }
  }, [done, onFinished]);

  const speak = useCallback(
    (text: string) => {
      void speakText(text, language, { muted });
    },
    [language, muted],
  );

  const grade = useCallback(
    (key: GradeButton) => {
      if (!card) return;
      const g = GRADE_BUTTONS[key];
      const wasNew = isNew(card);
      const next = gradeCard(card.id, g);
      onGraded?.(card, g, wasNew);
      setLastResult(g < 3 ? "Again soon — back at the end of this session" : `Next review ${describeInterval(next.interval)}`);
      setFlipped(false);
      let nextQueue = queue;
      if (g < 3) {
        nextQueue = [...queue, { ...card, ...next }];
        setQueue(nextQueue);
      }
      const nextIndex = index + 1;
      if (nextIndex >= nextQueue.length || wrapUp) {
        setTimeout(() => setDone(true), 350);
      }
      setIndex(nextIndex);
    },
    [card, gradeCard, index, onGraded, queue, wrapUp],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!card || done) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      }
      if (flipped) {
        const b = BUTTONS.find((x) => x.shortcut === e.key);
        if (b) grade(b.key);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [card, done, flipped, grade]);

  if (done || !card) {
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <p className="text-2xl font-bold tracking-tighter">All caught up.</p>
        <p className="mt-1 text-warm">{total.current} card{total.current === 1 ? "" : "s"} reviewed.</p>
      </div>
    );
  }

  const progress = Math.min(index, queue.length) / Math.max(1, queue.length);

  return (
    <div className="flex flex-col">
      {/* counts */}
      <div className="mb-3 flex items-center justify-between text-xs font-semibold text-warm">
        <span className="flex items-center gap-2">
          <span className="rounded-full bg-orange-soft px-2 py-0.5 text-orange-deep">{dueLeft} due</span>
          <span className="rounded-full bg-[#EEF4FF] px-2 py-0.5 text-[#2F55D4]">{newLeft} new</span>
        </span>
        <span>
          {Math.min(index + 1, queue.length)} / {queue.length}
        </span>
      </div>
      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-orange-soft">
        <motion.div className="h-full rounded-full bg-orange" animate={{ width: `${progress * 100}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
      </div>

      {/* card */}
      <div className={`flip-scene ${compact ? "h-[260px]" : "h-[300px] sm:h-[340px]"}`}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={card.id + index}
            initial={{ x: 60, opacity: 0, rotate: 2 }}
            animate={{ x: 0, opacity: 1, rotate: 0 }}
            exit={{ x: -80, opacity: 0, rotate: -3 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="h-full"
          >
            <motion.button
              type="button"
              onClick={() => setFlipped((f) => !f)}
              aria-label={flipped ? "Show word" : "Show translation"}
              aria-pressed={flipped}
              className="flip-inner relative h-full w-full text-left"
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              whileTap={{ scale: 0.985 }}
            >
              {/* front */}
              <div className="flip-face card absolute inset-0 flex flex-col justify-between p-6">
                <div className="flex items-start justify-between">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${isNew(card) ? "bg-[#EEF4FF] text-[#2F55D4]" : "bg-orange-soft text-orange-deep"}`}>{isNew(card) ? "New" : "Review"}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speak(card.audioText);
                    }}
                    className="grid h-10 w-10 place-items-center rounded-full bg-orange-soft text-orange-deep hover:bg-orange hover:text-white"
                    aria-label="Play pronunciation"
                  >
                    <Volume2 className="h-5 w-5" aria-hidden />
                  </button>
                </div>
                <p lang={language === "ru" ? "ru" : "es"} className="font-display text-[40px] font-bold leading-tight tracking-tighter sm:text-5xl">
                  {card.word}
                </p>
                <p className="flex items-center gap-1.5 text-sm font-medium text-warm">
                  <RotateCcw className="h-4 w-4" aria-hidden /> Tap to flip
                </p>
              </div>
              {/* back */}
              <div className="flip-face flip-back absolute inset-0 flex flex-col justify-between rounded-2xl bg-ink p-6 text-white shadow-lift">
                <div>
                  <p className="text-sm font-semibold text-white/60">{card.word}</p>
                  <p className="mt-1 font-display text-3xl font-bold tracking-tighter sm:text-4xl">{card.translation}</p>
                </div>
                <div>
                  <p lang={language === "ru" ? "ru" : "es"} className="font-display text-lg font-semibold leading-snug tracking-tight text-orange">
                    {card.example}
                  </p>
                  <p className="mt-1 text-sm text-white/70">{card.exampleTranslation}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span className="flex gap-1">{card.tags.slice(0, 3).map((t) => <span key={t} className="rounded-full bg-white/10 px-2 py-0.5">{t}</span>)}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speak(card.example);
                    }}
                    className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/20"
                    aria-label="Play example sentence"
                  >
                    <Volume2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* grading */}
      <div className="mt-4 min-h-[88px]">
        <AnimatePresence mode="wait" initial={false}>
          {flipped ? (
            <motion.div key="buttons" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.2 }} className="grid grid-cols-4 gap-2">
              {BUTTONS.map((b) => (
                <motion.button
                  key={b.key}
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => grade(b.key)}
                  className={`flex h-[72px] flex-col items-center justify-center rounded-2xl text-sm font-bold transition-colors ${b.cls}`}
                >
                  {b.label}
                  <span className="mt-0.5 text-[11px] font-medium opacity-70">{b.key === "again" ? "<1 min" : describeInterval(previewInterval(card, GRADE_BUTTONS[b.key]))}</span>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <motion.div key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-[72px] items-center justify-center">
              <Button variant="secondary" size="lg" onClick={() => setFlipped(true)}>
                Show answer
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        <p className="mt-2 h-5 text-center text-xs font-medium text-warm" aria-live="polite">
          {lastResult ?? ""}
        </p>
      </div>
    </div>
  );
}
