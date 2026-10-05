"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Flame, Layers, Mic, NotebookPen, PenLine, Play, Sparkles } from "lucide-react";
import { LANGUAGE_META, LEVEL_META } from "@/data/index";
import { formatLongDate, greetingFor } from "@/lib/dates";
import { BLOCK_BUDGETS, BLOCK_META, BLOCK_ORDER, buildDailyPlan, totalRemainingSec } from "@/lib/lesson-engine";
import { useHydrated } from "@/lib/useHydrated";
import { useAppStore } from "@/store/useAppStore";
import { Polo } from "@/components/polo/Polo";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { Pill } from "@/components/ui/Pill";
import { Stars } from "@/components/ui/Stars";

const ICONS = { flashcards: Layers, conversation: Mic, grammar: NotebookPen, notebook: PenLine } as const;

export function Dashboard() {
  const hydrated = useHydrated();
  const { profile, content, counts, streak, history, today, lesson, demoMode } = useAppStore();

  if (!hydrated || !profile || !content) return <PageSkeleton />;

  const lang = LANGUAGE_META[profile.language];
  const todayRecord = history[today];
  const complete = todayRecord?.status === "complete";
  const yesterdayMissed = streak === 0 && Object.keys(history).length > 0;
  const plan = buildDailyPlan(content, profile.level, today);
  const scenario = content.scenarioById.get(plan.scenarioId);
  const rule = content.ruleById.get(plan.grammarRuleId);
  const budgets = BLOCK_BUDGETS[profile.lessonLength];
  const inProgress = lesson && lesson.status === "running";

  return (
    <main className="mx-auto max-w-2xl px-5 pb-32 pt-6 md:pt-24">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-warm">{formatLongDate(today)}</p>
          <h1 className="mt-1 text-4xl font-bold tracking-tightest md:text-5xl">
            {greetingFor()}, {profile.name}.
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Pill tone={streak > 0 ? "orange" : "outline"}>
              <Flame className="h-3.5 w-3.5" aria-hidden />
              {streak}-day streak
            </Pill>
            <Pill tone="soft">
              {lang.flag} {lang.name} · {LEVEL_META[profile.level].name}
            </Pill>
            {demoMode && <Pill tone="outline">Demo mode</Pill>}
          </div>
        </div>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 160, damping: 16 }} className="-mr-3 -mt-2 shrink-0">
          <Polo pose={complete ? "celebrate" : yesterdayMissed ? "sad" : "idle"} size={120} />
        </motion.div>
      </div>

      {yesterdayMissed && !complete && (
        <p className="mt-4 rounded-2xl bg-orange-soft px-4 py-3 text-sm text-ink">
          Polo got a bit cold yesterday. One lesson today and the streak starts again.
        </p>
      )}

      {/* Today card */}
      {complete && todayRecord ? (
        <section className="mesh-strong relative mt-6 overflow-hidden rounded-[28px] p-6 text-white shadow-lift" aria-labelledby="done">
          <div className="relative z-10">
            <p className="flex items-center gap-2 text-sm font-semibold text-white/85">
              <Sparkles className="h-4 w-4" aria-hidden /> Day complete
            </p>
            <h2 id="done" className="mt-1 text-3xl font-bold tracking-tightest">You said something in {lang.name} today.</h2>
            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
                <dt className="text-white/75">Cards</dt>
                <dd className="text-2xl font-bold">{todayRecord.flashcards?.reviewed ?? 0}</dd>
              </div>
              <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
                <dt className="text-white/75">Turns spoken</dt>
                <dd className="text-2xl font-bold">{todayRecord.conversation?.summary.turns ?? 0}</dd>
              </div>
              <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
                <dt className="text-white/75">Target words</dt>
                <dd className="text-2xl font-bold">{todayRecord.conversation?.summary.targetWordsUsed.length ?? 0}</dd>
              </div>
              <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
                <dt className="text-white/75">Notebook</dt>
                <dd className="mt-1"><Stars value={todayRecord.notebook?.grade.overall ?? 0} size={16} /></dd>
              </div>
            </dl>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/review" className="inline-flex h-12 items-center gap-2 rounded-2xl bg-white px-5 font-bold text-orange-deep shadow-soft hover:bg-orange-soft">
                Bonus round <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href={`/history?day=${today}`} className="inline-flex h-12 items-center gap-2 rounded-2xl bg-white/15 px-5 font-semibold text-white backdrop-blur hover:bg-white/25">
                See today's page
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="card mt-6 overflow-hidden p-0" aria-labelledby="lesson">
          <div className="flex items-start justify-between gap-3 p-5 pb-4">
            <div>
              <p className="text-sm font-semibold text-orange-deep">Today's lesson · {profile.lessonLength} min</p>
              <h2 id="lesson" className="mt-1 text-2xl font-bold tracking-tighter">{scenario?.title ?? "Conversation"}</h2>
              <p className="mt-1 text-sm text-warm">{rule?.title}</p>
            </div>
            <div className="shrink-0 rounded-2xl bg-orange-soft px-3 py-2 text-center">
              <p className="text-2xl font-bold leading-none text-orange-deep">{counts.due}</p>
              <p className="mt-1 text-[11px] font-semibold text-warm">due cards</p>
            </div>
          </div>
          <ol className="divide-y divide-line border-t border-line">
            {BLOCK_ORDER.map((kind, i) => {
              const Icon = ICONS[kind];
              const done = inProgress && lesson.blockIndex > i;
              const current = inProgress && lesson.blockIndex === i;
              return (
                <li key={kind} className={`flex items-center gap-3 px-5 py-3 ${current ? "bg-orange-mist" : ""}`}>
                  <span className={`grid h-9 w-9 place-items-center rounded-xl ${done ? "bg-ink text-white" : current ? "bg-orange text-white" : "bg-orange-soft text-orange-deep"}`}>
                    <Icon className="h-4.5 w-4.5" strokeWidth={2.2} aria-hidden />
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold">{BLOCK_META[kind].title}</p>
                    <p className="text-xs text-warm">{BLOCK_META[kind].blurb}</p>
                  </div>
                  <span className="text-sm font-semibold text-warm">{budgets[kind]} min</span>
                </li>
              );
            })}
          </ol>
          <div className="p-5 pt-4">
            <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}>
              <Link href="/lesson" className="flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-orange-deep text-lg font-bold text-white shadow-orange transition-colors hover:bg-[#d95500]">
                <Play className="h-5 w-5 fill-current" aria-hidden />
                {inProgress ? `Continue lesson · ${Math.ceil(totalRemainingSec(lesson) / 60)} min left` : "Start lesson"}
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="mt-5 grid grid-cols-3 gap-3" aria-label="Stats">
        <Link href="/review" className="card p-4 transition-shadow hover:shadow-lift">
          <p className="text-3xl font-bold tracking-tightest text-orange-deep">{counts.due}</p>
          <p className="text-xs font-semibold text-warm">cards due</p>
        </Link>
        <div className="card p-4">
          <p className="text-3xl font-bold tracking-tightest">{counts.learned}</p>
          <p className="text-xs font-semibold text-warm">words learned</p>
        </div>
        <div className="card p-4">
          <p className="text-3xl font-bold tracking-tightest">{counts.fresh}</p>
          <p className="text-xs font-semibold text-warm">still new</p>
        </div>
      </section>

      {/* Recent days */}
      <section className="mt-6" aria-labelledby="recent">
        <div className="flex items-center justify-between">
          <h2 id="recent" className="text-xl font-bold tracking-tighter">Last two weeks</h2>
          <Link href="/history" className="text-sm font-semibold text-orange-deep hover:underline">History</Link>
        </div>
        <ol className="mt-3 grid grid-cols-7 gap-1.5 sm:grid-cols-14" aria-label="Recent days">
          {Array.from({ length: 14 }).map((_, i) => {
            const d = new Date(today + "T00:00:00");
            d.setDate(d.getDate() - (13 - i));
            const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            const rec = history[iso];
            const isToday = iso === today;
            const cls = rec?.status === "complete" ? "bg-orange" : rec?.status === "missed" ? "bg-line" : isToday ? "border-2 border-dashed border-orange/60 bg-orange-soft/50" : "bg-orange-soft";
            return <li key={iso} className={`aspect-square rounded-lg ${cls}`} title={iso} aria-label={`${iso}: ${rec?.status ?? (isToday ? "today" : "no lesson")}`} />;
          })}
        </ol>
      </section>
    </main>
  );
}
