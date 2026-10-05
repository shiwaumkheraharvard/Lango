"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { STORAGE_KEY } from "@/services/config";

/** "Start your lesson" → onboarding for new visitors, dashboard for returning ones. */
export function LandingCta({ size = "xl" }: { size?: "lg" | "xl" }) {
  const [href, setHref] = useState("/start");
  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY)) setHref("/today");
    } catch {
      /* ignore */
    }
  }, []);
  const cls = size === "xl" ? "h-14 px-7 text-lg" : "h-13 px-6 text-[17px]";
  return (
    <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="inline-block">
      <Link href={href} className={`inline-flex items-center gap-2.5 rounded-2xl bg-orange-deep font-bold text-white shadow-orange transition-colors hover:bg-[#d95500] ${cls}`}>
        Start your lesson
        <ArrowRight className="h-5 w-5" strokeWidth={2.5} aria-hidden />
      </Link>
    </motion.div>
  );
}
