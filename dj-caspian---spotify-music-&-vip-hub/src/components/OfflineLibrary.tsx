import React, { useEffect, useMemo, useState } from 'react';
import { Download, HardDriveDownload, Trash2, Play, RefreshCw, WifiOff } from 'lucide-react';
import type { Track, UserAccount } from '../types';
import { supabase } from '../lib/supabase';
import { listOfflineTracks, offlineRecordToTrack, removeOfflineTrack, saveTrackOffline, type OfflineRecord } from '../lib/offlineLibrary';

export const OfflineLibrary: React.FC<{ user: UserAccount; tracks: Track[]; onPlayTrack: (track: Track) => void }> = ({ user, tracks, onPlayTrack }) => {
  const [saved, setSaved] = useState<OfflineRecord[]>([]);
  const [busyId, setBusyId] = useState('');
  const [message, setMessage] = useState('');
  const refresh = async () => { try { setSaved(await listOfflineTracks()); } catch (e) { setMessage(e instanceof Error ? e.message : 'کتابخانه آفلاین در دسترس نیست.'); } };
  useEffect(() => { void refresh(); }, []);
  const savedIds = useMemo(() => new Set(saved.map(item => item.id)), [saved]);
  const save = async (track: Track) => {
    if (!user.isVip) { setMessage('ذخیره فایل اصلی برای پخش آفلاین مخصوص اعضای VIP است.'); return; }
    setBusyId(track.id); setMessage('');
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session?.access_token) throw new Error('نشست ورود منقضی شده است. دوباره وارد حساب شو.');
      await saveTrackOffline(track, data.session.access_token);
      await refresh(); setMessage('آهنگ با موفقیت روی همین دستگاه ذخیره شد.');
    } catch (e) { setMessage(e instanceof Error ? e.message : 'ذخیره آفلاین ناموفق بود.'); }
    finally { setBusyId(''); }
  };
  const remove = async (id: string) => { await removeOfflineTrack(id); await refresh(); };
  const bytes = saved.reduce((sum, item) => sum + item.blob.size, 0);
  return <section className="space-y-6" dir="rtl">
    <div className="rounded-3xl border border-[#d6b45c]/20 bg-gradient-to-br from-[#112a43] via-[#091522] to-black p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4"><div><div className="text-[10px] tracking-[.3em] font-black text-[#d6b45c]">LISTEN ANYWHERE</div><h2 className="text-2xl sm:text-3xl font-black text-white mt-2">کتابخانه آفلاین</h2><p className="text-sm text-slate-400 mt-2">آهنگ‌ها را روی همین دستگاه نگه دار و حتی بدون اینترنت پخش کن.</p></div><HardDriveDownload className="w-9 h-9 text-[#d6b45c]"/></div>
      <div className="flex flex-wrap gap-3 mt-6"><span className="rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-xs text-slate-300">{saved.length.toLocaleString('fa-IR')} آهنگ ذخیره‌شده</span><span className="rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-xs text-slate-300">{(bytes/1024/1024).toFixed(1)} MB استفاده‌شده</span><button onClick={()=>void refresh()} className="rounded-xl border border-white/10 px-4 py-3 text-xs text-slate-300 hover:text-white flex items-center gap-2"><RefreshCw className="w-3.5 h-3.5"/> بروزرسانی</button></div>
    </div>
    {message && <div className="rounded-xl border border-[#d6b45c]/20 bg-[#d6b45c]/5 p-3 text-sm text-amber-200">{message}</div>}
    <div><h3 className="font-black text-white mb-3">ذخیره آهنگ برای آفلاین</h3><div className="grid gap-2">{tracks.slice(0,30).map(track=><div key={track.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.025] p-3"><img src={track.coverUrl} alt="" className="w-12 h-12 rounded-xl object-cover"/><div className="min-w-0 flex-1"><div className="text-sm font-bold text-white truncate">{track.title}</div><div className="text-xs text-slate-500 truncate">{track.artist}</div></div><button disabled={!!busyId||savedIds.has(track.id)} onClick={()=>void save(track)} className="shrink-0 rounded-xl border border-[#d6b45c]/30 px-3 py-2 text-xs text-[#e8cc83] disabled:opacity-40 flex items-center gap-1.5">{busyId===track.id?'در حال ذخیره…':savedIds.has(track.id)?'ذخیره شده':<><Download className="w-3.5 h-3.5"/> ذخیره</>}</button></div>)}</div></div>
    <div><h3 className="font-black text-white mb-3">روی دستگاه من</h3>{saved.length ? <div className="grid gap-2">{saved.map(record=><div key={record.id} className="flex items-center gap-3 rounded-2xl border border-emerald-500/15 bg-emerald-500/[.035] p-3"><img src={record.coverUrl} alt="" className="w-12 h-12 rounded-xl object-cover"/><div className="min-w-0 flex-1"><div className="text-sm font-bold text-white truncate">{record.title}</div><div className="text-xs text-slate-500 truncate">{record.artist} · {(record.blob.size/1024/1024).toFixed(1)} MB</div></div><button onClick={()=>onPlayTrack(offlineRecordToTrack(record,tracks.find(t=>t.id===record.id)))} className="p-2 rounded-lg bg-[#d6b45c] text-black" title="پخش آفلاین"><Play className="w-4 h-4"/></button><button onClick={()=>void remove(record.id)} className="p-2 rounded-lg text-slate-500 hover:text-red-400" title="حذف از دستگاه"><Trash2 className="w-4 h-4"/></button></div>)}</div> : <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-slate-500"><WifiOff className="mx-auto mb-3 w-8 h-8"/><p className="text-sm">هنوز آهنگی برای پخش آفلاین ذخیره نکرده‌ای.</p></div>}</div>
  </section>;
};
