# DJ CASPIAN — SEASON 2 ROADMAP

## Release strategy
Season 2 is developed on `season-2-v2.0.0`. The production `main` branch remains the Season 1 / update-break release until the new version passes build, data-safety, responsive and playback checks. No Season 2 code is deployed to production from this branch.

## v2.0.0 — New listening experience
- Carbon-blue, midnight-black and champagne-gold visual system.
- New artist-led discovery home with fresh releases, playlists and popular tracks.
- Persistent recently-played history stored locally on the visitor's device.
- Responsive discovery cards, track rows, navigation and persistent player.
- Official DJ Caspian logo across app branding, auth, update-break page and browser/social metadata.
- Persian-first SEO metadata, MusicGroup structured data, robots.txt and sitemap.xml.
- Reuse the existing Supabase auth, catalog, likes, VIP entitlements, receipts and admin workflows. Do not reset or overwrite production data.

## v2.1.0 — Discovery and playback
- Search improvements: live query, genre filters, artist and album grouping.
- Dedicated artist and album views.
- Playlist detail view with real track membership.
- Queue management and clear next/up-next behavior.
- Playback edge-case fixes for repeat, track end, and restoring the current session.

## v2.2.0 — Personal library
- User-owned playlists with persistent Supabase storage and access policies.
- Recently played sync across signed-in devices, with local fallback.
- Follow/save artists and albums.
- Account library management and safe profile migration.

## v2.3.0 — Listening intelligence
- Radio / station experiences based on real catalog metadata.
- Recommendation rows based on actual play and like data (no fabricated popularity).
- Lyrics view when licensed or supplied lyrics are available.
- Optional crossfade only after playback timing is validated on mobile and desktop.

## Launch gates
- TypeScript validation and production build pass.
- Mobile, tablet and desktop layout checks.
- Authentication, admin permissions, VIP purchase review and download gateway remain functional.
- Existing accounts, tracks, playlists, likes, VIP tickets and storage assets remain intact.
- Playback tests pass with real uploaded audio.
- Google Search Console ownership verification and indexing request are completed when the site owner supplies the verification token or grants access.

## Data safety
No schema migrations or destructive database operations are part of v2.0.0. Any future Supabase schema change must be additive, reviewed, and tested against existing data before production rollout.
