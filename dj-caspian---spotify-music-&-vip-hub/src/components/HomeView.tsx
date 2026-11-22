import React, { useMemo } from 'react';
import {
  Play, Pause, Heart, Download, Crown,
  Music2, ArrowLeft, Headphones, Disc3, Radio, Waves
} from 'lucide-react';
import { Track, Playlist } from '../types';
import { DJ_CASPIAN_INFO } from '../data/initialData';

interface HomeViewProps {
  tracks: Track[];
  playlists: Playlist[];
  recentlyPlayedIds: string[];
  currentTrackId: string | null;
  isPlaying: boolean;
  likedTrackIds: string[];
  isUserVip: boolean;
  onPlayTrack: (track: Track) => void;
  onToggleLike: (trackId: string) => void;
  onDownloadTrack: (track: Track) => void;
  onNavigateToSupport: () => void;
  onNavigateToAbout: () => void;
  onNavigateToSearch: () => void;
  onNavigateToLibrary: () => void;
  onSelectPlaylist: (playlist: Playlist) => void;
}

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${String(remainder).padStart(2, '0')}`;
};

export const HomeView: React.FC<HomeViewProps> = ({
  tracks,
  playlists,
  recentlyPlayedIds,
  currentTrackId,
  isPlaying,
  likedTrackIds,
  isUserVip,
  onPlayTrack,
  onToggleLike,
  onDownloadTrack,
  onNavigateToSupport,
  onNavigateToAbout,
  onNavigateToSearch,
  onNavigateToLibrary,
  onSelectPlaylist,
}) => {
  const featuredTrack = tracks[0] || null;
  const popularTracks = useMemo(() => [...tracks].sort((a, b) => (b.plays || 0) - (a.plays || 0)).slice(0, 6), [tracks]);
  const latestTracks = useMemo(() => tracks.slice(0, 8), [tracks]);
  const trackById = useMemo(() => new Map(tracks.map((track) => [track.id, track])), [tracks]);
  const recentTracks = useMemo(
    () => recentlyPlayedIds.map((id) => trackById.get(id)).filter((track): track is Track => Boolean(track)),
    [recentlyPlayedIds, trackById]
  );
  const recommendedTracks = useMemo(() => {
    const genreAffinity = new Map<string, number>();
    const artistAffinity = new Map<string, number>();
    tracks.forEach((track) => {
      if (!likedTrackIds.includes(track.id) && !recentlyPlayedIds.includes(track.id)) return;
      if (track.genre) genreAffinity.set(track.genre, (genreAffinity.get(track.genre) || 0) + 1);
      if (track.artist) artistAffinity.set(track.artist, (artistAffinity.get(track.artist) || 0) + 1);
    });
    return tracks
      .filter((track) => !likedTrackIds.includes(track.id) && !recentlyPlayedIds.includes(track.id))
      .map((track) => ({
        track,
        score: (genreAffinity.get(track.genre) || 0) * 3 + (artistAffinity.get(track.artist) || 0) * 2 + Math.log1p(Math.max(0, track.plays || 0)),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((item) => item.track);
  }, [tracks, likedTrackIds, recentlyPlayedIds]);

  return (
    <div className="caspian-v2-home space-y-10 sm:space-y-14 p-4 sm:p-7 lg:p-9" dir="rtl">
      {/* Season 2 artist stage */}
      <section className="caspian-v2-hero relative isolate overflow-hidden rounded-[2rem] min-h-[430px] sm:min-h-[470px]">
        <div className="absolute inset-0 -z-20">
          <img
            src={DJ_CASPIAN_INFO.bannerUrl}
            alt=""
            className="h-full w-full object-cover object-center opacity-35"
          />
        </div>
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(110deg,rgba(4,9,17,.98)_0%,rgba(5,13,25,.88)_42%,rgba(8,22,40,.35)_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(35,94,148,.42),transparent_34%),radial-gradient(circle_at_85%_80%,rgba(214,180,92,.16),transparent_30%)]" />
        <div className="absolute left-[-4rem] top-[-5rem] -z-10 h-72 w-72 rounded-full border border-white/5" />
        <div className="absolute left-[-1rem] top-[-2rem] -z-10 h-56 w-56 rounded-full border border-[#d6b45c]/10" />

        <div className="relative flex min-h-[430px] flex-col justify-between gap-10 p-6 sm:min-h-[470px] sm:p-10 lg:flex-row lg:items-end lg:p-12">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d6b45c]/30 bg-black/25 px-4 py-2 text-[10px] font-extrabold tracking-[.22em] text-[#f0d88a]" dir="ltr">
              <span className="h-2 w-2 rounded-full bg-[#d6b45c] shadow-[0_0_14px_rgba(214,180,92,.9)]" />
              DJ CASPIAN <span className="text-white/30">/</span> SEASON 02
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-200">
                <Waves className="h-4 w-4" />
                <span>صدای تازه، تجربه‌ای تازه</span>
              </div>
              <h1 className="text-4xl font-black leading-[1.12] tracking-tight text-white sm:text-6xl lg:text-7xl">
                موسیقی را
                <span className="block bg-gradient-to-l from-[#f0d88a] via-[#d6b45c] to-white bg-clip-text text-transparent">متفاوت تجربه کن.</span>
              </h1>
              <p className="max-w-xl text-sm leading-8 text-slate-200/80 sm:text-base">
                {DJ_CASPIAN_INFO.tagline}. وارد آرشیو اختصاصی کاسپین شو، آثار تازه را کشف کن و پلی‌لیست خودت را بساز.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {featuredTrack ? (
                <button
                  type="button"
                  onClick={() => onPlayTrack(featuredTrack)}
                  className="inline-flex items-center gap-2.5 rounded-full bg-[#d6b45c] px-6 py-3.5 text-sm font-black text-[#07101b] shadow-[0_10px_35px_rgba(214,180,92,.22)] transition hover:-translate-y-0.5 hover:bg-[#f0d88a]"
                >
                  {currentTrackId === featuredTrack.id && isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
                  {currentTrackId === featuredTrack.id && isPlaying ? 'توقف پخش' : 'شروع شنیدن'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onNavigateToSearch}
                  className="inline-flex items-center gap-2.5 rounded-full bg-[#d6b45c] px-6 py-3.5 text-sm font-black text-[#07101b] shadow-[0_10px_35px_rgba(214,180,92,.22)] transition hover:-translate-y-0.5 hover:bg-[#f0d88a]"
                >
                  <Headphones className="h-5 w-5" />
                  کشف آرشیو موسیقی
                </button>
              )}
              <button
                type="button"
                onClick={onNavigateToLibrary}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-6 py-3.5 text-sm font-bold text-white backdrop-blur-md transition hover:border-[#d6b45c]/50 hover:bg-white/10"
              >
                کتابخانه من <ArrowLeft className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-end justify-between gap-5 lg:min-w-[250px] lg:flex-col lg:items-end">
            <div className="caspian-v2-logo-orbit relative flex h-28 w-28 items-center justify-center sm:h-36 sm:w-36">
              <div className="absolute inset-0 rounded-full border border-[#d6b45c]/25" />
              <div className="absolute inset-3 rounded-full border border-sky-200/15" />
              <img
                src="https://irkdzjizhwxbmnnfyqsx.supabase.co/storage/v1/object/public/brand-assets/caspian-official-logo.png"
                alt="لوگوی رسمی DJ Caspian"
                className="h-16 w-16 object-contain drop-shadow-[0_0_24px_rgba(214,180,92,.35)] sm:h-20 sm:w-20"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 text-left" dir="ltr">
              <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 backdrop-blur-lg">
                <div className="text-2xl font-black text-white tabular-nums">{tracks.length}</div>
                <div className="mt-1 text-[10px] font-bold tracking-wider text-slate-400">TRACKS</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 backdrop-blur-lg">
                <div className="text-2xl font-black text-white tabular-nums">{playlists.length}</div>
                <div className="mt-1 text-[10px] font-bold tracking-wider text-slate-400">PLAYLISTS</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Discovery shortcuts */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="caspian-v2-kicker">DISCOVER YOUR SOUND</div>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">از کجا شروع کنیم؟</h2>
          </div>
          <span className="hidden text-xs text-slate-500 sm:block">انتخاب سریع برای شنیدن</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button type="button" onClick={onNavigateToSearch} className="caspian-v2-shortcut group">
            <span className="caspian-v2-shortcut-icon"><Radio className="h-6 w-6" /></span>
            <span className="min-w-0 flex-1 text-right">
              <span className="block text-sm font-extrabold text-white">کشف موسیقی</span>
              <span className="mt-1 block text-xs text-slate-400">جستجو در سبک‌ها و آثار</span>
            </span>
            <ArrowLeft className="h-4 w-4 text-slate-500 transition group-hover:-translate-x-1 group-hover:text-[#f0d88a]" />
          </button>
          <button type="button" onClick={onNavigateToLibrary} className="caspian-v2-shortcut group">
            <span className="caspian-v2-shortcut-icon"><Disc3 className="h-6 w-6" /></span>
            <span className="min-w-0 flex-1 text-right">
              <span className="block text-sm font-extrabold text-white">کتابخانه موسیقی</span>
              <span className="mt-1 block text-xs text-slate-400">آرشیو و پلی‌لیست‌ها</span>
            </span>
            <ArrowLeft className="h-4 w-4 text-slate-500 transition group-hover:-translate-x-1 group-hover:text-[#f0d88a]" />
          </button>
          <button type="button" onClick={onNavigateToSupport} className="caspian-v2-shortcut group">
            <span className="caspian-v2-shortcut-icon caspian-v2-shortcut-gold"><Crown className="h-6 w-6" /></span>
            <span className="min-w-0 flex-1 text-right">
              <span className="block text-sm font-extrabold text-white">عضویت VIP</span>
              <span className="mt-1 block text-xs text-slate-400">حمایت از کاسپین و دانلود ویژه</span>
            </span>
            <ArrowLeft className="h-4 w-4 text-slate-500 transition group-hover:-translate-x-1 group-hover:text-[#f0d88a]" />
          </button>
        </div>
      </section>

      {/* Recently played: persisted locally on this device */}
      {recentTracks.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="caspian-v2-kicker">PICK UP WHERE YOU LEFT OFF</div>
              <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">اخیراً گوش داده‌ای</h2>
            </div>
            <span className="text-xs text-slate-500">روی هر قطعه بزن تا دوباره پخش شود</span>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {recentTracks.slice(0, 6).map((track) => (
              <button key={track.id} type="button" onClick={() => onPlayTrack(track)} className="caspian-v2-recent-row group">
                <img src={track.coverUrl} alt="" loading="lazy" className="h-12 w-12 rounded-xl object-cover" />
                <span className="min-w-0 flex-1 text-right">
                  <span className="block truncate text-sm font-bold text-white">{track.title}</span>
                  <span className="mt-1 block truncate text-xs text-slate-400">{track.artist}</span>
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d6b45c]/20 bg-[#d6b45c]/[0.08] text-[#e8c875] transition group-hover:bg-[#d6b45c] group-hover:text-[#07101b]"><Play className="h-4 w-4 fill-current" /></span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Personalized recommendations based on actual likes and listening history */}
      {recommendedTracks.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="caspian-v2-kicker">YOUR TASTE, YOUR DISCOVERY</div>
              <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">پیشنهادهای کاسپین برای تو</h2>
              <p className="mt-1 text-xs text-slate-400">بر اساس سبک‌ها و هنرمندانی که واقعاً گوش داده‌ای یا ذخیره کرده‌ای</p>
            </div>
            <span className="text-[10px] text-slate-500">PERSONALIZED</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {recommendedTracks.map((track) => (
              <button key={track.id} type="button" onClick={() => onPlayTrack(track)} className="caspian-v2-track-card group text-right">
                <img src={track.coverUrl} alt={track.title} loading="lazy" className="aspect-square w-full rounded-2xl object-cover transition duration-700 group-hover:scale-[1.02]" />
                <span className="mt-3 block truncate text-sm font-extrabold text-white group-hover:text-[#f0d88a]">{track.title}</span>
                <span className="mt-1 block truncate text-xs text-slate-400">{track.artist}</span>
                <span className="mt-2 block truncate text-[10px] text-slate-500">{track.genre}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Fresh releases */}
      <section className="space-y-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="caspian-v2-kicker">FRESH FROM THE STUDIO</div>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">تازه‌های کاسپین</h2>
            <p className="mt-1 text-xs text-slate-400">جدیدترین انتشارها از استودیو DJ Caspian</p>
          </div>
          <button type="button" onClick={onNavigateToLibrary} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#e8c875] transition hover:text-white">
            مشاهده همه <ArrowLeft className="h-4 w-4" />
          </button>
        </div>

        {latestTracks.length === 0 ? (
          <div className="caspian-v2-empty">
            <div className="caspian-v2-empty-icon"><Music2 className="h-8 w-8" /></div>
            <h3 className="text-lg font-extrabold text-white">آرشیو فصل دوم در حال آماده‌سازی است</h3>
            <p className="max-w-lg text-sm leading-7 text-slate-400">
              به‌محض انتشار آثار جدید، آن‌ها را همین‌جا پیدا می‌کنی. فعلاً می‌توانی بخش‌های مختلف پلتفرم را بررسی کنی.
            </p>
            <button type="button" onClick={onNavigateToAbout} className="mt-2 text-xs font-bold text-[#e8c875] hover:text-white">
              آشنایی با DJ Caspian
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {latestTracks.slice(0, 8).map((track, index) => {
              const active = currentTrackId === track.id && isPlaying;
              const liked = likedTrackIds.includes(track.id);
              return (
                <article key={track.id} className="caspian-v2-track-card group">
                  <button type="button" onClick={() => onPlayTrack(track)} className="relative block w-full overflow-hidden rounded-2xl text-right">
                    <img src={track.coverUrl} alt={track.title} loading={index > 3 ? 'lazy' : 'eager'} className="aspect-square w-full object-cover transition duration-700 group-hover:scale-105" />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/5" />
                    <span className="absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#d6b45c] text-[#07101b] opacity-100 shadow-lg transition sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
                      {active ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
                    </span>
                    {track.isVipOnlyDownload && <span className="absolute right-3 top-3 rounded-full border border-[#d6b45c]/35 bg-black/55 px-2 py-1 text-[9px] font-black text-[#f0d88a] backdrop-blur">VIP DOWNLOAD</span>}
                  </button>
                  <div className="flex items-start justify-between gap-2 px-1 pt-3">
                    <button type="button" onClick={() => onPlayTrack(track)} className="min-w-0 flex-1 text-right">
                      <span className="block truncate text-sm font-extrabold text-white transition group-hover:text-[#f0d88a]">{track.title}</span>
                      <span className="mt-1 block truncate text-xs text-slate-400">{track.artist}</span>
                    </button>
                    <button type="button" onClick={() => onToggleLike(track.id)} aria-label={liked ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'} className={`rounded-full p-2 transition ${liked ? 'text-[#e8c875]' : 'text-slate-500 hover:text-white'}`}>
                      <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between px-1 pt-2 text-[10px] text-slate-500">
                    <span>{track.genre}</span>
                    <span className="font-mono" dir="ltr">{formatDuration(track.duration)}</span>
                  </div>
                  <button type="button" onClick={() => onDownloadTrack(track)} className="mt-3 inline-flex items-center gap-1.5 px-1 text-[10px] font-bold text-slate-400 transition hover:text-[#f0d88a]">
                    {isUserVip ? <Download className="h-3.5 w-3.5" /> : <Crown className="h-3.5 w-3.5" />}
                    {isUserVip ? 'دانلود نسخه اصلی' : 'دانلود ویژه VIP'}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Curated playlists */}
      <section className="space-y-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="caspian-v2-kicker">CURATED FOR THE MOMENT</div>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">پلی‌لیست‌های منتخب</h2>
          </div>
          <button type="button" onClick={onNavigateToLibrary} className="text-xs font-bold text-[#e8c875] hover:text-white">کتابخانه <ArrowLeft className="inline h-4 w-4" /></button>
        </div>
        {playlists.length === 0 ? (
          <div className="caspian-v2-playlist-empty">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d6b45c]/20 bg-[#d6b45c]/[0.07] text-[#e8c875]"><Disc3 className="h-6 w-6" /></div>
            <div>
              <h3 className="text-sm font-extrabold text-white">پلی‌لیست‌های تازه به‌زودی منتشر می‌شوند</h3>
              <p className="mt-1 text-xs text-slate-400">مجموعه‌های اختصاصی برای حال‌وهوای مختلف موسیقی.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {playlists.slice(0, 8).map((playlist) => (
              <button key={playlist.id} type="button" onClick={() => onSelectPlaylist(playlist)} className="caspian-v2-playlist-card group text-right">
                <div className="relative overflow-hidden rounded-2xl">
                  <img src={playlist.coverUrl} alt={playlist.title} loading="lazy" className="aspect-square w-full object-cover transition duration-700 group-hover:scale-105" />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-[#d6b45c] p-3 text-[#07101b] shadow-lg transition group-hover:-translate-y-1"><Play className="h-4 w-4 fill-current" /></span>
                </div>
                <span className="mt-3 block truncate text-sm font-extrabold text-white transition group-hover:text-[#f0d88a]">{playlist.title}</span>
                <span className="mt-1 block text-xs text-slate-400">{playlist.trackIds.length} قطعه</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Popular track list */}
      {popularTracks.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="caspian-v2-kicker">MOST PLAYED</div>
              <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">محبوب‌ترین قطعه‌ها</h2>
            </div>
            <span className="text-xs text-slate-500">{popularTracks.length} قطعه</span>
          </div>
          <div className="caspian-v2-list">
            {popularTracks.map((track, index) => {
              const active = currentTrackId === track.id && isPlaying;
              const liked = likedTrackIds.includes(track.id);
              return (
                <div key={track.id} className="caspian-v2-list-row group">
                  <button type="button" onClick={() => onPlayTrack(track)} className="flex min-w-0 flex-1 items-center gap-3 text-right">
                    <span className="w-5 shrink-0 text-center font-mono text-xs text-slate-500">{active ? <span className="text-[#e8c875]">♫</span> : index + 1}</span>
                    <img src={track.coverUrl} alt="" loading="lazy" className="h-11 w-11 rounded-xl object-cover" />
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-sm font-bold ${active ? 'text-[#e8c875]' : 'text-white'}`}>{track.title}</span>
                      <span className="mt-1 block truncate text-xs text-slate-400">{track.artist} · {track.genre}</span>
                    </span>
                  </button>
                  <span className="hidden w-20 text-center text-[11px] text-slate-500 sm:block">{(track.plays || 0).toLocaleString('en-US')}</span>
                  <button type="button" onClick={() => onToggleLike(track.id)} aria-label="علاقه‌مندی" className={`rounded-full p-2 ${liked ? 'text-[#e8c875]' : 'text-slate-600 hover:text-white'}`}><Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} /></button>
                  <span className="w-10 text-left font-mono text-xs text-slate-500" dir="ltr">{formatDuration(track.duration)}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Artist / VIP callout */}
      <section className="caspian-v2-artist-footer">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <img src={DJ_CASPIAN_INFO.avatarUrl} alt={DJ_CASPIAN_INFO.name} className="h-20 w-20 rounded-2xl border border-[#d6b45c]/25 object-cover shadow-xl" />
          <div className="min-w-0 flex-1">
            <div className="caspian-v2-kicker">THE ARTIST BEHIND THE SOUND</div>
            <h2 className="mt-2 text-xl font-black text-white">{DJ_CASPIAN_INFO.name}</h2>
            <p className="mt-2 max-w-3xl text-xs leading-7 text-slate-300/75">{DJ_CASPIAN_INFO.bio}</p>
          </div>
          <div className="flex flex-col gap-2 sm:min-w-44">
            <button type="button" onClick={onNavigateToAbout} className="rounded-full border border-white/15 bg-white/[0.05] px-5 py-2.5 text-xs font-bold text-white transition hover:border-[#d6b45c]/40">درباره هنرمند</button>
            <button type="button" onClick={onNavigateToSupport} className="rounded-full bg-[#d6b45c] px-5 py-2.5 text-xs font-black text-[#07101b] transition hover:bg-[#f0d88a]">حمایت و عضویت VIP</button>
          </div>
        </div>
      </section>
    </div>
  );
};
