"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

/** Kick off store hydration on mount and report whether it is done. */
export function useHydrated(): boolean {
  const hydrated = useAppStore((s) => s.hydrated);
  const hydrate = useAppStore((s) => s.hydrate);
  useEffect(() => {
    void hydrate();
  }, [hydrate]);
  return hydrated;
}
