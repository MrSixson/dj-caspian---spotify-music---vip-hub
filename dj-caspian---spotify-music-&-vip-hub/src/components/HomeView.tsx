import React from 'react';
import { 
  Play, Pause, Heart, Download, Crown, Sparkles, 
  CheckCircle2, Clock, Music, Disc3, ShieldCheck, Flame, ArrowLeft
} from 'lucide-react';
import { Track, Playlist } from '../types';
import { DJ_CASPIAN_INFO } from '../data/initialData';

interface HomeViewProps {
  tracks: Track[];
  playlists: Playlist[];
  currentTrackId: string | null;
  isPlaying: boolean;
  likedTrackIds: string[];
  isUserVip: boolean;
  onPlayTrack: (track: Track) => void;
  onToggleLike: (trackId: string) => void;
  onDownloadTrack: (track: Track) => void;
  onNavigateToSupport: () => void;
  onNavigateToAbout: () => void;
  onSelectPlaylist: (playlist: Playlist) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  tracks,
  playlists,
  currentTrackId,
  isPlaying,
  likedTrackIds,
  isUserVip,
  onPlayTrack,
  onToggleLike,
  onDownloadTrack,
  onNavigateToSupport,
  onNavigateToAbout,
  onSelectPlaylist,
}) => {
  const featuredTrack = tracks[0] || null;

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-8 p-4 sm:p-8 animate-in fade-in duration-300" dir="rtl">
      
      {/* 1. ARTIST HERO BANNER (Spotify Verified Artist Style) */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#183a27] via-[#122419] to-[#121212] border border-[#234b35]/40 shadow-2xl">
        {/* Background glow and subtle stage imagery */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay filter blur-[1px]"
          style={{ backgroundImage: `url(${DJ_CASPIAN_INFO.bannerUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-black/30" />

        <div className="relative z-10 p-6 sm:p-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6 min-h-[300px]">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-right">
            {/* DJ Caspian Big Avatar */}
            <div className="relative group shrink-0">
              <img
                src={DJ_CASPIAN_INFO.avatarUrl}
                alt="DJ Caspian"
                className="w-32 h-32 sm:w-44 sm:h-44 rounded-full object-cover border-4 border-[#1db954] shadow-2xl"
              />
              <div className="absolute bottom-1 right-2 bg-[#1db954] text-black p-1.5 rounded-full shadow-lg">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1db954]" />
                <span>آرتیست رسمی و تایید شده اسپاتیفای</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight drop-shadow-lg">
                {DJ_CASPIAN_INFO.name}
              </h1>

              <p className="text-sm text-neutral-300 max-w-lg leading-relaxed line-clamp-2">
                {DJ_CASPIAN_INFO.tagline}
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-4 text-xs font-semibold text-neutral-300 pt-1">
                <span>{DJ_CASPIAN_INFO.monthlyListeners}</span>
                <span>•</span>
                <span>{DJ_CASPIAN_INFO.followers}</span>
              </div>
            </div>
          </div>

          {/* Hero Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-center sm:justify-start">
            {featuredTrack && (
              <button
                onClick={() => onPlayTrack(featuredTrack)}
                className="py-3 px-6 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black font-black text-sm flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-[#1db954]/30 cursor-pointer"
              >
                {currentTrackId === featuredTrack.id && isPlaying ? (
                  <>
                    <Pause className="w-5 h-5 fill-black" />
                    <span>توقف پخش</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-black" />
                    <span>پخش آخرین اثر</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={onNavigateToSupport}
              className="py-3 px-6 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold text-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-amber-500/20 cursor-pointer"
            >
              <Crown className="w-4 h-4 fill-black" />
              <span>حمایت مالی و دریافت VIP</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. SPOTIFY QUICK 6 CARDS (Fast Access) - Only if tracks exist */}
      {tracks.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>دسترسی سریع</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tracks.slice(0, 6).map((track) => {
              const isCurrent = currentTrackId === track.id && isPlaying;
              return (
                <div
                  key={track.id}
                  onClick={() => onPlayTrack(track)}
                  className="group relative flex items-center bg-[#181818] hover:bg-[#282828] rounded-xl overflow-hidden cursor-pointer transition-all border border-neutral-800/60 hover:border-neutral-700"
                >
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover shrink-0"
                  />
                  <div className="p-3 min-w-0 flex-1">
                    <div className={`font-bold text-xs sm:text-sm truncate ${isCurrent ? 'text-[#1db954]' : 'text-white'}`}>
                      {track.title}
                    </div>
                    <div className="text-[11px] text-neutral-400 truncate mt-0.5">
                      {track.artist}
                    </div>
                  </div>

                  {/* Floating Play Button */}
                  <div className="ml-3 sm:ml-4 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-xl group-hover:translate-x-0">
                    <div className="w-10 h-10 rounded-full bg-[#1db954] text-black flex items-center justify-center hover:scale-105 transition-transform">
                      {isCurrent ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black mr-0.5" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. POPULAR TRACKS TABLE (Spotify Track Listing) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Disc3 className="w-6 h-6 text-[#1db954]" />
              <span>محبوب‌ترین ریمیکس‌ها و آهنگ‌های DJ Caspian</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              استریم باکیفیت و رایگان • دانلود استودیویی ۳۲۰ ویژه اعضای VIP
            </p>
          </div>
          <span className="text-xs text-neutral-400 font-mono hidden sm:inline">
            {tracks.length} قطعه اختصاصی
          </span>
        </div>

        {/* Tracks Table Header or Empty State */}
        {tracks.length === 0 ? (
          <div className="bg-[#181818]/90 border border-neutral-800/80 rounded-3xl p-10 sm:p-14 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-[#1db954]">
              <Music className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-white">هنوز قطعه‌ای در آرشیو منتشر نشده است</h3>
              <p className="text-sm text-neutral-400 max-w-lg mx-auto leading-relaxed">
                دی‌جی کاسپین به زودی جدیدترین آهنگ‌ها، ریمیکس‌ها و سِت‌های اختصاصی خود را در این پلتفرم منتشر خواهد کرد. شما می‌توانید با خرید اشتراک VIP، از آرتیست حمایت نمایید.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-[#181818]/90 border border-neutral-800/80 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-12 gap-3 px-4 py-2.5 text-xs text-neutral-400 border-b border-neutral-800 font-semibold select-none">
              <span className="col-span-1 text-center">#</span>
              <span className="col-span-6 sm:col-span-5">عنوان قطعه</span>
              <span className="hidden sm:block sm:col-span-2 text-center">سبک / BPM</span>
              <span className="hidden md:block md:col-span-2 text-center">تعداد استریم</span>
              <span className="col-span-5 sm:col-span-2 text-left">دانلود / زمان</span>
            </div>

            <div className="divide-y divide-neutral-800/60">
            {tracks.map((track, idx) => {
              const isCurrent = currentTrackId === track.id && isPlaying;
              const isLiked = likedTrackIds.includes(track.id);

              return (
                <div
                  key={track.id}
                  className={`grid grid-cols-12 gap-3 items-center px-4 py-3 group hover:bg-[#222222] transition-colors cursor-pointer ${
                    isCurrent ? 'bg-[#1c2c20]' : ''
                  }`}
                  onClick={() => onPlayTrack(track)}
                >
                  {/* Number / Play Button */}
                  <div className="col-span-1 flex items-center justify-center text-xs">
                    <span className="group-hover:hidden text-neutral-400 font-mono">
                      {isCurrent ? (
                        <div className="flex items-end gap-0.5 h-3">
                          <span className="w-0.5 bg-[#1db954] animate-eq-1" />
                          <span className="w-0.5 bg-[#1db954] animate-eq-2" />
                          <span className="w-0.5 bg-[#1db954] animate-eq-3" />
                        </div>
                      ) : (
                        idx + 1
                      )}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayTrack(track);
                      }}
                      className="hidden group-hover:block text-white hover:text-[#1db954] cursor-pointer"
                    >
                      {isCurrent ? <Pause className="w-4 h-4 text-[#1db954]" /> : <Play className="w-4 h-4 fill-white" />}
                    </button>
                  </div>

                  {/* Title & Cover & Artist */}
                  <div className="col-span-6 sm:col-span-5 flex items-center gap-3 min-w-0">
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-10 h-10 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className={`font-bold text-xs sm:text-sm truncate ${isCurrent ? 'text-[#1db954]' : 'text-white'}`}>
                        {track.title}
                      </div>
                      <div className="text-[11px] text-neutral-400 truncate flex items-center gap-1.5">
                        <span>{track.artist}</span>
                        {track.isVipOnlyDownload && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-500/30">
                            VIP
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Genre / BPM */}
                  <div className="hidden sm:block sm:col-span-2 text-center text-xs text-neutral-400">
                    <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-[11px]">
                      {track.genre}
                    </span>
                    <span className="text-[10px] text-neutral-500 block font-mono mt-0.5">
                      {track.bpm} BPM
                    </span>
                  </div>

                  {/* Plays */}
                  <div className="hidden md:block md:col-span-2 text-center text-xs font-mono text-neutral-400">
                    {track.plays?.toLocaleString() || 0}
                  </div>

                  {/* Actions & Duration */}
                  <div className="col-span-5 sm:col-span-2 flex items-center justify-end gap-2 text-xs">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleLike(track.id);
                      }}
                      className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                        isLiked ? 'text-[#1db954]' : 'text-neutral-500 hover:text-white'
                      }`}
                      title="علاقه‌مندی"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-[#1db954]' : ''}`} />
                    </button>

                    {/* Download Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownloadTrack(track);
                      }}
                      className={`py-1 px-2.5 rounded-full font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
                        isUserVip
                          ? 'bg-[#1db954] hover:bg-[#1ed760] text-black shadow-sm'
                          : 'bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/40'
                      }`}
                      title={isUserVip ? 'دانلود فایل اصلی ۳۲۰' : 'دانلود قطعه (نیاز به اشتراک VIP)'}
                    >
                      {isUserVip ? (
                        <>
                          <Download className="w-3 h-3" />
                          <span className="hidden sm:inline">دانلود</span>
                        </>
                      ) : (
                        <>
                          <Crown className="w-3 h-3 fill-amber-400" />
                          <span>VIP</span>
                        </>
                      )}
                    </button>

                    <span className="font-mono text-neutral-400 text-xs w-8 text-left" dir="ltr">
                      {formatDuration(track.duration)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        )}
      </div>

      {/* 4. EXCLUSIVE PLAYLISTS SECTION */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">پلی‌لیست‌های اختصاصی DJ Caspian</h2>
        {playlists.length === 0 ? (
          <div className="bg-[#181818]/60 border border-neutral-800/80 rounded-2xl p-8 text-center text-neutral-400 space-y-2">
            <Disc3 className="w-10 h-10 text-neutral-600 mx-auto" />
            <p className="text-xs text-neutral-400">هنوز پلی‌لیستی منتشر نشده است.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {playlists.map((pl) => (
              <div
                key={pl.id}
                onClick={() => onSelectPlaylist(pl)}
                className="group p-4 bg-[#181818] hover:bg-[#222222] border border-neutral-800 rounded-2xl cursor-pointer transition-all space-y-3"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden shadow-lg">
                  <img
                    src={pl.coverUrl}
                    alt={pl.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-[#1db954] text-black flex items-center justify-center shadow-xl hover:scale-105">
                      <Play className="w-5 h-5 fill-black ml-0.5" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-white text-sm group-hover:text-[#1db954] transition-colors">
                    {pl.title}
                  </h3>
                  <p className="text-xs text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                    {pl.description}
                  </p>
                  <div className="text-[11px] text-neutral-500 mt-2 font-mono">
                    {pl.trackIds.length} قطعه
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. ABOUT ARTIST & FOLLOW US FOOTER CARD */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#181818] to-[#121212] border border-neutral-800 flex flex-col md:flex-row items-center gap-6 shadow-2xl">
        <img
          src={DJ_CASPIAN_INFO.avatarUrl}
          alt={DJ_CASPIAN_INFO.name}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-neutral-700 shrink-0"
        />
        <div className="space-y-3 text-center md:text-right flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <h3 className="text-xl font-bold text-white">🌊 Caspian Community | درباره {DJ_CASPIAN_INFO.persianName}</h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
              MTA & Music Community
            </span>
          </div>

          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-3xl">
            {DJ_CASPIAN_INFO.bio}
          </p>

          {/* Quick Community & Social Badges */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 font-bold" dir="ltr">
              💎 IP TS: {DJ_CASPIAN_INFO.socials.teamspeak.serverAddress}
            </span>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold" dir="ltr">
              💎 IP SV: Soon ...
            </span>
            <a
              href={DJ_CASPIAN_INFO.socials.discord.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25 border border-indigo-500/30 transition-colors"
            >
              🔹️ Discord
            </a>
            <a
              href={DJ_CASPIAN_INFO.socials.instagram.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-pink-500/15 text-pink-400 hover:bg-pink-500/25 border border-pink-500/30 transition-colors"
            >
              🔹️ Instagram: @caspianrp_mta
            </a>
            <a
              href={DJ_CASPIAN_INFO.socials.telegram.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-sky-500/15 text-sky-400 hover:bg-sky-500/25 border border-sky-500/30 transition-colors"
            >
              🔹️ Telegram: t.me/CaspianRolePlayMTA
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 w-full md:w-auto">
          <button
            onClick={onNavigateToAbout}
            className="py-3 px-6 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-lg shadow-[#1db954]/20 text-center"
          >
            مشاهده بیوگرافی و شبکه‌ها
          </button>
          <button
            onClick={onNavigateToSupport}
            className="py-3 px-6 rounded-full bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-bold text-xs sm:text-sm transition-all cursor-pointer border border-amber-500/30 text-center"
          >
            حمایت مالی و خرید VIP
          </button>
        </div>
      </div>
    </div>
  );
};
