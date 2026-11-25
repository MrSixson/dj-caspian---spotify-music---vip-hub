import React, { useEffect, useMemo, useRef } from 'react';
import { X, Music2, Maximize2 } from 'lucide-react';
import type { Track } from '../types';

type LyricLine = { time: number; text: string };
function parseLyrics(value: string): LyricLine[] {
  const rows: LyricLine[] = [];
  for (const raw of value.split(/\r?\n/)) {
    const match = raw.match(/^\s*\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]\s*(.*)$/);
    if (!match) continue;
    const fraction = match[3] ? Number('0.' + match[3]) : 0;
    rows.push({ time: Number(match[1]) * 60 + Number(match[2]) + fraction, text: match[4].trim() });
  }
  return rows.sort((a, b) => a.time - b.time);
}

export const LyricsModal: React.FC<{ track: Track; currentTime: number; onClose: () => void }> = ({ track, currentTime, onClose }) => {
  const lines = useMemo(() => parseLyrics(track.lyrics || ''), [track.lyrics]);
  const activeIndex = lines.reduce((found, line, index) => line.time <= currentTime ? index : found, -1);
  const activeRef = useRef<HTMLDivElement>(null);
  useEffect(() => { activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, [activeIndex]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[90] bg-[#02050b]/95 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6" dir="rtl" role="dialog" aria-modal="true" aria-label="متن آهنگ">
      <section className="relative w-full max-w-5xl h-[min(90vh,850px)] overflow-hidden rounded-[2rem] border border-[#d6b45c]/25 bg-gradient-to-br from-[#10243a] via-[#07111e] to-black shadow-[0_30px_120px_rgba(0,0,0,.7)] flex flex-col">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{backgroundImage:'radial-gradient(circle at 15% 10%,#d6b45c 0,transparent 28%),radial-gradient(circle at 90% 80%,#24558a 0,transparent 35%)'}} />
        <header className="relative z-10 flex items-center justify-between gap-4 p-5 sm:p-7 border-b border-white/10">
          <div className="flex items-center gap-4 min-w-0">
            <img src={track.coverUrl} alt="" className="w-14 h-14 rounded-2xl object-cover shadow-xl" />
            <div className="min-w-0"><div className="text-[10px] tracking-[.3em] text-[#d6b45c] font-black">CASPIAN LYRICS EXPERIENCE</div><h2 className="text-xl sm:text-2xl font-black text-white truncate mt-1">{track.title}</h2><p className="text-sm text-slate-400 truncate">{track.artist}</p></div>
          </div>
          <button onClick={onClose} className="shrink-0 rounded-full border border-white/10 bg-white/5 p-3 text-slate-300 hover:text-white hover:bg-white/10" aria-label="بستن"><X /></button>
        </header>
        <div className="relative z-10 flex-1 overflow-y-auto px-5 sm:px-12 py-8 sm:py-12 text-center">
          {lines.length ? (
            <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
              {lines.map((line, index) => <div key={index} ref={index === activeIndex ? activeRef : undefined} className={`transition-all duration-500 text-xl sm:text-3xl font-black leading-relaxed ${index === activeIndex ? 'text-[#f5d989] scale-105 drop-shadow-[0_0_25px_rgba(214,180,92,.25)]' : index < activeIndex ? 'text-slate-500/65' : 'text-slate-300/75'}`}>{line.text || '♪'}</div>)}
            </div>
          ) : track.lyrics?.trim() ? (
            <div className="max-w-3xl mx-auto whitespace-pre-wrap text-lg sm:text-2xl leading-[2.3] font-semibold text-slate-100">{track.lyrics}</div>
          ) : (
            <div className="h-full min-h-64 flex flex-col items-center justify-center text-slate-400"><Music2 className="w-12 h-12 text-[#d6b45c] mb-4" /><h3 className="text-xl font-bold text-white">متن این آهنگ هنوز ثبت نشده</h3><p className="text-sm mt-2">به‌زودی متن رسمی این قطعه اضافه می‌شود.</p></div>
          )}
        </div>
        <div className="relative z-10 px-5 sm:px-8 py-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-500"><span>{lines.length ? 'همگام‌سازی بر اساس تایم‌کد متن' : 'نمایش متن کامل'}</span><span className="font-mono" dir="ltr">{Math.floor(currentTime/60)}:{String(Math.floor(currentTime%60)).padStart(2,'0')}</span></div>
      </section>
    </div>
  );
};
