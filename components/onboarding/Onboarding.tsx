"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import { LANGUAGE_META, LEVEL_META } from "@/data/index";
import type { Language, LessonLength, Level } from "@/data/types";
import { BLOCK_BUDGETS, BLOCK_META, BLOCK_ORDER } from "@/lib/lesson-engine";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/Button";
import { Polo } from "@/components/polo/Polo";

type Step = 0 | 1 | 2 | 3;

const slide = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
  transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
};

export function Onboarding() {
  const router = useRouter();
  const hydrate = useAppStore((s) => s.hydrate);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const [step, setStep] = useState<Step>(0);
  const [language, setLanguage] = useState<Language | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [length, setLength] = useState<LessonLength | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  async function finish() {
    if (!language || !level || !length) return;
    setSaving(true);
    await hydrate();
    await updateProfile({ language, level, lessonLength: length, onboarded: true });
    router.push("/today");
  }

  const lang = language ? LANGUAGE_META[language] : null;

  return (
    <main className="mesh grain relative min-h-dvh">
      <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-5 pb-10 pt-5">
        {/* top bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => (step === 0 ? router.push("/") : setStep((s) => (s - 1) as Step))}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/80 text-ink shadow-soft backdrop-blur hover:bg-white"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <ol className="flex items-center gap-1.5" aria-label="Progress">
            {[0, 1, 2, 3].map((i) => (
              <li key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i <= step ? "w-7 bg-orange" : "w-3 bg-orange/25"}`} aria-current={i === step ? "step" : undefined} />
            ))}
          </ol>
          <span className="w-10" />
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {step === 0 && (
            <motion.section key="lang" {...slide} className="mt-8 flex-1" aria-labelledby="s1">
              <h1 id="s1" className="text-4xl font-bold tracking-tightest md:text-5xl">Which language?</h1>
              <p className="mt-2 text-lg text-warm">You can switch later in settings.</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {(["ru", "es"] as Language[]).map((code) => {
                  const m = LANGUAGE_META[code];
                  const selected = language === code;
                  return (
                    <motion.button
                      key={code}
                      type="button"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setLanguage(code);
                        setTimeout(() => setStep(1), 220);
                      }}
                      aria-pressed={selected}
                      className={`card relative overflow-hidden p-5 text-left transition-shadow ${selected ? "ring-[3px] ring-orange shadow-lift" : "hover:shadow-lift"}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-4xl" aria-hidden>{m.flag}</span>
                          <h2 className="mt-3 text-2xl font-bold tracking-tighter">{m.name}</h2>
                          <p className="text-warm">{m.native}</p>
                        </div>
                        <div className="-mr-2 -mt-2">
                          <Polo pose="idle" size={92} label={`Polo holding the ${m.name} flag`} />
                          <span className="absolute right-5 top-16 grid h-7 w-7 place-items-center rounded-full bg-white text-base shadow-soft" aria-hidden>{m.flag}</span>
                        </div>
                      </div>
                      <p className="mt-3 rounded-xl bg-orange-soft px-3 py-2 font-display text-[15px] font-semibold tracking-tight text-orange-deep">{m.sample.beginner}</p>
                    </motion.button>
                  );
                })}
              </div>
            </motion.section>
          )}

          {step === 1 && lang && (
            <motion.section key="level" {...slide} className="mt-8 flex-1" aria-labelledby="s2">
              <h1 id="s2" className="text-4xl font-bold tracking-tightest md:text-5xl">Where are you now?</h1>
              <p className="mt-2 text-lg text-warm">Be honest. Polo doesn't judge; Polo is a bear.</p>
              <div className="mt-8 grid gap-3">
                {(["beginner", "intermediate", "advanced"] as Level[]).map((lv) => {
                  const m = LEVEL_META[lv];
                  const selected = level === lv;
                  return (
                    <motion.button
                      key={lv}
                      type="button"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setLevel(lv);
                        setTimeout(() => setStep(2), 220);
                      }}
                      aria-pressed={selected}
                      className={`card p-5 text-left transition-shadow ${selected ? "ring-[3px] ring-orange shadow-lift" : "hover:shadow-lift"}`}
                    >
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold tracking-tighter">{m.name}</h2>
                        <span className="rounded-full bg-orange-soft px-2.5 py-1 text-xs font-bold text-orange-deep">{m.cefr}</span>
                      </div>
                      <p className="mt-1 text-[15px] text-warm">{m.blurb}</p>
                      <p lang={lang.locale} className="mt-3 font-display text-lg font-semibold tracking-tight">“{lang.sample[lv]}”</p>
                    </motion.button>
                  );
                })}
              </div>
            </motion.section>
          )}

          {step === 2 && (
            <motion.section key="time" {...slide} className="mt-8 flex-1" aria-labelledby="s3">
              <h1 id="s3" className="text-4xl font-bold tracking-tightest md:text-5xl">How long each day?</h1>
              <p className="mt-2 text-lg text-warm">Pick what you'll actually do. Short and daily beats long and someday.</p>
              <div className="mt-8 grid gap-3">
                {([10, 20, 30] as LessonLength[]).map((len) => {
                  const selected = length === len;
                  const b = BLOCK_BUDGETS[len];
                  return (
                    <motion.button
                      key={len}
                      type="button"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setLength(len);
                        setTimeout(() => setStep(3), 220);
                      }}
                      aria-pressed={selected}
                      className={`card p-5 text-left transition-shadow ${selected ? "ring-[3px] ring-orange shadow-lift" : "hover:shadow-lift"}`}
                    >
                      <div className="flex items-baseline justify-between">
                        <h2 className="text-3xl font-bold tracking-tightest">
                          {len} <span className="text-lg text-warm">min</span>
                        </h2>
                        {len === 20 && <span className="rounded-full bg-orange px-2.5 py-1 text-xs font-bold text-white">Most people</span>}
                      </div>
                      <ul className="mt-3 flex flex-wrap gap-1.5">
                        {BLOCK_ORDER.map((k) => (
                          <li key={k} className="rounded-full bg-orange-soft px-2.5 py-1 text-xs font-semibold text-ink">
                            {BLOCK_META[k].short} <span className="text-orange-deep">{b[k]}m</span>
                          </li>
                        ))}
                      </ul>
                    </motion.button>
                  );
                })}
              </div>
            </motion.section>
          )}

          {step === 3 && lang && level && length && (
            <motion.section key="polo" {...slide} className="mt-6 flex flex-1 flex-col items-center text-center" aria-labelledby="s4">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 160, damping: 16, delay: 0.1 }}>
                <Polo pose="wave" size={240} label="Polo waving" />
              </motion.div>
              <h1 id="s4" className="mt-2 text-4xl font-bold tracking-tightest md:text-5xl">Meet Polo.</h1>
              <p className="mx-auto mt-3 max-w-sm text-lg text-warm">
                I'm a polar bear learning {lang.name} too. I'll talk with you, nudge you toward the right words, and squint at your handwriting. Kindly.
              </p>
              <ul className="mt-6 flex flex-wrap justify-center gap-2 text-sm font-semibold">
                <li className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-soft"><Check className="h-4 w-4 text-orange-deep" aria-hidden />{lang.flag} {lang.name}</li>
                <li className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-soft"><Check className="h-4 w-4 text-orange-deep" aria-hidden />{LEVEL_META[level].name}</li>
                <li className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-soft"><Check className="h-4 w-4 text-orange-deep" aria-hidden />{length} min a day</li>
              </ul>
              <div className="mt-auto w-full pt-8">
                <Button size="xl" full onClick={finish} disabled={saving}>
                  {saving ? "Setting things up…" : "Let's go"}
                </Button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
