import type { Track } from '../types';

type OfflineRecord = { id: string; title: string; artist: string; coverUrl: string; blob: Blob; savedAt: number };
const DB_NAME = 'dj-caspian-offline';
const STORE = 'tracks';
function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE, { keyPath: 'id' }); };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('ذخیره‌سازی آفلاین در این مرورگر فعال نیست.'));
  });
}
async function withStore<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore, resolve: (value: T) => void, reject: (reason?: unknown) => void) => void): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => { const tx = db.transaction(STORE, mode); run(tx.objectStore(STORE), resolve, reject); tx.oncomplete = () => db.close(); tx.onerror = () => { db.close(); reject(tx.error); }; });
}
export async function saveTrackOffline(track: Track, accessToken: string): Promise<void> {
  if (!track.audioUrl) throw new Error('فایل پخش این آهنگ در دسترس نیست.');
  const url = `https://irkdzjizhwxbmnnfyqsx.supabase.co/functions/v1/audio-gateway?track_id=${encodeURIComponent(track.id)}&mode=download`;
  const response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error(response.status === 401 || response.status === 403 ? 'ذخیره آفلاین فایل اصلی مخصوص حساب VIP است.' : 'دریافت فایل برای ذخیره آفلاین ناموفق بود.');
  const blob = await response.blob();
  if (!blob.size) throw new Error('فایل دریافتی خالی است.');
  await withStore<void>('readwrite', (store, resolve, reject) => { const req = store.put({ id: track.id, title: track.title, artist: track.artist, coverUrl: track.coverUrl, blob, savedAt: Date.now() } satisfies OfflineRecord); req.onsuccess = () => resolve(); req.onerror = () => reject(req.error); });
}
export async function listOfflineTracks(): Promise<OfflineRecord[]> {
  return withStore<OfflineRecord[]>('readonly', (store, resolve, reject) => { const req = store.getAll(); req.onsuccess = () => resolve((req.result || []).sort((a: OfflineRecord,b: OfflineRecord) => b.savedAt-a.savedAt)); req.onerror = () => reject(req.error); });
}
export async function removeOfflineTrack(id: string): Promise<void> {
  return withStore<void>('readwrite', (store, resolve, reject) => { const req = store.delete(id); req.onsuccess = () => resolve(); req.onerror = () => reject(req.error); });
}
export function offlineRecordToTrack(record: OfflineRecord, original?: Track): Track {
  return { ...(original || { id: record.id, title: record.title, artist: record.artist, album: '', duration: 0, genre: '', bpm: 0, plays: 0, likes: 0, releaseDate: '', isVipOnlyDownload: false, coverUrl: record.coverUrl }), audioUrl: URL.createObjectURL(record.blob) };
}
export type { OfflineRecord };
