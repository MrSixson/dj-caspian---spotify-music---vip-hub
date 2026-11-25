import React from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, 
  Volume2, VolumeX, Heart, Download, Maximize2, Crown, Sparkles, Disc, ListMusic, X, Captions, Moon
} from 'lucide-react';
import { Track } from '../types';
import { LyricsModal } from './LyricsModal';

interface PlayerBarProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  isRepeat: boolean;
  queue: Track[];
  onRemoveQueueTrack: (trackId: string) => void;
  onPlayQueuedTrack: (track: Track) => void;
  isLiked: boolean;
  isUserVip: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (seconds: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onToggleLike: (trackId: string) => void;
  onDownloadTrack: (track: Track) => void;
  onOpenVisualizer: () => void;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isShuffle,
  isRepeat,
  queue,
  onRemoveQueueTrack,
  onPlayQueuedTrack,
  isLiked,
  isUserVip,
  onTogglePlay,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleShuffle,
  onToggleRepeat,
  onToggleLike,
  onDownloadTrack,
  onOpenVisualizer,
}) => {
  const [isQueueOpen, setIsQueueOpen] = React.useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = React.useState(false);
  const [isSleepMenuOpen, setIsSleepMenuOpen] = React.useState(false);
  const [sleepSeconds, setSleepSeconds] = React.useState<number | null>(null);
  const sleepToggleRef = React.useRef(onTogglePlay);
  sleepToggleRef.current = onTogglePlay;

  React.useEffect(() => {
    if (sleepSeconds === null) return;
    if (sleepSeconds <= 0) { setSleepSeconds(null); if (isPlaying) sleepToggleRef.current(); return; }
    const timer = window.setInterval(() => setSleepSeconds(value => value === null ? null : Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [sleepSeconds, isPlaying]);

  if (!currentTrack) {
    return (
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-[#181818] border-t border-neutral-800/80 px-4 py-3 text-center text-xs text-neutral-400 select-none">
        یک آهنگ برای پخش انتخاب کنید
      </footer>
    );
  }

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-[#121212]/95 backdrop-blur-lg border-t border-neutral-800 px-3 sm:px-6 py-2.5 sm:py-3 select-none" dir="rtl">
      {isLyricsOpen && currentTrack && <LyricsModal track={currentTrack} currentTime={currentTime} onClose={() => setIsLyricsOpen(false)} />}
      {isSleepMenuOpen && <div className="absolute bottom-full right-3 mb-3 w-56 rounded-2xl border border-[#d6b45c]/25 bg-[#07111e] p-3 shadow-2xl"><b className="block text-xs text-white mb-2">توقف خودکار پخش</b><div className="grid grid-cols-2 gap-2">{[15,30,45,60].map(minutes=><button key={minutes} onClick={()=>{setSleepSeconds(minutes*60);setIsSleepMenuOpen(false);}} className="rounded-lg bg-white/5 px-2 py-2 text-xs text-slate-200 hover:bg-[#d6b45c]/15">{minutes} دقیقه</button>)}</div>{sleepSeconds!==null&&<button onClick={()=>{setSleepSeconds(null);setIsSleepMenuOpen(false);}} className="mt-2 w-full rounded-lg bg-red-500/10 py-2 text-xs text-red-300">لغو تایمر</button>}</div>}
      {isQueueOpen && (
        <div className="absolute bottom-full left-3 sm:left-6 mb-3 w-[min(22rem,calc(100vw-1.5rem))] max-h-80 overflow-hidden rounded-2xl border border-[#d6b45c]/25 bg-[#07111e]/[.98] shadow-2xl shadow-black/60 backdrop-blur-2xl" dir="rtl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div>
              <div className="text-sm font-black text-white">صف پخش</div>
              <div className="text-[10px] text-neutral-500 mt-0.5">{queue.length} آهنگ در انتظار</div>
            </div>
            <button type="button" onClick={() => setIsQueueOpen(false)} className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10" aria-label="بستن صف پخش">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto p-2">
            {queue.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-500">صف پخش خالی است. از فهرست آهنگ‌ها قطعه اضافه کن.</div>
            ) : queue.map((track, index) => (
              <div key={track.id} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-white/[.05]">
                <span className="w-5 text-center text-[10px] text-neutral-600">{index + 1}</span>
                <button type="button" onClick={() => { onPlayQueuedTrack(track); setIsQueueOpen(false); }} className="flex items-center gap-3 min-w-0 flex-1 text-right">
                  <img src={track.coverUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-xs font-bold text-white truncate">{track.title}</span>
                    <span className="block text-[10px] text-neutral-500 truncate">{track.artist}</span>
                  </span>
                </button>
                <button type="button" onClick={() => onRemoveQueueTrack(track.id)} className="p-1.5 text-neutral-500 hover:text-red-400" aria-label={`حذف ${track.title} از صف`}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* RIGHT (Track Info & Artwork in RTL) */}
        <div className="flex items-center gap-3 min-w-0 w-1/4 sm:w-1/3">
          <div 
            onClick={onOpenVisualizer}
            className="relative group w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 cursor-pointer shadow-md"
            title="نمایش ویژوالایزر و جزئیات"
          >
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
                isPlaying ? 'scale-105' : ''
              }`}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
              <Maximize2 className="w-4 h-4" />
            </div>

            {/* Equalizer animation overlay when playing */}
            {isPlaying && (
              <div className="absolute bottom-1 right-1 flex items-end gap-0.5 bg-black/60 px-1 py-0.5 rounded">
                <span className="w-0.5 bg-[#d6b45c] animate-eq-1" />
                <span className="w-0.5 bg-[#d6b45c] animate-eq-2" />
                <span className="w-0.5 bg-[#d6b45c] animate-eq-3" />
              </div>
            )}
          </div>

          <div className="min-w-0 truncate">
            <div 
              onClick={onOpenVisualizer}
              className="text-white text-xs sm:text-sm font-bold truncate hover:underline cursor-pointer"
            >
              {currentTrack.title}
            </div>
            <div className="text-[11px] text-neutral-400 truncate flex items-center gap-1.5">
              <span>{currentTrack.artist}</span>
              <span className="text-neutral-600">•</span>
              <span className="text-neutral-500">{currentTrack.bpm} BPM</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onToggleLike(currentTrack.id)}
            className={`p-1.5 rounded-full transition-colors cursor-pointer shrink-0 ${
              isLiked ? 'text-[#d6b45c]' : 'text-neutral-400 hover:text-white'
            }`}
            title={isLiked ? 'حذف از آهنگ‌های لایک شده' : 'افزودن به آهنگ‌های لایک شده'}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#d6b45c]' : ''}`} />
          </button>
        </div>

        {/* CENTER (Player Controls & Seek Bar) */}
        <div className="flex flex-col items-center gap-1.5 w-1/2 sm:w-5/12 max-w-xl">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={onToggleShuffle}
              className={`p-1.5 rounded-full text-xs transition-colors cursor-pointer hidden sm:block ${
                isShuffle ? 'text-[#d6b45c]' : 'text-neutral-400 hover:text-white'
              }`}
              title="پخش تصادفی (Shuffle)"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={onNext}
              className="text-neutral-300 hover:text-white p-1 transition-colors cursor-pointer"
              title="آهنگ بعدی"
            >
              <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={onTogglePlay}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#d6b45c] hover:bg-[#f0d88a] text-black flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg shadow-[#d6b45c]/30"
              title={isPlaying ? 'توقف' : 'پخش'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-black" />
              ) : (
                <Play className="w-5 h-5 fill-black ml-0.5" />
              )}
            </button>

            <button
              onClick={onPrevious}
              className="text-neutral-300 hover:text-white p-1 transition-colors cursor-pointer"
              title="آهنگ قبلی"
            >
              <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={onToggleRepeat}
              className={`p-1.5 rounded-full text-xs transition-colors cursor-pointer hidden sm:block ${
                isRepeat ? 'text-[#d6b45c]' : 'text-neutral-400 hover:text-white'
              }`}
              title="تکرار (Repeat)"
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Time & Progress Slider */}
          <div className="w-full flex items-center gap-2 text-[11px] font-mono text-neutral-400" dir="ltr">
            <span className="w-8 text-right">{formatTime(currentTime)}</span>
            <div className="relative flex-1 flex items-center group h-3">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime || 0}
                onChange={(e) => onSeek(Number(e.target.value))}
                className="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer focus:outline-none"
              />
            </div>
            <span className="w-8 text-left">{formatTime(duration)}</span>
          </div>
        </div>

        {/* LEFT (Download VIP, Visualizer, Volume in RTL) */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 w-1/4 sm:w-1/3">
          <button type="button" onClick={() => setIsSleepMenuOpen(value=>!value)} className={"p-1.5 rounded-lg hover:text-[#f0d88a] " + (sleepSeconds!==null ? "text-[#d6b45c]" : "text-neutral-400")} title="تایمر خواب"><Moon className="w-4 h-4"/>{sleepSeconds!==null&&<span className="text-[9px] mr-1">{Math.floor(sleepSeconds/60)}:{String(sleepSeconds%60).padStart(2,"0")}</span>}</button>
          <button type="button" onClick={() => setIsLyricsOpen(true)} disabled={!currentTrack.lyrics?.trim()} className="p-1.5 rounded-lg text-neutral-400 hover:text-[#f0d88a] disabled:opacity-30 disabled:cursor-not-allowed" title="کارائوکه و متن هماهنگ" aria-label="کارائوکه و متن هماهنگ"><Captions className="w-4 h-4" /></button>
          <button
            type="button"
            onClick={() => setIsQueueOpen((open) => !open)}
            className={`relative p-1.5 rounded-lg transition-colors cursor-pointer ${isQueueOpen ? 'text-[#d6b45c] bg-[#d6b45c]/10' : 'text-neutral-400 hover:text-white'}`}
            title="نمایش صف پخش"
            aria-label="نمایش صف پخش"
            aria-expanded={isQueueOpen}
          >
            <ListMusic className="w-4 h-4" />
            {queue.length > 0 && <span className="absolute -top-1 -left-1 min-w-4 h-4 px-1 rounded-full bg-[#d6b45c] text-black text-[9px] font-black flex items-center justify-center">{queue.length}</span>}
          </button>
          {/* THE DOWNLOAD BUTTON (KEY USER REQUIREMENT) */}
          <button
            type="button"
            onClick={() => onDownloadTrack(currentTrack)}
            className={`flex items-center gap-1.5 py-1.5 px-2.5 sm:px-3.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-sm ${
              isUserVip
                ? 'bg-[#d6b45c] hover:bg-[#f0d88a] text-black shadow-[#d6b45c]/20 hover:scale-105'
                : 'bg-gradient-to-r from-amber-500/20 to-amber-600/30 hover:from-amber-500/40 hover:to-amber-600/50 border border-amber-500/50 text-amber-300'
            }`}
            title={isUserVip ? 'دانلود فایل استودیویی با کیفیت ۳۲۰' : 'دانلود قطعه (ویژه اعضای VIP)'}
          >
            {isUserVip ? (
              <>
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">دانلود ۳۲۰</span>
              </>
            ) : (
              <>
                <Crown className="w-3.5 h-3.5 fill-amber-400" />
                <span className="hidden sm:inline">دانلود (VIP)</span>
                <span className="sm:hidden">VIP</span>
              </>
            )}
          </button>

          {/* Visualizer Trigger */}
          <button
            onClick={onOpenVisualizer}
            className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer hidden md:block"
            title="نمای بزرگ و اکولایزر زنده"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Volume Control */}
          <div className="hidden lg:flex items-center gap-1.5">
            <button
              onClick={onToggleMute}
              className="p-1 text-neutral-400 hover:text-white cursor-pointer"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="w-16 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer focus:outline-none"
              dir="ltr"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};
