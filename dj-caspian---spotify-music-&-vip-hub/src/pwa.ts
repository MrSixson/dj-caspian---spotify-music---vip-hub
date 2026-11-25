import { audioEngine } from './utils/audioEngine';

const isLocalhost = ["localhost", "127.0.0.1"].includes(window.location.hostname);

export function registerPwa() {
  if (!("serviceWorker" in navigator)) return;
  if (window.location.protocol !== "https:" && !isLocalhost) return;

  window.addEventListener("load", () => {
    const appBase = new URL(import.meta.env.BASE_URL, window.location.origin);
    const serviceWorkerUrl = new URL("sw.js", appBase);
    const versionUrl = new URL("version.json", appBase);
    let pendingBuildId: string | null = null;
    let pausedSince: number | null = null;
    let reloadStarted = false;
    let registration: ServiceWorkerRegistration | null = null;

    const reloadWhenSafe = () => {
      if (!pendingBuildId || reloadStarted) return;
      const audioIsPlaying = !audioEngine.getDebugInfo().paused;
      if (audioIsPlaying) {
        pausedSince = null;
        return;
      }
      if (document.visibilityState !== "visible") return;
      if (pausedSince === null) pausedSince = Date.now();
      // Never cut off a track or a short pause between tracks.
      if (Date.now() - pausedSince < 5000) return;

      const reloadKey = "dj-caspian-auto-reloaded-build";
      if (sessionStorage.getItem(reloadKey) === pendingBuildId) return;
      sessionStorage.setItem(reloadKey, pendingBuildId);
      reloadStarted = true;
      window.location.reload();
    };

    const checkForUpdate = async () => {
      try {
        const marker = new URL(versionUrl);
        marker.searchParams.set("check", String(Date.now()));
        const response = await fetch(marker, {
          cache: "no-store",
          credentials: "same-origin"
        });
        if (!response.ok) return;

        const data: unknown = await response.json();
        if (!data || typeof data !== "object" || !("buildId" in data)) return;
        const serverBuildId = (data as { buildId?: unknown }).buildId;
        if (typeof serverBuildId !== "string" || !serverBuildId) return;

        if (serverBuildId !== __DJ_CASPIAN_BUILD_ID__) {
          pendingBuildId = serverBuildId;
          reloadWhenSafe();
        }
      } catch {
        // Temporary network failures must not interrupt playback or app startup.
      }
    };

    const checkServiceWorker = () => {
      if (registration) void registration.update().catch(() => undefined);
      void checkForUpdate();
    };

    const updateTimer = window.setInterval(() => {
      if (document.visibilityState === "visible") checkServiceWorker();
      reloadWhenSafe();
    }, 45000);

    window.addEventListener("focus", checkServiceWorker);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") checkServiceWorker();
      reloadWhenSafe();
    });

    navigator.serviceWorker.register(serviceWorkerUrl, {
      scope: appBase.pathname,
      type: "classic",
      updateViaCache: "none"
    }).then((activeRegistration) => {
      registration = activeRegistration;
      checkServiceWorker();
      activeRegistration.addEventListener("updatefound", () => {
        const installing = activeRegistration.installing;
        if (!installing) return;
        installing.addEventListener("statechange", () => {
          if (installing.state === "installed" && navigator.serviceWorker.controller) {
            void checkForUpdate();
          }
        });
      });
    }).catch((error) => {
      // PWA support must never prevent the main music site from starting.
      console.warn("[DJ Caspian] Service worker registration failed:", error);
    });

    // Also check the build marker if service-worker support is unavailable.
    void checkForUpdate();
    window.addEventListener("beforeunload", () => window.clearInterval(updateTimer), { once: true });
  }, { once: true });
}
