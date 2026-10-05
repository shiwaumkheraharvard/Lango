"use client";

import Link from "next/link";
import type { LanguageContent } from "@/data/index";
import type { DayRecord } from "@/data/types";
import { formatDayLabel } from "@/lib/dates";
import { Polo } from "@/components/polo/Polo";
import { Stars } from "@/components/ui/Stars";
import { NotebookPlaceholder } from "./NotebookPlaceholder";

export function DayDetail({ date, record, today, content }: { date: string; record?: DayRecord; today: string; content: LanguageContent }) {
  const label = formatDayLabel(date, today);

  if (!record || record.status !== "complete") {
    const isToday = date === today;
    const missed = record?.status === "missed";
    return (
      <div className="card flex flex-col items-center p-8 text-center">
        <Polo pose={missed ? "sad" : isToday ? "idle" : "sleep"} size={120} />
        <h2 className="mt-3 text-2xl font-bold tracking-tighter">{label}</h2>
        <p className="mt-1 max-w-sm text-warm">
          {isToday ? "Today's lesson isn't finished yet." : missed ? "No lesson this day. Polo got a little cold." : record?.status === "partial" ? "Started but not finished." : "Nothing recorded."}
        </p>
        {isToday && (
          <Link href="/lesson" className="mt-4 inline-flex h-11 items-center rounded-xl bg-orange-deep px-5 font-bold text-white shadow-orange hover:bg-[#d95500]">
            Start today's lesson
          </Link>
        )}
      </div>
    );
  }

  const lang = record.language;
  const scenario = record.conversation ? content.scenarioById.get(record.conversation.scenarioId) : undefined;
  const rule = record.grammarRuleId ? content.ruleById.get(record.grammarRuleId) : undefined;
  const task = record.notebook ? content.taskById.get(record.notebook.taskId) : undefined;
  const fc = record.flashcards;
  const summary = record.conversation?.summary;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-orange-deep">{label}</p>
          <h2 className="text-2xl font-bold tracking-tighter">{scenario?.title ?? "Lesson"}</h2>
        </div>
        <span className="rounded-full bg-orange px-3 py-1 text-xs font-bold text-white">Complete · {record.lessonLength} min</span>
      </div>

      {/* flashcards */}
      {fc && (
        <section className="card p-4" aria-labelledby={`fc-${date}`}>
          <h3 id={`fc-${date}`} className="text-xs font-bold uppercase tracking-wide text-warm">Flashcards</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-bold tracking-tightest">{fc.reviewed}</p>
            <p className="text-sm text-warm">reviewed · {fc.newLearned} new learned</p>
          </div>
          <div className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full bg-orange-soft" role="img" aria-label={`${fc.again} again, ${fc.hard} hard, ${fc.good} good, ${fc.easy} easy`}>
            <span className="bg-[#E8A1A1]" style={{ width: `${(fc.again / fc.reviewed) * 100}%` }} />
            <span className="bg-orange" style={{ width: `${(fc.hard / fc.reviewed) * 100}%` }} />
            <span className="bg-ink" style={{ width: `${(fc.good / fc.reviewed) * 100}%` }} />
            <span className="bg-[#7CC79A]" style={{ width: `${(fc.easy / fc.reviewed) * 100}%` }} />
          </div>
          <ul className="mt-2 flex gap-3 text-xs font-semibold text-warm">
            <li>Again {fc.again}</li>
            <li>Hard {fc.hard}</li>
            <li>Good {fc.good}</li>
            <li>Easy {fc.easy}</li>
          </ul>
        </section>
      )}

      {/* conversation */}
      {record.conversation && summary && (
        <section className="card p-4" aria-labelledby={`conv-${date}`}>
          <h3 id={`conv-${date}`} className="text-xs font-bold uppercase tracking-wide text-warm">Conversation</h3>
          {scenario && <p className="mt-1 text-sm text-warm">{scenario.goal}</p>}
          <ol className="mt-3 space-y-2">
            {record.conversation.transcript.map((m) => (
              <li key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[88%] ${m.role === "user" ? "text-right" : ""}`}>
                  <p lang={lang} className={`inline-block rounded-2xl px-3.5 py-2 text-[15px] leading-snug ${m.role === "user" ? "rounded-br-md bg-orange-deep text-white" : "rounded-bl-md bg-orange-mist text-ink"}`}>{m.text}</p>
                  {m.note && <p className="mt-0.5 px-1 text-xs text-warm">{m.note}</p>}
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-orange-mist p-3">
              <p className="text-xs font-semibold text-warm">Target words used</p>
              <p className="text-2xl font-bold tracking-tightest">
                {summary.targetWordsUsed.length}
                <span className="text-sm text-warm"> / {(scenario?.targetWords.length ?? 0) || summary.targetWordsUsed.length + summary.targetWordsMissed.length}</span>
              </p>
            </div>
            <div className="rounded-2xl bg-ink p-3 text-white">
              <p className="text-xs font-semibold text-white/60">Say this better</p>
              <p lang={lang} className="font-display font-semibold tracking-tight text-orange">{summary.sayThisBetter.better}</p>
            </div>
          </div>
          <ul className="mt-3 space-y-2">
            {summary.corrections.map((c, i) => (
              <li key={i} className="rounded-2xl border border-line p-3">
                <p lang={lang} className="text-sm text-warm line-through decoration-[#B42318]/60">{c.said}</p>
                <p lang={lang} className="font-display font-semibold tracking-tight">{c.better}</p>
                <p className="text-xs text-warm">{c.why}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* notebook */}
      {record.notebook && task && (
        <section className="card p-4" aria-labelledby={`nb-${date}`}>
          <div className="flex items-center justify-between">
            <h3 id={`nb-${date}`} className="text-xs font-bold uppercase tracking-wide text-warm">Notebook</h3>
            <Stars value={record.notebook.grade.overall} size={16} />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {record.notebook.photo.startsWith("data:") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={record.notebook.photo} alt="Notebook page photo" className="w-full rounded-2xl border border-line object-cover" />
            ) : (
              <NotebookPlaceholder lines={record.notebook.grade.transcription} variant={Number(record.notebook.photo.split(":")[1] ?? 1)} />
            )}
            <ol className="space-y-2">
              {record.notebook.grade.scores.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${s.correct ? "bg-[#7CC79A]" : "bg-[#E8A1A1]"}`} aria-label={s.correct ? "Correct" : "Needs a fix"} />
                  <div>
                    <p lang={lang} className={`text-[15px] font-semibold leading-snug ${s.correct ? "" : "text-[#B42318]"}`}>{s.sentence}</p>
                    {!s.correct && s.fix && <p lang={lang} className="text-sm text-[#176B3A]">→ {s.fix}</p>}
                    {!s.correct && s.issue && <p className="text-xs text-warm">{s.issue}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <p className="mt-3 text-sm text-warm">{record.notebook.grade.encouragement}</p>
        </section>
      )}

      {/* grammar */}
      {rule && (
        <section className="card p-4" aria-labelledby={`gr-${date}`}>
          <h3 id={`gr-${date}`} className="text-xs font-bold uppercase tracking-wide text-warm">Grammar rule</h3>
          <p className="mt-1 text-lg font-bold tracking-tighter">{rule.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-warm">{rule.rule}</p>
          <p lang={lang} className="mt-3 rounded-xl bg-[#FFFDF9] px-3 py-2 font-hand text-[22px] leading-7 text-[#2B3A67] shadow-inner">{rule.writeDown}</p>
        </section>
      )}
    </div>
  );
}
