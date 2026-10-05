"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { buildFlashcardQueue } from "@/lib/lesson-engine";
import { useHydrated } from "@/lib/useHydrated";
import { useAppStore } from "@/store/useAppStore";
import { FlashcardDeck } from "@/components/lesson/FlashcardDeck";
import { Polo } from "@/components/polo/Polo";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";

export function Review() {
  const hydrated = useHydrated();
  const { profile, cards, counts, today } = useAppStore();
  const [session, setSession] = useState(0);
  const [finished, setFinished] = useState(false);

  // Build the queue once per session so grading doesn't reshuffle the deck under the learner.
  const queue = useMemo(() => {
    if (!profile) return [];
    return buildFlashcardQueue(cards, profile.level, today, 30);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, hydrated, profile?.language]);

  if (!hydrated || !profile) return <PageSkeleton />;

  return (
    <main className="mx-auto max-w-2xl px-5 pb-32 pt-6 md:pt-24">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-orange-deep">Review</p>
          <h1 className="text-4xl font-bold tracking-tightest">Due cards</h1>
          <p className="mt-1 text-warm">
            {counts.due} due · {counts.fresh} new · {counts.learned} learned
          </p>
        </div>
        <Polo pose={finished || queue.length === 0 ? "celebrate" : "idle"} size={96} />
      </div>

      <div className="mt-6">
        {queue.length === 0 || finished ? (
          <div className="card flex flex-col items-center p-8 text-center">
            <h2 className="text-2xl font-bold tracking-tighter">Nothing due right now.</h2>
            <p className="mt-1 max-w-sm text-warm">Spaced repetition means you review right before you forget. Come back tomorrow, or peek at history.</p>
            <div className="mt-5 flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setFinished(false);
                  setSession((s) => s + 1);
                }}
              >
                Check again
              </Button>
              <Link href="/history" className="inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-5 text-[15px] font-semibold text-white hover:bg-black">
                History <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        ) : (
          <FlashcardDeck key={session} queue={queue} language={profile.language} muted={profile.muteTutor} onFinished={() => setFinished(true)} />
        )}
      </div>
    </main>
  );
}
