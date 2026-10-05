import Link from "next/link";
import { Brain, Mic, PenLine } from "lucide-react";
import { Polo } from "@/components/polo/Polo";
import { LandingCta } from "@/components/landing/LandingCta";

const BENEFITS = [
  { Icon: Mic, title: "Talk", body: "A real back-and-forth with Polo, out loud. He answers in the language and slips you one gentle fix per turn." },
  { Icon: Brain, title: "Remember", body: "Spaced-repetition flashcards (real SM-2) show you each word right before you'd forget it." },
  { Icon: PenLine, title: "Write", body: "Handwrite a few sentences in a paper notebook, snap a photo, and get it graded sentence by sentence." },
];

const BLOCKS = [
  { label: "Flashcards", min: 5 },
  { label: "Conversation", min: 8 },
  { label: "Grammar rule", min: 2 },
  { label: "Notebook", min: 5 },
];

export default function LandingPage() {
  return (
    <main className="relative overflow-hidden">
      {/* Hero */}
      <section className="mesh grain relative">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8">
          <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-tighter">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-orange shadow-orange">
              <svg viewBox="0 0 64 64" className="h-6 w-6" aria-hidden><circle cx="32" cy="30" r="17" fill="#fff"/><circle cx="19" cy="18" r="5" fill="#fff"/><circle cx="45" cy="18" r="5" fill="#fff"/><circle cx="26" cy="29" r="2.2" fill="#1A1A1A"/><circle cx="38" cy="29" r="2.2" fill="#1A1A1A"/><ellipse cx="32" cy="36" rx="3.2" ry="2.4" fill="#1A1A1A"/><path d="M14 46q18 8 36 0v6q-18 8-36 0z" fill="#E85D04"/></svg>
            </span>
            Lango
          </Link>
          <Link href="/today" className="rounded-full border border-line bg-white/70 px-4 py-2 text-sm font-semibold text-ink backdrop-blur hover:bg-white">
            Open app
          </Link>
        </header>

        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-20 pt-6 md:grid-cols-[1.1fr_0.9fr] md:px-8 md:pb-28 md:pt-14">
          <div className="relative z-10">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange/30 bg-white/70 px-3 py-1 text-xs font-semibold tracking-tight text-orange-deep backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-orange" aria-hidden />
              Russian · Spanish · 10, 20 or 30 minutes a day
            </p>
            <h1 className="text-[44px] font-bold leading-[0.98] tracking-tightest text-ink sm:text-6xl md:text-7xl">
              Say one thing in <span className="text-orange-deep">Russian</span> today.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-warm md:text-xl">
              One short lesson a day: flashcards that remember for you, a spoken conversation with a polar bear who corrects you kindly, and a notebook page you actually write by hand.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <LandingCta />
              <span className="text-sm font-medium text-warm">Runs fully in demo mode. No account.</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[380px] md:max-w-none">
            <div className="absolute inset-x-6 bottom-4 top-10 -z-0 rounded-[40px] bg-white/60 shadow-soft backdrop-blur-sm md:inset-x-10" aria-hidden />
            <div className="relative px-6 pt-4 md:px-10">
              <Polo pose="wave" size="100%" className="mx-auto block max-h-[380px] w-full" label="Polo the polar bear waving hello" />
            </div>
            <div className="absolute -left-2 top-6 rounded-2xl bg-white px-3.5 py-2 text-sm font-semibold shadow-lift md:left-2">
              Привет! 👋
            </div>
            <div className="absolute -right-1 bottom-12 rounded-2xl bg-ink px-3.5 py-2 text-sm font-semibold text-white shadow-lift md:right-4">
              ¡Hola!
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24" aria-labelledby="benefits">
        <h2 id="benefits" className="text-3xl font-bold tracking-tighter md:text-5xl">
          Three things, every day.
        </h2>
        <p className="mt-3 max-w-2xl text-lg text-warm">Fluency is a habit, not a course. Lango keeps the habit tiny enough to keep.</p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {BENEFITS.map(({ Icon, title, body }) => (
            <article key={title} className="card group p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lift">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-soft text-orange-deep transition-colors group-hover:bg-orange group-hover:text-white">
                <Icon className="h-6 w-6" strokeWidth={2.2} aria-hidden />
              </span>
              <h3 className="mt-5 text-2xl font-bold tracking-tighter">{title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-warm">{body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Lesson shape */}
      <section className="mx-auto max-w-6xl px-5 pb-16 md:px-8 md:pb-24" aria-labelledby="shape">
        <div className="mesh-strong relative overflow-hidden rounded-[32px] p-7 text-white shadow-lift md:p-12">
          <div className="relative z-10 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <h2 id="shape" className="text-3xl font-bold tracking-tighter md:text-5xl">A 20-minute lesson looks like this.</h2>
              <p className="mt-3 max-w-lg text-white/85">Four blocks, in order. End one early and the time rolls into the next. Finish all four and the day lights up on your calendar.</p>
            </div>
            <ol className="flex flex-wrap gap-2 md:justify-end">
              {BLOCKS.map((b, i) => (
                <li key={b.label} className="flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-2 text-sm font-semibold backdrop-blur">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-xs font-bold text-orange-deep">{i + 1}</span>
                  {b.label}
                  <span className="text-white/70">{b.min} min</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="pointer-events-none absolute -bottom-10 -right-6 hidden opacity-90 sm:block md:-right-2">
            <Polo pose="idle" size={200} />
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-sm text-warm md:flex-row md:items-center md:justify-between md:px-8">
          <p className="font-semibold text-ink">Lango</p>
          <p>Russian and Spanish. Guided by Polo, who is also learning. Demo mode runs entirely without API keys.</p>
          <nav aria-label="Footer" className="flex gap-4">
            <Link href="/start" className="hover:text-ink">Start</Link>
            <Link href="/today" className="hover:text-ink">Today</Link>
            <Link href="/history" className="hover:text-ink">History</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
