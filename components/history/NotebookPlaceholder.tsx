/** A fake "photo" of a notebook page with handwritten sentences, used for seeded history. */
export function NotebookPlaceholder({ lines, variant = 1, className = "" }: { lines: string[]; variant?: number; className?: string }) {
  const tilt = [-1.2, 0.8, -0.5, 1.4][(variant - 1) % 4];
  const ink = ["#2B3A67", "#1A1A1A", "#1F3B5C", "#3A2E2B"][(variant - 1) % 4];
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-[#E9E2D9] p-3 ${className}`} role="img" aria-label="Photo of a handwritten notebook page">
      <div className="notebook-lines relative rounded-md shadow-[0_6px_18px_rgba(0,0,0,0.18)]" style={{ transform: `rotate(${tilt}deg)` }}>
        <div className="absolute left-0 top-0 h-full w-[44px]" aria-hidden />
        <ol className="relative space-y-0 pb-6 pl-14 pr-5 pt-[14px]" style={{ fontFamily: "var(--font-hand), cursive" }}>
          {lines.map((l, i) => (
            <li key={i} className="h-8 text-[22px] leading-8 tracking-tight" style={{ color: ink, transform: `translateY(${(i % 2) * 1.5}px) rotate(${(i % 3) * 0.3 - 0.3}deg)` }}>
              {i + 1}. {l}
            </li>
          ))}
        </ol>
        <div className="pointer-events-none absolute inset-0 rounded-md bg-gradient-to-br from-white/40 via-transparent to-black/5" aria-hidden />
      </div>
    </div>
  );
}
