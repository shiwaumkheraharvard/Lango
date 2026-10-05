"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, X } from "lucide-react";
import type { DayRecord } from "@/data/types";
import { BLOCK_META, buildFlashcardQueue, currentBlock } from "@/lib/lesson-engine";
import { useHydrated } from "@/lib/useHydrated";
import { stopSpeaking } from "@/lib/audio/speech";
import { useAppStore } from "@/store/useAppStore";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { FlashcardDeck } from "./FlashcardDeck";
import { ConversationBlock } from "./ConversationBlock";
import { GrammarBlock } from "./GrammarBlock";
import { NotebookBlock } from "./NotebookBlock";
import { LessonComplete } from "./LessonComplete";
import { BlockIndicator, TimerRing } from "./TimerRing";

export function LessonFlow() {
  const router = useRouter();
  const hydrated = useHydrated();
  const { profile, content, cards, today, lesson, history, streak, startLesson, dispatch, completeLesson, updateProfile } = useAppStore();
  const [record, setRecord] = useState<DayRecord | null>(null);
  const startedRef = useRef(false);

  // Start (or resume) the lesson once hydrated.
  useEffect(() => {
    if (!hydrated || !profile || !content || startedRef.current) return;
    startedRef.current = true;
    if (history[today]?.status === "complete") {
      setRecord(history[today]);
      return;
    }
    const l = startLesson();
    if (l.status === "idle") dispatch({ type: "START", at: new Date().toISOString() });
  }, [hydrated, profile, content, history, today, startLesson, dispatch]);

  // Timer tick.
  useEffect(() => {
    if (!lesson || lesson.status !== "running") return;
    const id = setInterval(() => {
      if (document.visibilityState === "visible") dispatch({ type: "TICK" });
    }, 1000);
    return () => clearInterval(id);
  }, [lesson, dispatch]);

  const next = useCallback(() => {
    stopSpeaking();
    dispatch({ type: "NEXT", at: new Date().toISOString() });
  }, [dispatch]);

  // Flashcard queue is fixed for the block (minus cards already reviewed when resuming).
  const queue = useMemo(() => {
    if (!lesson || !profile) return [];
    const reviewed = new Set(lesson.flashcards.reviewedCardIds);
    return buildFlashcardQueue(cards, profile.level, today, profile.lessonLength).filter((c) => !reviewed.has(c.id));
    // Only rebuild when the block changes; cards mutate on every grade.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.blockIndex, lesson?.date, profile?.level, profile?.lessonLength, today]);

  const todaysWords = useMemo(() => {
    if (!lesson) return [];
    const ids = new Set(lesson.flashcards.reviewedCardIds);
    return cards.filter((c) => ids.has(c.id));
  }, [cards, lesson]);

  if (!hydrated || !profile || !content) return <PageSkeleton />;

  if (record) return <LessonComplete record={record} streak={streak} language={record.language} />;
  if (!lesson) return <PageSkeleton />;

  const block = currentBlock(lesson);
  const scenario = content.scenarioById.get(lesson.plan.scenarioId)!;
  const rule = content.ruleById.get(lesson.plan.grammarRuleId)!;
  const task = content.taskById.get(lesson.plan.writingTaskId)!;
  const muted = profile.muteTutor;

  function finish() {
    stopSpeaking();
    const rec = completeLesson();
    setRecord(rec);
  }

  return (
    <main className="flex min-h-dvh flex-col bg-white">
      {/* top bar */}
      <header className="sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-2.5">
          <button
            type="button"
            onClick={() => {
              stopSpeaking();
              router.push("/today");
            }}
            className="grid h-10 w-10 place-items-center rounded-full text-warm hover:bg-orange-soft hover:text-ink"
            aria-label="Leave lesson (progress is saved)"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-base font-bold tracking-tight">{BLOCK_META[block.kind].title}</p>
            <BlockIndicator lesson={lesson} />
          </div>
          <TimerRing lesson={lesson} size={52} />
          <button type="button" onClick={next} className="hidden h-10 items-center gap-1 rounded-full px-3 text-sm font-semibold text-warm hover:bg-orange-soft hover:text-ink sm:flex" aria-label="End this block early">
            End block <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
        {block.timeUp && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} className="overflow-hidden bg-orange text-center text-xs font-bold text-white">
            <p className="py-1.5">Time's up for this block — carry on and finish, or end it now.</p>
          </motion.div>
        )}
      </header>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-10 pt-5">
        <AnimatePresence mode="wait">
          <motion.section
            key={block.kind}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-1 flex-col"
            aria-label={BLOCK_META[block.kind].title}
          >
            {block.kind === "flashcards" && (
              <div className="mx-auto w-full max-w-xl">
                <FlashcardDeck
                  queue={queue}
                  language={lesson.language}
                  muted={muted}
                  wrapUp={block.timeUp}
                  onGraded={(card, grade, wasNew) => dispatch({ type: "FLASHCARD_GRADED", cardId: card.id, grade, wasNew })}
                  onFinished={() => {
                    dispatch({ type: "FLASHCARDS_DONE" });
                    setTimeout(next, 900);
                  }}
                />
              </div>
            )}
            {block.kind === "conversation" && (
              <ConversationBlock lesson={lesson} scenario={scenario} dispatch={dispatch} onDone={next} muted={muted} onToggleMute={() => void updateProfile({ muteTutor: !muted })} />
            )}
            {block.kind === "grammar" && <GrammarBlock rule={rule} language={lesson.language} muted={muted} onDone={next} timeUp={block.timeUp} />}
            {block.kind === "notebook" && <NotebookBlock lesson={lesson} task={task} todaysWords={todaysWords} dispatch={dispatch} onDone={finish} />}
          </motion.section>
        </AnimatePresence>
        <button type="button" onClick={next} className="mt-6 self-center text-sm font-semibold text-warm hover:text-ink sm:hidden">
          End this block early
        </button>
      </div>
    </main>
  );
}
