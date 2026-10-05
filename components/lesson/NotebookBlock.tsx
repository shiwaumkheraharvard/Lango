"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, Check, ImagePlus, RefreshCw, X } from "lucide-react";
import type { LessonProgress, NotebookGrade, VocabCard, WritingTask } from "@/data/types";
import { fileToDataUrl } from "@/lib/image";
import type { LessonEvent } from "@/lib/lesson-engine";
import { writing } from "@/services";
import { useAppStore } from "@/store/useAppStore";
import { Polo } from "@/components/polo/Polo";
import { Button } from "@/components/ui/Button";
import { Stars } from "@/components/ui/Stars";

interface Props {
  lesson: LessonProgress;
  task: WritingTask;
  todaysWords: VocabCard[];
  dispatch: (e: LessonEvent) => void;
  onDone: () => void;
}

export function NotebookBlock({ lesson, task, todaysWords, dispatch, onDone }: Props) {
  const setDemoMode = useAppStore((s) => s.setDemoMode);
  const [grading, setGrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const photo = lesson.notebook.photo;
  const grade = lesson.notebook.grade;
  const language = lesson.language;
  const timeUp = lesson.blocks[lesson.blockIndex].timeUp;

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      setError(null);
      const dataUrl = await fileToDataUrl(file);
      dispatch({ type: "PHOTO", photo: dataUrl });
    } catch {
      setError("Couldn't read that image. Try another photo.");
    }
  }

  /** Desktop demo helper: load a bundled sample page so the flow can be shown without a phone. */
  async function loadSamplePage() {
    try {
      setError(null);
      const res = await fetch("/demo-notebook.png");
      const blob = await res.blob();
      const dataUrl = await fileToDataUrl(new File([blob], "sample.png", { type: "image/png" }));
      dispatch({ type: "PHOTO", photo: dataUrl });
    } catch {
      setError("Couldn't load the sample page.");
    }
  }

  async function gradeNow() {
    if (!photo) return;
    setGrading(true);
    setError(null);
    const result = await writing.gradeNotebook({ imageDataUrl: photo, task, language, level: lesson.level });
    if (result.mock) setDemoMode(true);
    const { mock: _m, ...rest } = result;
    void _m;
    dispatch({ type: "GRADE", grade: rest as NotebookGrade });
    setGrading(false);
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="flex items-center gap-3">
        <Polo pose={grading ? "grade" : grade ? "celebrate" : "write"} size={84} />
        <div>
          <p className="text-sm font-semibold text-orange-deep">Notebook · {task.grammarFocus}</p>
          <h2 className="text-2xl font-bold leading-tight tracking-tighter">Write it by hand.</h2>
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {grade ? (
          <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt="Your notebook page" className="w-full rounded-2xl border border-line object-cover shadow-soft" />
              )}
              <div className="card p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-warm">Polo read</p>
                  <Stars value={grade.overall} />
                </div>
                <ol className="mt-3 space-y-3">
                  {grade.scores.map((s, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${s.correct ? "bg-[#E8F7EE] text-[#176B3A]" : "bg-[#FDECEC] text-[#B42318]"}`} aria-label={s.correct ? "Correct" : "Needs a fix"}>
                        {s.correct ? <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden /> : <X className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />}
                      </span>
                      <div className="min-w-0">
                        <p lang={language} className={`font-display text-[17px] font-semibold leading-snug tracking-tight ${s.correct ? "" : "text-[#B42318]"}`}>{grade.transcription[i] ?? s.sentence}</p>
                        {!s.correct && s.issue && <p className="mt-0.5 text-sm text-warm">{s.issue}</p>}
                        {!s.correct && s.fix && (
                          <p lang={language} className="mt-0.5 text-sm font-semibold text-[#176B3A]">
                            → {s.fix}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            <p className="mt-4 rounded-2xl bg-orange-soft px-4 py-3 text-[15px]">{grade.encouragement}</p>
            <div className="mt-4 flex gap-3">
              <Button variant="ghost" size="lg" onClick={() => dispatch({ type: "PHOTO", photo: photo ?? "" })} className="shrink-0">
                <RefreshCw className="h-4 w-4" aria-hidden /> Retake
              </Button>
              <Button size="lg" full onClick={onDone}>
                Finish lesson
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="task" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5">
            <div className="card p-5">
              <p className="text-[15px] leading-relaxed">{task.instruction}</p>
              <ol className="mt-4 space-y-2.5">
                {task.sentences.map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-orange text-sm font-bold text-white">{i + 1}</span>
                    <p className="pt-0.5 text-[16px] leading-snug">{s.prompt}</p>
                  </li>
                ))}
              </ol>
              <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="font-semibold text-warm">Use:</span>
                {task.targetVocab.map((v) => (
                  <span key={v} lang={language} className="rounded-full bg-orange-soft px-2.5 py-1 font-semibold text-orange-deep">{v}</span>
                ))}
              </div>
              {todaysWords.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="font-semibold text-warm">Bonus, from today's cards:</span>
                  {todaysWords.slice(0, 4).map((w) => (
                    <span key={w.id} lang={language} className="rounded-full border border-line px-2.5 py-1 font-semibold text-ink">{w.word}</span>
                  ))}
                </div>
              )}
            </div>

            {/* upload */}
            <div className="mt-4">
              <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="sr-only" onChange={onFile} aria-label="Take a photo of your notebook" />
              <input ref={uploadRef} type="file" accept="image/*" className="sr-only" onChange={onFile} aria-label="Upload a photo of your notebook" />
              {photo ? (
                <div className="relative overflow-hidden rounded-3xl border border-line bg-[#E9E2D9] p-2 shadow-soft">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo} alt="Preview of your notebook page" className="max-h-[360px] w-full rounded-2xl object-contain" />
                  <button type="button" onClick={() => dispatch({ type: "PHOTO", photo: "" })} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink shadow-soft" aria-label="Remove photo">
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <motion.button type="button" whileTap={{ scale: 0.98 }} onClick={() => cameraRef.current?.click()} className="flex h-32 flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-orange/50 bg-orange-mist text-orange-deep hover:bg-orange-soft">
                    <Camera className="h-7 w-7" aria-hidden />
                    <span className="text-sm font-bold">Take a photo</span>
                  </motion.button>
                  <motion.button type="button" whileTap={{ scale: 0.98 }} onClick={() => uploadRef.current?.click()} className="flex h-32 flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-line bg-white text-ink hover:bg-orange-mist">
                    <ImagePlus className="h-7 w-7" aria-hidden />
                    <span className="text-sm font-bold">Upload</span>
                  </motion.button>
                </div>
              )}
              {!photo && (
                <button type="button" onClick={() => void loadSamplePage()} className="mt-2 w-full text-center text-xs font-semibold text-warm hover:text-ink">
                  No notebook handy? Use a sample page
                </button>
              )}
              {error && <p className="mt-2 text-center text-xs font-medium text-[#B42318]">{error}</p>}
              {timeUp && !photo && <p className="mt-2 text-center text-xs font-semibold text-orange-deep" role="status">Time's up — snap the page when you've finished writing.</p>}
            </div>

            <Button size="xl" full className="mt-4" onClick={() => void gradeNow()} disabled={!photo || grading}>
              {grading ? "Polo is squinting at your handwriting…" : "Grade my page"}
            </Button>
            <button type="button" onClick={onDone} className="mt-3 w-full text-center text-sm font-semibold text-warm hover:text-ink">
              Skip the photo today
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
