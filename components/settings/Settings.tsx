"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Check, Clock, Globe, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { LANGUAGE_META, LEVEL_META } from "@/data/index";
import type { Language, LessonLength, Level } from "@/data/types";
import { formatReminderTime } from "@/lib/dates";
import { useHydrated } from "@/lib/useHydrated";
import { BACKEND } from "@/services/config";
import { useAppStore } from "@/store/useAppStore";
import { Polo } from "@/components/polo/Polo";
import { Button } from "@/components/ui/Button";
import { PageSkeleton } from "@/components/ui/Skeleton";

export function Settings() {
  const hydrated = useHydrated();
  const { profile, updateProfile, resetDemo, demoMode } = useAppStore();
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!hydrated || !profile) return <PageSkeleton />;

  async function save(patch: Parameters<typeof updateProfile>[0]) {
    await updateProfile(patch);
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  }

  return (
    <main className="mx-auto max-w-2xl px-5 pb-32 pt-6 md:pt-24">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-orange-deep">Settings</p>
          <h1 className="text-4xl font-bold tracking-tightest">Hi, {profile.name}.</h1>
          <p className="mt-1 text-warm" aria-live="polite">{saved ? "Saved." : `Reminder at ${formatReminderTime(profile.reminderTime)} · ${profile.timezone}`}</p>
        </div>
        <Polo pose="sleep" size={96} />
      </div>

      <div className="mt-6 space-y-4">
        {/* language */}
        <section className="card p-5" aria-labelledby="s-lang">
          <h2 id="s-lang" className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-warm"><Globe className="h-4 w-4" aria-hidden /> Language</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {(["ru", "es"] as Language[]).map((code) => {
              const m = LANGUAGE_META[code];
              const active = profile.language === code;
              return (
                <motion.button key={code} type="button" whileTap={{ scale: 0.98 }} onClick={() => void save({ language: code })} aria-pressed={active} className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${active ? "border-orange bg-orange-soft" : "border-line hover:bg-orange-mist"}`}>
                  <span className="text-3xl" aria-hidden>{m.flag}</span>
                  <span>
                    <span className="block font-bold">{m.name}</span>
                    <span className="block text-sm text-warm">{m.native}</span>
                  </span>
                  {active && <Check className="ml-auto h-5 w-5 text-orange-deep" aria-hidden />}
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* level */}
        <section className="card p-5" aria-labelledby="s-level">
          <h2 id="s-level" className="text-sm font-bold uppercase tracking-wide text-warm">Level</h2>
          <div className="mt-3 grid grid-cols-3 gap-2 rounded-2xl bg-orange-mist p-1" role="radiogroup" aria-label="Level">
            {(["beginner", "intermediate", "advanced"] as Level[]).map((lv) => {
              const active = profile.level === lv;
              return (
                <button key={lv} type="button" role="radio" aria-checked={active} onClick={() => void save({ level: lv })} className={`relative rounded-xl px-2 py-2.5 text-sm font-semibold transition-colors ${active ? "text-ink" : "text-warm hover:text-ink"}`}>
                  {active && <motion.span layoutId="level-bg" className="absolute inset-0 rounded-xl bg-white shadow-soft" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
                  <span className="relative">
                    {LEVEL_META[lv].name}
                    <span className="block text-[11px] font-medium text-warm">{LEVEL_META[lv].cefr}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* length */}
        <section className="card p-5" aria-labelledby="s-len">
          <h2 id="s-len" className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-warm"><Clock className="h-4 w-4" aria-hidden /> Lesson length</h2>
          <div className="mt-3 grid grid-cols-3 gap-2 rounded-2xl bg-orange-mist p-1" role="radiogroup" aria-label="Lesson length">
            {([10, 20, 30] as LessonLength[]).map((len) => {
              const active = profile.lessonLength === len;
              return (
                <button key={len} type="button" role="radio" aria-checked={active} onClick={() => void save({ lessonLength: len })} className={`relative rounded-xl px-2 py-2.5 text-sm font-semibold transition-colors ${active ? "text-ink" : "text-warm hover:text-ink"}`}>
                  {active && <motion.span layoutId="len-bg" className="absolute inset-0 rounded-xl bg-white shadow-soft" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
                  <span className="relative">{len} min</span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-warm">Changes apply to your next lesson.</p>
        </section>

        {/* reminder + audio */}
        <section className="card divide-y divide-line p-0" aria-label="Reminder and audio">
          <label className="flex items-center justify-between gap-4 p-5">
            <span className="flex items-center gap-2 font-semibold"><Bell className="h-4 w-4 text-orange-deep" aria-hidden /> Daily reminder</span>
            <input type="time" value={profile.reminderTime} onChange={(e) => void save({ reminderTime: e.target.value || "09:00" })} className="h-10 rounded-xl border border-line bg-white px-3 font-semibold outline-none focus:border-orange" />
          </label>
          <div className="flex items-center justify-between gap-4 p-5">
            <span className="flex items-center gap-2 font-semibold">
              {profile.muteTutor ? <VolumeX className="h-4 w-4 text-orange-deep" aria-hidden /> : <Volume2 className="h-4 w-4 text-orange-deep" aria-hidden />}
              Mute tutor audio
            </span>
            <button type="button" role="switch" aria-checked={profile.muteTutor} onClick={() => void save({ muteTutor: !profile.muteTutor })} className={`relative h-8 w-14 rounded-full transition-colors ${profile.muteTutor ? "bg-orange" : "bg-line"}`}>
              <motion.span layout className="absolute top-1 h-6 w-6 rounded-full bg-white shadow-soft" animate={{ left: profile.muteTutor ? 28 : 4 }} transition={{ type: "spring", stiffness: 500, damping: 35 }} />
            </button>
          </div>
        </section>

        {/* demo */}
        <section className="card p-5" aria-labelledby="s-demo">
          <h2 id="s-demo" className="text-sm font-bold uppercase tracking-wide text-warm">Demo data</h2>
          <p className="mt-2 text-sm text-warm">
            Backend: <span className="font-semibold text-ink">{BACKEND}</span>. {demoMode ? "AI responses are canned until you add API keys (see README)." : "Everything lives in this browser's localStorage."}
          </p>
          {confirmReset ? (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button
                variant="danger"
                disabled={resetting}
                onClick={async () => {
                  setResetting(true);
                  await resetDemo();
                  setResetting(false);
                  setConfirmReset(false);
                }}
              >
                {resetting ? "Resetting…" : "Yes, reset everything"}
              </Button>
              <Button variant="ghost" onClick={() => setConfirmReset(false)}>Cancel</Button>
            </div>
          ) : (
            <Button variant="secondary" className="mt-4" onClick={() => setConfirmReset(true)}>
              <RotateCcw className="h-4 w-4" aria-hidden /> Reset demo data
            </Button>
          )}
        </section>
      </div>
    </main>
  );
}
