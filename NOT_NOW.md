# Not now

Things that were tempting but are out of scope for this version.

- Real auth (Supabase Auth) and per-user cloud sync — services are shaped for it; flip `services/config.ts`.
- Real database for cards/history (Supabase Postgres) — `services/*` mock implementations are the only thing to replace.
- Push/email reminders at the configured time (needs a backend scheduler + notification permission flow).
- Leagues, XP, leaderboards, friends.
- Payments / subscriptions.
- More languages (content pipeline supports it: add `data/*/{lang}-*.ts` + grammar topics).
- Native apps / PWA install prompt + offline caching of audio.
- Streak freezes / vacation mode.
- Handwriting practice for the Cyrillic alphabet itself (tracing).
- Speaking pronunciation scoring (phoneme-level feedback).
