# DJ CASPIAN — SEASON 2 ROADMAP

## Release strategy
Season 2 is developed on `season-2-v2.0.0`. The production `main` branch remains the Season 1 / update-break release until the new version passes build, data-safety, responsive and playback checks. No Season 2 code is deployed to production from this branch.

## v2.0.0 — New listening experience
- Carbon-blue, midnight-black and champagne-gold visual system.
- New artist-led discovery home with fresh releases, playlists and popular tracks.
- Persistent recently-played history stored locally on the visitor's device.
- Responsive discovery cards, track rows, navigation and persistent player.
- Live catalog search across track title, artist, genre, album and description.
- Dynamic genre filters, sorting by newest / popularity / title, plus artist and album discovery shortcuts.
- Redesigned library and favorites views with VIP-aware download actions.
- Official DJ Caspian logo across app branding, auth, update-break page and browser/social metadata.
- Persian-first SEO metadata, MusicGroup structured data, robots.txt and sitemap.xml.
- Reuse the existing Supabase auth, catalog, likes, VIP entitlements, receipts and admin workflows. Do not reset or overwrite production data.

## v2.1.0 — Discovery and playback (in progress)
- [x] Interactive local playback queue: add current track, open queue, play a queued item, remove, reorder and clear.
- [ ] Queue persistence across refreshes and signed-in devices.
- [ ] Dedicated artist, album and playlist detail pages with real catalog relationships.
- [ ] Playback lifecycle tests: track end, repeat-one/repeat-all, shuffle, missing audio and mobile background behavior.

## v2.2.0 — Personal library and accounts
- [ ] User-owned playlists, edit permissions, public/private visibility and collaborative membership.
- [ ] Recently played sync across signed-in devices, with local fallback.
- [ ] Follow/save artists, albums, playlists and users.
- [ ] Smart library filters and hidden/excluded tracks.
- [ ] Taste profile and weekly listening statistics.
- [ ] Safe account/profile migration without overwriting existing profile or VIP state.

## v2.3.0 — Listening intelligence
- [ ] Radio / station experiences from real catalog metadata.
- [ ] Recommendations from actual listening history, likes, follows and skips.
- [ ] Discover Weekly, Release Radar, Daily Mix and prompt-based playlist generation.
- [ ] Caspian AI DJ with text requests; voice requests after a speech provider is configured.
- [ ] Lyrics with timed line sync only when licensed or supplied by the rights holder.
- [ ] Crossfade, normalization and quality settings after real playback validation.

## v2.4.0 — Social and multiplayer
- [ ] Public profiles, follows, listening activity and private sessions.
- [ ] In-app track sharing and direct messages with safe inbox controls.
- [ ] Listening Party / Caspian Jam with private Realtime channels, host controls and synced playback.
- [ ] Collaborative playlists and Blend-style shared mixes.
- [ ] User privacy controls, blocking and report flows.

## v2.5.0 — Media and premium ecosystem
- [ ] Podcast catalog and episode playback.
- [ ] Audiobooks only with distribution rights and licensed sources.
- [ ] Music video support only for owned or licensed assets.
- [ ] Concert/event discovery from a real provider.
- [ ] Artist merch links and official artist pages.
- [ ] Browser-local file playback without uploading private files.
- [ ] PWA installability and offline caching for eligible licensed downloads.
- [ ] Device handoff only with a compatible receiver/device API.

## v3.0.0 — Caspian signature features
- [ ] Caspian Wrapped: annual and weekly listening stories from actual event data.
- [ ] AI Playlist studio with prompt editing and user-controlled generation.
- [ ] Caspian Party rooms, public charts and curated editorial collections.
- [ ] VIP features enforced server-side, not by UI-only flags.

## External requirements and limits
- AI DJ and prompt playlists need a server-side model provider key plus budget/rate limits; no secret key may ship to the browser.
- Lyrics, commercial recordings, music videos, podcasts and audiobooks require rights or licensed content feeds.
- Offline playback must respect content rights, signed URL expiry and VIP entitlements; browser cache is not a substitute for licensed DRM.
- Lossless streaming requires genuine lossless source files and a compatible delivery pipeline.
- Spotify Connect-style control requires a receiver/device integration.
- Jam/Party requires authenticated private Realtime channels, membership policies and playback drift correction.

## Launch gates
- TypeScript validation and production build pass.
- Mobile, tablet and desktop layout checks.
- Authentication, admin permissions, VIP purchase review and download gateway remain functional.
- Existing accounts, tracks, playlists, likes, VIP tickets and storage assets remain intact.
- Playback tests pass with real uploaded audio.
- Google Search Console ownership verification and indexing request are completed when the site owner supplies the verification token or grants access.

## Data safety
No schema migrations or destructive database operations are part of v2.0.0. Any future Supabase schema change must be additive, reviewed, and tested against existing data before production rollout.
