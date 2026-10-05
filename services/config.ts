/**
 * Service configuration. MOCK is the default: every service reads/writes localStorage and the
 * AI routes fall back to canned responses when API keys are missing. To move to a real backend,
 * set NEXT_PUBLIC_LANGO_BACKEND=supabase and implement the matching adapter in each service file.
 */
export const BACKEND = (process.env.NEXT_PUBLIC_LANGO_BACKEND ?? "mock") as "mock" | "supabase";
export const MOCK = BACKEND === "mock";
export const STORAGE_KEY = "lango:v1";
/** Max real notebook photos kept in history before older ones degrade to placeholders. */
export const MAX_STORED_PHOTOS = 7;
