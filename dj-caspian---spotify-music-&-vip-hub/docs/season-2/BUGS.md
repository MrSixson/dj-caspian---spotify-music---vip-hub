# DJ Caspian Season 2 — Debug and QA register

Last updated: 2026-11-23  
Branch: `season-2/ui-foundation`  
Scope: Season 2 only. Do not merge into `main` until release gates pass.

## Fixed in this debugging pass

| ID | Severity | Area | Finding | Resolution |
|---|---|---|---|---|
| BUG-001 | High | Audio / track end | Progress-time threshold could call Next repeatedly near the end of a track. | Replaced threshold-based auto-advance with the media element's single `ended` event. |
| BUG-002 | Medium | Player / Repeat-One | Manual Next restarted the current track whenever Repeat-One was enabled. | Manual Next now skips; Repeat-One applies only to natural track completion. |
| BUG-003 | Medium | Queue / one-track catalog | Selecting the currently playing track from the queue, or advancing a one-track catalog, could be interpreted as Pause. | Added an explicit force-restart path for Next, Previous, and queue selection. |
| BUG-004 | Medium | Playback settings | End-of-track callback could retain stale Repeat / Shuffle / Queue state from the render in which playback began. | The ended handler now reads current settings through refs. |
| QA-001 | Medium | Regression coverage | Queue, shuffle and recent-history selection had no automated tests. | Added Node built-in tests and wired them into pull-request CI. |
| BUG-005 | Medium | Single-track catalog | Auto-advance at the end of a one-track catalog could try to replay the ended source; manually pressing Next could be confused with natural end. | Natural end now stops cleanly when no other track exists; manual Next and an explicitly queued current track restart intentionally. |

## Automated regression cases

- Queue priority and consuming exactly one queued item.
- Shuffle excludes the currently playing track.
- Normal Next advances and wraps.
- Unknown current track safely starts at the first item.
- Empty catalog returns no next track.\n- One-track catalog selection is deterministic and safe.
- Queue de-duplicates by track ID.
- Recently played moves the latest track to the front and respects the history limit.

Run locally from the nested app directory:
```bash
npm test
npm run lint
npm run build
```

## Manual QA still required

| ID | Priority | Test | Pass condition |
|---|---|---|---|
| QA-002 | P0 | Play, pause, resume and switch tracks on real Supabase audio | No stuck state, duplicate audio or silent playback. |
| QA-003 | P0 | Let a track finish with Repeat disabled | Exactly one transition to the next queued/catalog track. |
| QA-004 | P0 | Let a track finish with Repeat-One enabled, then press Next manually | Natural end restarts once; manual Next skips to the next track. |
| QA-005 | P1 | Seek while playing and while paused | Time/progress remain synchronized; invalid values cannot move outside media duration. |
| QA-006 | P1 | Queue add, remove, play queued item, duplicate add, and queue item equal to current track | Queue order remains deterministic and playback never accidentally pauses. |
| QA-007 | P1 | Shuffle with two or more tracks and with one track | No immediate repeat when alternatives exist; one-track catalog restarts safely. |
| QA-008 | P1 | Mobile widths 360px, 390px and tablet/desktop | Player controls, queue popover, cards and navigation have no clipping or horizontal overflow. |
| QA-009 | P1 | Login, logout, liked tracks, playlists, VIP and admin routes | Existing Season 1 flows remain intact. |
| QA-010 | P2 | Empty catalog, missing cover, missing duration and expired audio URL | Clear empty/error states; no crash. |

## Known external / release blockers

- The site's scheduled maintenance screen is currently active, so visual browser QA against the normal app is deferred until it expires.
- Supabase advisors previously flagged SECURITY DEFINER waitlist RPCs, leaked-password protection disabled, and multiple permissive policies. These need a targeted security review. No live schema or data changes are authorized by this debug pass.
- Browser/device playback and responsive checks are not claimed as passed until actually run.

## Release rule

Keep this branch and PR as draft until all P0/P1 manual checks pass, Supabase findings are reviewed, and the final build is green. Never deploy this branch to GitHub Pages as part of debugging.
