"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { addDays, formatDayLabel, parseISODate } from "@/lib/dates";
import { useHydrated } from "@/lib/useHydrated";
import { useAppStore } from "@/store/useAppStore";
import { Polo } from "@/components/polo/Polo";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { DayDetail } from "./DayDetail";

export function History() {
  const hydrated = useHydrated();
  const router = useRouter();
  const params = useSearchParams();
  const { history, today, streak, content, profile } = useAppStore();
  const [selected, setSelected] = useState<string | null>(params.get("day"));

  useEffect(() => {
    const d = params.get("day");
    if (d) setSelected(d);
  }, [params]);

  const days = useMemo(() => {
    if (!today) return [];
    return Array.from({ length: 15 }, (_, i) => addDays(today, i - 14));
  }, [today]);

  if (!hydrated || !profile || !content) return <PageSkeleton />;

  const completed = Object.values(history).filter((d) => d.status === "complete").length;
  const selectedRecord = selected ? history[selected] : undefined;

  return (
    <main className="mx-auto max-w-5xl px-5 pb-32 pt-6 md:pt-24">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-orange-deep">History</p>
          <h1 className="text-4xl font-bold tracking-tightest">Last two weeks</h1>
          <p className="mt-1 text-warm">
            {completed} days complete · {streak}-day streak
          </p>
        </div>
        <Polo pose={streak === 0 ? "sad" : "idle"} size={96} />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,380px)_1fr] md:items-start">
        {/* calendar */}
        <ol className="grid grid-cols-5 gap-2" aria-label="Days">
          {days.map((iso) => {
            const rec = history[iso];
            const isToday = iso === today;
            const isSelected = selected === iso;
            const complete = rec?.status === "complete";
            const missed = rec?.status === "missed";
            const date = parseISODate(iso);
            return (
              <li key={iso}>
                <motion.button
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    setSelected(iso);
                    router.replace(`/history?day=${iso}`, { scroll: false });
                  }}
                  aria-pressed={isSelected}
                  aria-label={`${formatDayLabel(iso, today)}: ${rec?.status ?? (isToday ? "in progress" : "no lesson")}`}
                  className={`relative flex aspect-square w-full flex-col items-start justify-between rounded-2xl p-2.5 text-left transition-shadow ${
                    complete ? "bg-orange text-white shadow-orange" : missed ? "bg-line text-warm" : isToday ? "border-2 border-dashed border-orange/60 bg-orange-mist text-ink" : "bg-orange-soft text-warm"
                  } ${isSelected ? "ring-[3px] ring-ink ring-offset-2" : ""}`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">{date.toLocaleDateString("en-US", { weekday: "short" })}</span>
                  <span className="font-display text-xl font-bold leading-none tracking-tight">{date.getDate()}</span>
                  <span className="absolute right-2 top-2">
                    {complete && <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />}
                    {missed && <X className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />}
                  </span>
                </motion.button>
              </li>
            );
          })}
        </ol>

        {/* detail */}
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div key={selected} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                <DayDetail date={selected} record={selectedRecord} today={today} content={content} />
              </motion.div>
            ) : (
              <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6 text-center text-warm">
                Tap a day to see its cards, conversation, notebook page and rule.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
