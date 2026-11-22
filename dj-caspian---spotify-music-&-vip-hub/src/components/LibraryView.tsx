import React from 'react';
import { Heart, Music2, Play, Pause, Download, Crown, Disc3, ListMusic } from 'lucide-react';
import { Track, Playlist } from '../types';

interface LibraryViewProps {
  tracks: Track[];
  playlists: Playlist[];
  likedTrackIds: string[];
  currentTrackId: string | null;
  isPlaying: boolean;
  isUserVip: boolean;
  onPlayTrack: (track: Track) => void;
  onToggleLike: (trackId: string) => void;
  onDownloadTrack: (track: Track) => void;
  onSelectPlaylist: (playlist: Playlist) => void;
  filterLikedOnly?: boolean;
}

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
};

export const LibraryView: React.FC<LibraryViewProps> = ({
  tracks,
  playlists,
  likedTrackIds,
  currentTrackId,
  isPlaying,
  isUserVip,
  onPlayTrack,
  onToggleLike,
  onDownloadTrack,
  onSelectPlaylist,
  filterLikedOnly = false,
}) => {
  const displayedTracks = filterLikedOnly
    ? tracks.filter((track) => likedTrackIds.includes(track.id))
    : tracks;

  return (
    <div className="caspian-v2-library space-y-9 p-4 sm:p-7 lg:p-9" dir="rtl">
      <section className="caspian-v2-library-hero">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#d6b45c]/25 bg-[#d6b45c]/[0.09] text-[#e8c875]">
          {filterLikedOnly ? <Heart className="h-7 w-7 fill-current" /> : <ListMusic className="h-7 w-7" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="caspian-v2-kicker">{filterLikedOnly ? 'YOUR FAVORITES' : 'YOUR MUSIC SPACE'}</div>
          <h1 className="mt-2 text-2xl font-black text-white sm:text-4xl">{filterLikedOnly ? 'آهنگ‌های موردعلاقه' : 'کتابخانه موسیقی'}</h1>
          <p className="mt-2 text-xs leading-6 text-slate-400">{displayedTracks.length} قطعه در این بخش · {filterLikedOnly ? 'مجموعه شخصی تو از آهنگ‌های ذخیره‌شده' : 'آثار، پلی‌لیست‌ها و آرشیو DJ Caspian'}</p>
        </div>
      </section>

      {!filterLikedOnly && (
        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <div className="caspian-v2-kicker">CURATED COLLECTIONS</div>
              <h2 className="mt-2 text-xl font-black text-white">پلی‌لیست‌ها و مجموعه‌ها</h2>
            </div>
            <span className="text-xs text-slate-500">{playlists.length} مجموعه</span>
          </div>
          {playlists.length === 0 ? (
            <div className="caspian-v2-playlist-empty">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d6b45c]/20 bg-[#d6b45c]/[0.07] text-[#e8c875]"><Disc3 className="h-6 w-6" /></span>
              <div>
                <h3 className="text-sm font-extrabold text-white">هنوز مجموعه‌ای منتشر نشده است</h3>
                <p className="mt-1 text-xs text-slate-400">با انتشار پلی‌لیست‌های رسمی، اینجا نمایش داده می‌شوند.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {playlists.map((playlist) => (
                <button key={playlist.id} type="button" onClick={() => onSelectPlaylist(playlist)} className="caspian-v2-playlist-card group text-right">
                  <div className="relative overflow-hidden rounded-2xl">
                    <img src={playlist.coverUrl} alt={playlist.title} loading="lazy" className="aspect-square w-full object-cover transition duration-700 group-hover:scale-105" />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                    <span className="absolute bottom-3 left-3 rounded-full bg-[#d6b45c] p-3 text-[#07101b] shadow-lg"><Play className="h-4 w-4 fill-current" /></span>
                  </div>
                  <span className="mt-3 block truncate text-sm font-extrabold text-white">{playlist.title}</span>
                  <span className="mt-1 block text-xs text-slate-400">{playlist.trackIds.length} قطعه</span>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="caspian-v2-kicker">{filterLikedOnly ? 'SAVED BY YOU' : 'ALL RELEASES'}</div>
            <h2 className="mt-2 text-xl font-black text-white">{filterLikedOnly ? 'آهنگ‌های ذخیره‌شده' : 'تمام قطعه‌ها'}</h2>
          </div>
          <span className="text-xs text-slate-500">{displayedTracks.length} قطعه</span>
        </div>

        {displayedTracks.length === 0 ? (
          <div className="caspian-v2-empty">
            <div className="caspian-v2-empty-icon">{filterLikedOnly ? <Heart className="h-8 w-8" /> : <Music2 className="h-8 w-8" />}</div>
            <h3 className="text-lg font-extrabold text-white">{filterLikedOnly ? 'هنوز آهنگی ذخیره نکرده‌ای' : 'آرشیو موسیقی هنوز خالی است'}</h3>
            <p className="max-w-lg text-sm leading-7 text-slate-400">{filterLikedOnly ? 'با زدن دکمه قلب کنار هر قطعه، آن را به این فهرست اضافه کن.' : 'به‌محض انتشار آثار تازه، قطعه‌ها در این بخش قرار می‌گیرند.'}</p>
          </div>
        ) : (
          <div className="caspian-v2-list">
            {displayedTracks.map((track, index) => {
              const current = currentTrackId === track.id;
              const active = current && isPlaying;
              const liked = likedTrackIds.includes(track.id);
              return (
                <div key={track.id} className="caspian-v2-list-row group">
                  <button type="button" onClick={() => onPlayTrack(track)} className="flex min-w-0 flex-1 items-center gap-3 text-right">
                    <span className="w-5 shrink-0 text-center font-mono text-xs text-slate-500">{active ? '♫' : index + 1}</span>
                    <img src={track.coverUrl} alt="" loading="lazy" className="h-11 w-11 rounded-xl object-cover" />
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-sm font-bold ${current ? 'text-[#e8c875]' : 'text-white'}`}>{track.title}</span>
                      <span className="mt-1 block truncate text-xs text-slate-400">{track.artist} · {track.album}</span>
                    </span>
                  </button>
                  <span className="hidden w-24 text-center text-[10px] text-slate-500 sm:block">{track.genre}</span>
                  <button type="button" onClick={() => onToggleLike(track.id)} aria-label="علاقه‌مندی" className={`rounded-full p-2 ${liked ? 'text-[#e8c875]' : 'text-slate-600 hover:text-white'}`}>
                    <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                  </button>
                  <button type="button" onClick={() => onDownloadTrack(track)} aria-label={isUserVip ? 'دانلود' : 'دانلود ویژه VIP'} className="rounded-full p-2 text-slate-500 transition hover:bg-white/5 hover:text-[#e8c875]">
                    {isUserVip ? <Download className="h-4 w-4" /> : <Crown className="h-4 w-4" />}
                  </button>
                  <span className="w-10 text-left font-mono text-xs text-slate-500" dir="ltr">{formatDuration(track.duration)}</span>
                  <span className="hidden w-8 text-center text-slate-500 sm:block">{active ? <Pause className="inline h-4 w-4 text-[#e8c875]" /> : <Play className="inline h-4 w-4 opacity-0 group-hover:opacity-100" />}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
