# DJ Caspian Season 2 — Feature Implementation Matrix

Production `main` remains isolated until all release gates pass.

## Implemented on the Season 2 branch
- Carbon-blue / midnight-black / gold visual system.
- Discovery home, catalog search, redesigned library and favorites.
- Local recently played history.
- Persistent player controls, shuffle and repeat toggle.
- Interactive playback queue: add current track, inspect upcoming tracks, play queued track, reorder, remove and clear.
- Queue persists in localStorage on the current device; track-end auto-advance reads live queue state and repeat-one state.
- One-click add-to-queue actions are available from Home, Search and Library track cards.
- Create personal playlists per signed-in account, add tracks from the Library, open them from Home/Sidebar/Library, and delete them.
- Personal playlists are currently stored locally on this device per account; they are not synced to Supabase or other devices.
- Volume, shuffle and repeat-one preferences persist locally.
- Keyboard shortcuts: Space play/pause, arrow keys seek, Ctrl/Cmd+K opens search, Escape closes overlays.
- Shuffle avoids immediately selecting the currently playing track when multiple tracks exist.
- Artist and album collection detail views with real catalog tracks.
- Playlist detail view with the playlist's actual track membership.
- Taste-based recommendations using the user's real liked/recent tracks, artist and genre affinity, and catalog play counts.
- Queue and recommendations are currently local/client-side; history and queue do not sync across devices.

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
- Cloud-synced user playlists, playlist editing/reordering, public/private sharing and collaboration.
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

## Visual and performance pass
- Cinematic layered gradients, gold/blue edge lighting, improved card depth and hierarchy.
- Responsive player sizing for narrow mobile screens and safe-area padding.
- Memoized Home recommendations, popular tracks, recent-track lookup and Search filtering.
- Removed blanket blur from every content card to reduce GPU compositing cost.
- Update-break countdown stops its one-second timer after expiry.

## Release gates
1. TypeScript and production build pass on the latest branch head.
2. Mobile, tablet and desktop browser QA.
3. Playback QA with real uploaded audio and edge cases.
4. Auth, profile, VIP review/download and admin authorization regression checks.
5. RLS tests for every new table and Realtime channel.
6. Test any new schema on an isolated Supabase development branch before production.
7. No merge or deployment until the owner approves the tested preview.
