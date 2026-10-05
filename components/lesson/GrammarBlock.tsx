"use client";

import { motion } from "framer-motion";
import { PenLine, Volume2 } from "lucide-react";
import type { GrammarRule, Language } from "@/data/types";
import { speakText } from "@/lib/audio/speech";
import { Polo } from "@/components/polo/Polo";
import { Button } from "@/components/ui/Button";

export function GrammarBlock({ rule, language, muted, onDone, timeUp }: { rule: GrammarRule; language: Language; muted: boolean; onDone: () => void; timeUp: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto w-full max-w-xl">
      <div className="flex items-center gap-3">
        <Polo pose="idle" size={84} />
        <div>
          <p className="text-sm font-semibold text-orange-deep">Today's grammar rule</p>
          <h2 className="text-2xl font-bold leading-tight tracking-tighter">{rule.title}</h2>
        </div>
      </div>

      <div className="card mt-5 p-5">
        <p className="text-[16px] leading-relaxed">{rule.rule}</p>
        <ul className="mt-4 space-y-3">
          {rule.examples.map((ex, i) => (
            <li key={i} className="flex items-start gap-3 rounded-2xl bg-orange-mist p-3">
              <button type="button" onClick={() => void speakText(ex.target, language, { muted })} className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-orange-deep shadow-soft hover:bg-orange hover:text-white" aria-label={`Play example ${i + 1}`}>
                <Volume2 className="h-4 w-4" aria-hidden />
              </button>
              <div>
                <p lang={language} className="font-display text-lg font-semibold leading-snug tracking-tight">{ex.target}</p>
                <p className="text-sm text-warm">{ex.translation}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 overflow-hidden rounded-3xl bg-[#E9E2D9] p-3 shadow-soft">
        <p className="mb-2 flex items-center gap-1.5 px-1 text-xs font-bold uppercase tracking-wide text-warm">
          <PenLine className="h-3.5 w-3.5" aria-hidden /> Copy this into your notebook
        </p>
        <div className="notebook-lines rounded-md px-5 py-4 pl-14 shadow-[0_6px_18px_rgba(0,0,0,0.12)]">
          <p lang={language} className="font-hand text-[26px] leading-8 text-[#2B3A67]">{rule.writeDown}</p>
        </div>
      </div>

      {timeUp && <p className="mt-3 text-center text-xs font-semibold text-orange-deep" role="status">Time's up — finish your line and move on.</p>}
      <Button size="xl" full className="mt-4" onClick={onDone}>
        Done writing
      </Button>
    </motion.div>
  );
}
