# DJ Caspian PWA foundation

## Current implementation

- The web app remains the existing React + Vite SPA.
- The PWA manifest is served from `public/manifest.webmanifest`.
- The service worker is served from `public/sw.js` and is registered only on HTTPS (or localhost).
- All URLs and the service-worker scope are derived from Vite's `BASE_URL`, which is required for the GitHub Pages project subpath.
- The existing Supabase Auth, database, storage, player, and user interfaces remain shared with the website. No second backend or database is introduced.

## Cache and privacy rules

- The service worker only handles same-origin GET requests inside the app scope.
- Auth, REST, Storage, Functions, Realtime and other API paths are excluded.
- Audio streams and media downloads are not cached.
- Only static application assets are cached.
- Navigation is network-first with a small offline fallback page.
- User-specific responses and credentials are never intentionally written to Cache Storage.

## Installation

- Android: supported browsers can offer installation from the browser UI.
- iOS: users add the site to the Home Screen from Safari's Share menu. The existing official brand image remains the Apple touch icon.
- Web Push is not part of this foundation and will be implemented only after permission UX and delivery infrastructure are designed.

## Validation still required before merge

1. Run `npm ci`, `npm run lint`, `npm test`, and `npm run build` from this app directory.
2. Confirm the deployed manifest URL and service-worker URL resolve beneath `/dj-caspian---spotify-music---vip-hub/`.
3. Inspect the browser Application panel: manifest, service-worker scope, installability, and cache contents.
4. Test Android install and iOS Safari Add to Home Screen.
5. Test offline navigation after at least one successful online visit.
6. Confirm Supabase Auth, REST, Storage, playback, and embedded Donito widgets still behave normally.

Do not merge or publish until the CI build and browser checks pass.
