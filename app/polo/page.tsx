import type { Metadata } from "next";
import { Polo, type PoloPose } from "@/components/polo/Polo";

export const metadata: Metadata = { title: "Polo poses" };

const POSES: { pose: PoloPose; used: string }[] = [
  { pose: "idle", used: "Dashboard, grammar rule" },
  { pose: "wave", used: "Landing, onboarding" },
  { pose: "listen", used: "Conversation — while you record" },
  { pose: "talk", used: "Conversation — while the tutor speaks" },
  { pose: "write", used: "Notebook block" },
  { pose: "grade", used: "Grading your photo" },
  { pose: "celebrate", used: "Day complete" },
  { pose: "sad", used: "Missed day, broken streak" },
  { pose: "sleep", used: "Reminder / settings" },
];

/** Dev gallery of every Polo pose. */
export default function PoloGallery() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-10 pb-28 md:pt-24">
      <h1 className="text-4xl font-bold tracking-tightest">Polo, in every mood.</h1>
      <p className="mt-2 text-warm">Nine animated poses, one confused polar bear.</p>
      <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
        {POSES.map(({ pose, used }) => (
          <li key={pose} className="card flex flex-col items-center p-4 text-center">
            <Polo pose={pose} talking size={160} />
            <p className="mt-2 font-display text-lg font-bold capitalize tracking-tighter">{pose}</p>
            <p className="text-xs text-warm">{used}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
