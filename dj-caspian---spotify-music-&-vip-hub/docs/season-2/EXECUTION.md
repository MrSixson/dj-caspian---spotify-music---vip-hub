# DJ Caspian — Season 2 execution

This work is isolated on `season-2/ui-foundation`. Season 1's `main` branch is not modified or deployed by these commits.

## Phase 1 — Foundation and safety
- [x] Confirm the Season 2 branch exists and is separate from `main`.
- [x] Confirm the nested app root and GitHub Pages build working directory.
- [x] Inspect the current React/Vite app, player, catalog service, Supabase integration, and architecture notes.
- [x] Keep the existing Supabase project and schema; no destructive database operation is part of this phase.

## Phase 2 — UI/UX
- [x] Extend the carbon / deep-blue / gold design tokens and responsive polish without replacing existing app flows.
- [x] Align browser theme color and text-selection branding.
- [x] Add catalog-driven artist and album discovery sections to the home page.
- [ ] Complete a real browser pass on desktop and mobile after the maintenance screen is lifted.

## Phase 3 — Music engine
- [x] Preserve the existing real-audio engine and persistent bottom player.
- [x] Correct repeat-one behavior so it restarts the current source instead of pausing it.
- [x] Prevent shuffle from immediately selecting the currently playing track when alternatives exist.
- [x] Make Previous restart the current track when playback is beyond the first three seconds.\n- [x] Read real media duration from the audio element when legacy Supabase track rows have an empty duration field.
- [ ] Validate streaming, seeking, volume, and track-end transitions against real catalog audio in a browser.

## Phase 4 — Product features and data
- [x] Retain existing Supabase-backed auth, catalog, likes, playlists, VIP tickets, and admin flows.
- [x] Build artist and album groupings from the live track catalog without duplicating records in the database.
- [x] Finish playlist detail/playback flow, interactive queue, and recently-played persistence.
- [x] Inspect public-table RLS policies and deployed Edge Function authorization paths.\n- [x] Run Supabase security and performance advisors; retain findings for targeted hardening rather than making risky live-schema changes.

## Phase 5 — Release readiness
- [x] Preserve the existing canonical URL, metadata, Open Graph, robots.txt, and sitemap.
- [x] Keep the existing GitHub Pages deployment workflow unchanged.
- [ ] Run TypeScript validation and production build on the Season 2 branch.
- [ ] Run responsive, accessibility, auth, player, VIP, and admin regression checks.
- [ ] Merge and publish only after explicit review; no Season 2 deployment is performed by these changes.

## Verification notes
- The connected Supabase project `dj-caspian` is reported as `ACTIVE_HEALTHY`.\n- Live catalog query returned 11 tracks; all 11 have audio and cover paths, but their stored duration strings are empty. The player now falls back to actual media metadata for progress and end-of-track handling. The project currently has 0 playlists and 1 profile.
- Public tables inspected in the project have RLS enabled. No schema, row, Storage, Auth, or Edge Function changes were made.
- The app currently has a time-based maintenance screen through 2026-11-25 09:34 UTC, so an in-browser visual regression pass is deferred until the normal app is available.\n- Supabase advisors flagged the public waitlist RPCs as SECURITY DEFINER, the waitlist stats table has RLS enabled without direct policies, leaked-password protection is disabled, and some tables have multiple permissive policies. The waitlist RPCs appear intentionally public; no live database changes were made. Review and harden these separately before production release.
