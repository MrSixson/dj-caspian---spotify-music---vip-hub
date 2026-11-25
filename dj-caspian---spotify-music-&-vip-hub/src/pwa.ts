const isLocalhost = ["localhost", "127.0.0.1"].includes(window.location.hostname);

export function registerPwa() {
  if (!("serviceWorker" in navigator)) return;
  if (window.location.protocol !== "https:" && !isLocalhost) return;

  window.addEventListener("load", () => {
    const serviceWorkerUrl = new URL("sw.js", import.meta.env.BASE_URL);
    navigator.serviceWorker.register(serviceWorkerUrl, {
      scope: import.meta.env.BASE_URL,
      type: "classic",
      updateViaCache: "none"
    }).catch((error) => {
      // PWA support must never prevent the main music site from starting.
      console.warn("[DJ Caspian] Service worker registration failed:", error);
    });
  }, { once: true });
}
