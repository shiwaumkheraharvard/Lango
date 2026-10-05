export function Pill({ children, tone = "soft", className = "" }: { children: React.ReactNode; tone?: "soft" | "orange" | "ink" | "green" | "outline"; className?: string }) {
  const tones = {
    soft: "bg-orange-soft text-orange-deep",
    orange: "bg-orange text-white",
    ink: "bg-ink text-white",
    green: "bg-[#E8F7EE] text-[#176B3A]",
    outline: "border border-line text-warm bg-white",
  };
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tracking-tight ${tones[tone]} ${className}`}>{children}</span>;
}
