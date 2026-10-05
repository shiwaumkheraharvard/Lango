"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Flame } from "lucide-react";
import type { DayRecord, Language } from "@/data/types";
import { LANGUAGE_META } from "@/data/index";
import { Polo } from "@/components/polo/Polo";
import { Stars } from "@/components/ui/Stars";

export function LessonComplete({ record, streak, language }: { record: DayRecord; streak: number; language: Language }) {
  const lang = LANGUAGE_META[language];
  return (
    <div className="mesh grain relative flex min-h-dvh flex-col items-center px-5 pb-10 pt-10 text-center">
      <motion.div initial={{ scale: 0.6, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 160, damping: 14 }}>
        <Polo pose="celebrate" size={220} label="Polo celebrating with a flag" />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <p className="inline-flex items-center gap-1.5 rounded-full bg-orange px-3 py-1 text-sm font-bold text-white shadow-orange">
          <Flame className="h-4 w-4" aria-hidden /> {streak}-day streak
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tightest md:text-5xl">You said something in {lang.name} today.</h1>
        <p className="mt-2 text-lg text-warm">Day complete. Polo is unreasonably proud.</p>
      </motion.div>
      <motion.dl initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8 grid w-full max-w-md grid-cols-2 gap-3 text-left">
        <div className="card p-4">
          <dt className="text-xs font-semibold text-warm">Cards reviewed</dt>
          <dd className="text-3xl font-bold tracking-tightest">{record.flashcards?.reviewed ?? 0}</dd>
        </div>
        <div className="card p-4">
          <dt className="text-xs font-semibold text-warm">Turns spoken</dt>
          <dd className="text-3xl font-bold tracking-tightest">{record.conversation?.summary.turns ?? 0}</dd>
        </div>
        <div className="card p-4">
          <dt className="text-xs font-semibold text-warm">Target words used</dt>
          <dd className="text-3xl font-bold tracking-tightest">{record.conversation?.summary.targetWordsUsed.length ?? 0}</dd>
        </div>
        <div className="card p-4">
          <dt className="text-xs font-semibold text-warm">Notebook</dt>
          <dd className="mt-2">{record.notebook ? <Stars value={record.notebook.grade.overall} /> : <span className="text-sm text-warm">Skipped</span>}</dd>
        </div>
      </motion.dl>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-auto w-full max-w-md pt-8">
        <Link href="/today" className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-orange-deep text-lg font-bold text-white shadow-orange hover:bg-[#d95500]">
          Back to today <ArrowRight className="h-5 w-5" aria-hidden />
        </Link>
      </motion.div>
    </div>
  );
}
