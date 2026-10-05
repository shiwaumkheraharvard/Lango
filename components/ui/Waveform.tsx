"use client";

import { motion } from "framer-motion";

/** Animated bars driven by live audio levels (0..1 per bar). */
export function Waveform({ levels, active, color = "#FF6B1A", className = "" }: { levels: number[]; active: boolean; color?: string; className?: string }) {
  return (
    <div className={`flex h-12 items-center justify-center gap-[3px] ${className}`} aria-hidden>
      {levels.map((v, i) => (
        <motion.span
          key={i}
          className="w-[4px] rounded-full"
          style={{ backgroundColor: color }}
          animate={{ height: active ? Math.max(6, Math.min(48, 6 + v * 46)) : 6, opacity: active ? 1 : 0.35 }}
          transition={{ type: "spring", stiffness: 500, damping: 28, mass: 0.4 }}
        />
      ))}
    </div>
  );
}
