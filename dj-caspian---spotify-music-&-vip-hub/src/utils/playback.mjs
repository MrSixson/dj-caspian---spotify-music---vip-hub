/**
 * Pure playback-selection helpers shared by the app and Node's built-in tests.
 */

/** @template T @param {T[]} queue @param {T} track @returns {T[]} */
export function addTrackToQueue(queue, track) {
  return [...queue.filter((item) => item.id !== track.id), track];
}

/** @param {string[]} previous @param {string} trackId @param {number} [limit] @returns {string[]} */
export function addRecentTrack(previous, trackId, limit = 12) {
  if (!trackId || limit <= 0) return previous.slice(0, Math.max(0, limit));
  return [trackId, ...previous.filter((id) => id !== trackId)].slice(0, limit);
}

/**
 * @template T
 * @param {{tracks:T[], currentTrackId:string|null, queue:T[], isShuffle:boolean, random?:()=>number}} options
 * @returns {{track:T|null, remainingQueue:T[], fromQueue:boolean}}
 */
export function pickNextTrack({ tracks, currentTrackId, queue, isShuffle, random = Math.random }) {
  if (queue.length > 0) {
    return { track: queue[0], remainingQueue: queue.slice(1), fromQueue: true };
  }
  if (tracks.length === 0) {
    return { track: null, remainingQueue: queue, fromQueue: false };
  }
  if (isShuffle && tracks.length > 1) {
    const candidates = tracks.filter((track) => track.id !== currentTrackId);
    const value = Math.min(Math.max(random(), 0), 0.999999999);
    return { track: candidates[Math.floor(value * candidates.length)] ?? tracks[0], remainingQueue: queue, fromQueue: false };
  }
  const currentIndex = tracks.findIndex((track) => track.id === currentTrackId);
  const nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % tracks.length;
  return { track: tracks[nextIndex], remainingQueue: queue, fromQueue: false };
}
