import React, { useEffect, useRef } from 'react';
import { 
  X, Play, Pause, SkipBack, SkipForward, Volume2, 
  Download, Crown, Heart, Disc3, Sparkles 
} from 'lucide-react';
import { Track } from '../types';
import { audioEngine } from '../utils/audioEngine';

interface VisualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track | null;
  isPlaying: boolean;
  isLiked: boolean;
  isUserVip: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onToggleLike: (trackId: string) => void;
  onDownloadTrack: (track: Track) => void;
  onGoToSupport: () => void;
}

export const VisualizerModal: React.FC<VisualizerModalProps> = ({
  isOpen,
  onClose,
  track,
  isPlaying,
  isLiked,
  isUserVip,
  onTogglePlay,
  onNext,
  onPrevious,
  onToggleLike,
  onDownloadTrack,
  onGoToSupport,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = audioEngine.getAnalyser();

    const draw = () => {
      animId = requestAnimationFrame(draw);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (analyser && isPlaying) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        const barWidth = (width / bufferLength) * 2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * height * 0.85;

          // Gradient color: Spotify emerald to vibrant cyan
          const grad = ctx.createLinearGradient(0, height, 0, height - barHeight);
          grad.addColorStop(0, '#1db954');
          grad.addColorStop(0.5, '#1ed760');
          grad.addColorStop(1, '#38ef7d');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, height - barHeight, Math.max(3, barWidth - 3), barHeight, 4);
          ctx.fill();

          x += barWidth;
        }
      } else {
        // Subtle resting wave
        const count = 32;
        const barWidth = width / count;
        for (let i = 0; i < count; i++) {
          const barHeight = 8 + Math.sin(Date.now() / 400 + i * 0.3) * 6;
          ctx.fillStyle = '#264e36';
          ctx.beginPath();
          ctx.roundRect(i * barWidth, height - barHeight, barWidth - 4, barHeight, 2);
          ctx.fill();
        }
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isOpen, isPlaying]);

  if (!isOpen || !track) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300 select-none" dir="rtl">
      <div className="relative w-full max-w-4xl max-h-[95vh] bg-gradient-to-b from-[#182a1e] via-[#101010] to-[#0a0a0a] border border-[#234b35]/60 rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col justify-between overflow-hidden">
        
        {/* Top Bar inside Visualizer */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#1db954] animate-ping" />
            <span className="text-xs font-bold text-[#1db954] tracking-wider uppercase">
              DJ Caspian Live Arena Studio
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center Artwork & Info */}
        <div className="my-auto py-6 flex flex-col md:flex-row items-center justify-center gap-8 z-10">
          <div className="relative group shrink-0">
            <div className={`w-52 h-52 sm:w-72 sm:h-72 rounded-3xl overflow-hidden shadow-2xl border-2 border-neutral-700/60 transition-transform duration-700 ${
              isPlaying ? 'scale-105 shadow-[#1db954]/20' : ''
            }`}>
              <img
                src={track.coverUrl}
                alt={track.title}
                className="w-full h-full object-cover"
              />
            </div>
            {track.isVipOnlyDownload && (
              <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-amber-500/50 text-amber-300 text-xs font-bold flex items-center gap-1 shadow-lg">
                <Crown className="w-3.5 h-3.5 fill-amber-400" />
                <span>VIP Master</span>
              </div>
            )}
          </div>

          <div className="text-center md:text-right space-y-3 max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900/90 text-neutral-300 text-xs border border-neutral-800 font-mono">
              <span>{track.genre}</span>
              <span>•</span>
              <span className="text-[#1db954] font-bold">{track.bpm} BPM</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {track.title}
            </h2>

            <div className="text-lg font-bold text-neutral-300">
              {track.artist}
            </div>

            {track.description && (
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed pt-1">
                {track.description}
              </p>
            )}

            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button
                onClick={() => onToggleLike(track.id)}
                className={`py-2 px-4 rounded-full text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer border ${
                  isLiked
                    ? 'bg-[#1db954]/20 border-[#1db954] text-[#1db954]'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#1db954]' : ''}`} />
                <span>{isLiked ? 'پسندیده شد' : 'علاقه‌مندی'}</span>
              </button>

              <button
                onClick={() => onDownloadTrack(track)}
                className={`py-2 px-5 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                  isUserVip
                    ? 'bg-[#1db954] hover:bg-[#1ed760] text-black shadow-[#1db954]/20'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-amber-500/20'
                }`}
              >
                {isUserVip ? (
                  <>
                    <Download className="w-4 h-4" />
                    <span>دانلود فایل اصلی ۳۲۰kbps</span>
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4 fill-black" />
                    <span>دانلود ویژه اعضای VIP</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Frequency Visualizer Canvas */}
        <div className="w-full h-24 my-2 relative">
          <canvas
            ref={canvasRef}
            width={640}
            height={96}
            className="w-full h-full rounded-2xl"
          />
        </div>

        {/* Bottom Playback Controls */}
        <div className="flex items-center justify-center gap-6 pt-2 border-t border-neutral-800/80 z-10">
          <button
            onClick={onNext}
            className="p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <SkipForward className="w-6 h-6" />
          </button>

          <button
            onClick={onTogglePlay}
            className="w-14 h-14 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-xl shadow-[#1db954]/30 cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-black" />
            ) : (
              <Play className="w-7 h-7 fill-black ml-0.5" />
            )}
          </button>

          <button
            onClick={onPrevious}
            className="p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <SkipBack className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
