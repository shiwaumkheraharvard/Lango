"use client";

import { motion } from "framer-motion";
import type { LessonProgress } from "@/data/types";
import { BLOCK_META, BLOCK_ORDER, currentBlock, formatClock } from "@/lib/lesson-engine";

export function TimerRing({ lesson, size = 64 }: { lesson: LessonProgress; size?: number }) {
  const block = currentBlock(lesson);
  const total = block.budgetSec + block.carriedSec;
  const progress = total > 0 ? block.remainingSec / total : 0;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const low = block.remainingSec <= 30;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }} role="timer" aria-label={`${formatClock(block.remainingSec)} left in ${BLOCK_META[block.kind].title}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#FFF1E6" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={low ? "#E85D04" : "#FF6B1A"}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          animate={{ strokeDashoffset: c * (1 - progress) }}
          transition={{ duration: 0.9, ease: "linear" }}
        />
      </svg>
      <span className={`absolute font-display text-sm font-bold tabular-nums tracking-tight ${low ? "text-orange-deep" : ""}`}>{formatClock(block.remainingSec)}</span>
    </div>
  );
}

export function BlockIndicator({ lesson }: { lesson: LessonProgress }) {
  return (
    <ol className="flex items-center gap-1.5" aria-label="Lesson blocks">
      {BLOCK_ORDER.map((kind, i) => {
        const done = lesson.blockIndex > i || lesson.status === "complete";
        const current = lesson.blockIndex === i && lesson.status !== "complete";
        return (
          <li key={kind} className="flex items-center gap-1.5" aria-current={current ? "step" : undefined}>
            <span className={`h-2 rounded-full transition-all duration-300 ${current ? "w-8 bg-orange" : done ? "w-2 bg-ink" : "w-2 bg-orange/25"}`} />
            <span className="sr-only">{BLOCK_META[kind].title}{done ? " done" : current ? " in progress" : ""}</span>
          </li>
        );
      })}
    </ol>
  );
}
