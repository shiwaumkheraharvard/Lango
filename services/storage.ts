import type { PersistedState } from "@/data/types";
import { STORAGE_KEY } from "./config";

/** SSR-safe localStorage adapter with an in-memory fallback. */
let memory: string | null = null;

function hasLocalStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

export function loadState(): PersistedState | null {
  try {
    const raw = hasLocalStorage() ? window.localStorage.getItem(STORAGE_KEY) : memory;
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (parsed.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveState(state: PersistedState): void {
  const raw = JSON.stringify(state);
  if (hasLocalStorage()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, raw);
      return;
    } catch (e) {
      // Quota exceeded: drop stored photos and retry once.
      const slim: PersistedState = {
        ...state,
        history: Object.fromEntries(
          Object.entries(state.history).map(([k, v]) => [
            k,
            v.notebook ? { ...v, notebook: { ...v.notebook, photo: "placeholder:1" } } : v,
          ]),
        ),
      };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
      } catch {
        console.warn("Lango: could not persist state", e);
      }
      return;
    }
  }
  memory = raw;
}

export function clearState(): void {
  if (hasLocalStorage()) window.localStorage.removeItem(STORAGE_KEY);
  memory = null;
}
