import React from 'react';
import { ChevronDown, ChevronUp, ListMusic, Trash2, X } from 'lucide-react';
import type { Track } from '../types';

interface QueuePanelProps {
  isOpen: boolean;
  currentTrack: Track | null;
  queue: Track[];
  onClose: () => void;
  onPlayTrack: (track: Track, index: number) => void;
  onRemove: (index: number) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onClear: () => void;
}

export const QueuePanel: React.FC<QueuePanelProps> = ({ isOpen, currentTrack, queue, onClose, onPlayTrack, onRemove, onMove, onClear }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[70] bg-black/55 backdrop-blur-sm flex justify-end" onClick={onClose}>
      <section role="dialog" aria-modal="true" aria-label="صف پخش" dir="rtl" className="w-full max-w-md h-full bg-[#07111e] border-r border-[#d6b45c]/20 shadow-2xl flex flex-col" onClick={(event) => event.stopPropagation()}>
        <header className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3"><div className="w-11 h-11 rounded-2xl bg-[#d6b45c]/10 text-[#e2c36e] flex items-center justify-center"><ListMusic /></div><div><h2 className="text-white font-black text-lg">صف پخش</h2><p className="text-neutral-400 text-xs">{queue.length} آهنگ در انتظار پخش</p></div></div>
          <button onClick={onClose} className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10" aria-label="بستن"><X /></button>
        </header>
        <div className="p-5 border-b border-white/10">
          <div className="text-xs text-neutral-500 font-bold mb-3">در حال پخش</div>
          {currentTrack ? <div className="flex items-center gap-3"><img src={currentTrack.coverUrl} alt="" className="w-12 h-12 rounded-xl object-cover bg-white/5" /><div className="min-w-0 flex-1"><div className="text-white text-sm font-bold truncate">{currentTrack.title}</div><div className="text-neutral-400 text-xs truncate">{currentTrack.artist}</div></div><span className="text-[#d6b45c] text-[10px] font-bold">NOW PLAYING</span></div> : <p className="text-neutral-500 text-sm">هنوز آهنگی انتخاب نشده است.</p>}
        </div>
        <div className="px-5 py-4 flex items-center justify-between"><div className="text-xs text-neutral-400 font-bold">آهنگ‌های بعدی</div><button onClick={onClear} disabled={!queue.length} className="text-xs text-neutral-500 hover:text-red-300 disabled:opacity-30 flex items-center gap-1"><Trash2 size={13}/> پاک‌کردن صف</button></div>
        <div className="flex-1 overflow-y-auto px-3 pb-5">
          {queue.length ? queue.map((track, index) => <div key={track.id + ':' + index} className="group flex items-center gap-2 p-2 rounded-xl hover:bg-white/5"><span className="w-5 text-center text-[11px] text-neutral-600">{index + 1}</span><img src={track.coverUrl} alt="" className="w-10 h-10 rounded-lg object-cover bg-white/5" /><button onClick={() => onPlayTrack(track, index)} className="min-w-0 flex-1 text-right"><span className="block text-white text-xs font-bold truncate">{track.title}</span><span className="block text-neutral-500 text-[11px] truncate">{track.artist}</span></button><div className="flex items-center opacity-60 group-hover:opacity-100"><button onClick={() => onMove(index, -1)} disabled={index === 0} className="p-1 text-neutral-400 hover:text-white disabled:opacity-20" aria-label="انتقال به بالا"><ChevronUp size={15}/></button><button onClick={() => onMove(index, 1)} disabled={index === queue.length - 1} className="p-1 text-neutral-400 hover:text-white disabled:opacity-20" aria-label="انتقال به پایین"><ChevronDown size={15}/></button><button onClick={() => onRemove(index)} className="p-1 text-neutral-500 hover:text-red-300" aria-label="حذف از صف"><X size={15}/></button></div></div>) : <div className="h-48 flex flex-col items-center justify-center text-center text-neutral-500"><ListMusic size={34} className="mb-3 opacity-40"/><p className="text-sm font-bold">صف پخش خالی است</p><p className="text-xs mt-1">با دکمه + کنار پلیر، آهنگ اضافه کن.</p></div>}
        </div>
        <footer className="p-4 border-t border-white/10 text-[10px] text-neutral-500 text-center">صف پخش فعلاً در همین دستگاه نگهداری می‌شود.</footer>
      </section>
    </div>
  );
};
