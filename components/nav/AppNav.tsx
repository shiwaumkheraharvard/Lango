"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { CalendarDays, Layers, Settings, Sun } from "lucide-react";

const TABS = [
  { href: "/today", label: "Today", Icon: Sun },
  { href: "/review", label: "Review", Icon: Layers },
  { href: "/history", label: "History", Icon: CalendarDays },
  { href: "/settings", label: "Settings", Icon: Settings },
];

const HIDDEN = ["/", "/start", "/lesson"];

export function AppNav() {
  const pathname = usePathname();
  if (!pathname || HIDDEN.includes(pathname)) return null;
  return (
    <>
      {/* Mobile bottom bar */}
      <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-40 md:hidden">
        <div className="mx-auto max-w-md px-4 pb-[max(env(safe-area-inset-bottom),12px)]">
          <div className="card flex items-center justify-between rounded-[22px] px-2 py-1.5 shadow-lift backdrop-blur-md">
            {TABS.map(({ href, label, Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className="relative flex min-w-[64px] flex-col items-center gap-0.5 rounded-2xl px-3 py-2 text-[11px] font-semibold text-warm"
                >
                  {active && (
                    <motion.span
                      layoutId="tab-bg"
                      className="absolute inset-0 rounded-2xl bg-orange-soft"
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  )}
                  <Icon className={`relative h-5 w-5 ${active ? "text-orange-deep" : ""}`} strokeWidth={2.2} aria-hidden />
                  <span className={`relative ${active ? "text-ink" : ""}`}>{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Desktop top bar */}
      <nav aria-label="Primary" className="fixed inset-x-0 top-0 z-40 hidden md:block">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/today" className="flex items-center gap-2 font-display text-xl font-bold tracking-tighter">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-orange text-white shadow-orange">
              <svg viewBox="0 0 64 64" className="h-6 w-6" aria-hidden><circle cx="32" cy="30" r="17" fill="#fff"/><circle cx="19" cy="18" r="5" fill="#fff"/><circle cx="45" cy="18" r="5" fill="#fff"/><circle cx="26" cy="29" r="2.2" fill="#1A1A1A"/><circle cx="38" cy="29" r="2.2" fill="#1A1A1A"/><ellipse cx="32" cy="36" rx="3.2" ry="2.4" fill="#1A1A1A"/><path d="M14 46q18 8 36 0v6q-18 8-36 0z" fill="#E85D04"/></svg>
            </span>
            Lango
          </Link>
          <div className="card flex items-center gap-1 rounded-full px-1.5 py-1.5">
            {TABS.map(({ href, label, Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${active ? "text-ink" : "text-warm hover:text-ink"}`}
                >
                  {active && (
                    <motion.span layoutId="tab-bg-desktop" className="absolute inset-0 rounded-full bg-orange-soft" transition={{ type: "spring", stiffness: 500, damping: 40 }} />
                  )}
                  <Icon className={`relative h-4 w-4 ${active ? "text-orange-deep" : ""}`} strokeWidth={2.2} aria-hidden />
                  <span className="relative">{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
