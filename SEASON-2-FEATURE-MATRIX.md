# DJ Caspian Season 2 — Feature Implementation Matrix

Production `main` remains isolated until all release gates pass.

## Implemented on the Season 2 branch
- Carbon-blue / midnight-black / gold visual system.
- Discovery home, catalog search, redesigned library and favorites.
- Local recently played history.
- Persistent player controls, shuffle and repeat toggle.
- Interactive playback queue: add current track, inspect upcoming tracks, play queued track, reorder, remove and clear.
- Queue is currently local to this device and not yet synchronized.

## Backend foundation drafted, not deployed
- Additive Supabase schema proposal for user playlists, listening history, artist follows, saved albums, user follows, playback preferences, listening rooms/party queues and direct messages.
- Every proposed table must have owner/participant-scoped RLS and explicit grants.
- No schema migration has been applied to the connected production database.
- Existing profiles, roles, VIP entitlements, tracks, official playlists, likes, tickets and storage remain unchanged.

## Remaining feature work
### Discovery and player
- Artist, album and playlist detail pages.
- Queue persistence and full repeat modes (off / one / all).
- Autoplay, crossfade, normalization, audio quality settings and sleep timer.
- Radio, recommendations, Discover Weekly, Release Radar and Daily Mix.

### Personal library
- User playlist CRUD, reorder, public/private sharing and collaboration.
- Synced history, saved artists/albums and smart filters.
- Taste profile, listening stats and Wrapped.

### Social
- Public profiles, follows, listening activity and private sessions.
- Direct messages, track sharing, blocking and reporting.
- Collaborative playlists, Blend-style mixes and private Jam rooms.

### AI and media
- Server-side AI DJ and prompt-based playlists.
- Timed lyrics only from licensed or supplied data.
- Podcasts, audiobooks, music videos, events and merch from authorized providers.
- Offline mode for eligible licensed/user-owned assets.
- Remote device control only with a supported receiver integration.

## Release gates
1. TypeScript and production build pass on the latest branch head.
2. Mobile, tablet and desktop browser QA.
3. Playback QA with real uploaded audio and edge cases.
4. Auth, profile, VIP review/download and admin authorization regression checks.
5. RLS tests for every new table and Realtime channel.
6. Test any new schema on an isolated Supabase development branch before production.
7. No merge or deployment until the owner approves the tested preview.
