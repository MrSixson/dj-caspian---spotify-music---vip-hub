import React, { useState } from 'react';
import { Heart, Music2, Play, Pause, Download, Crown, Disc3, ListMusic, ListPlus, Plus, X, Trash2, Check } from 'lucide-react';
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
  onAddToQueue: (track: Track) => void;
  userPlaylists: Playlist[];
  onCreateUserPlaylist: (title: string, description: string) => void;
  onDeleteUserPlaylist: (playlistId: string) => void;
  onAddTrackToUserPlaylist: (playlistId: string, trackId: string) => void;
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
  onAddToQueue,
  userPlaylists,
  onCreateUserPlaylist,
  onDeleteUserPlaylist,
  onAddTrackToUserPlaylist,
  onSelectPlaylist,
  filterLikedOnly = false,
}) => {
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [playlistTitle, setPlaylistTitle] = useState('');
  const [playlistDescription, setPlaylistDescription] = useState('');
  const [trackToAdd, setTrackToAdd] = useState<Track | null>(null);
  const displayedTracks = selectedPlaylist
    ? tracks.filter((track) => selectedPlaylist.trackIds.includes(track.id))
    : filterLikedOnly
      ? tracks.filter((track) => likedTrackIds.includes(track.id))
      : tracks;

  return (
    <div className="caspian-v2-library space-y-9 p-4 sm:p-7 lg:p-9" dir="rtl">
      <section className="caspian-v2-library-hero">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#d6b45c]/25 bg-[#d6b45c]/[0.09] text-[#e8c875]">
          {filterLikedOnly ? <Heart className="h-7 w-7 fill-current" /> : <ListMusic className="h-7 w-7" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="caspian-v2-kicker">{selectedPlaylist ? 'PLAYLIST DETAILS' : filterLikedOnly ? 'YOUR FAVORITES' : 'YOUR MUSIC SPACE'}</div>
          <h1 className="mt-2 text-2xl font-black text-white sm:text-4xl">{selectedPlaylist ? selectedPlaylist.title : filterLikedOnly ? 'آهنگ‌های موردعلاقه' : 'کتابخانه موسیقی'}</h1>
          <p className="mt-2 text-xs leading-6 text-slate-400">{displayedTracks.length} قطعه در این بخش · {selectedPlaylist ? selectedPlaylist.description || 'پلی‌لیست انتخاب‌شده از آرشیو کاسپین' : filterLikedOnly ? 'مجموعه شخصی تو از آهنگ‌های ذخیره‌شده' : 'آثار، پلی‌لیست‌ها و آرشیو DJ Caspian'}</p>
        </div>
        {selectedPlaylist && <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => setSelectedPlaylist(null)} className="rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 text-xs font-bold text-white hover:border-[#d6b45c]/40">بازگشت به همه مجموعه‌ها</button>
          {selectedPlaylist.id.startsWith('user-') && <button type="button" onClick={() => { onDeleteUserPlaylist(selectedPlaylist.id); setSelectedPlaylist(null); }} className="inline-flex items-center gap-2 rounded-full border border-red-400/25 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-200 hover:bg-red-500/20"><Trash2 className="h-3.5 w-3.5" /> حذف پلی‌لیست</button>}
        </div>}
      </section>

      {!filterLikedOnly && !selectedPlaylist && (
        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <div className="caspian-v2-kicker">CURATED COLLECTIONS</div>
              <h2 className="mt-2 text-xl font-black text-white">پلی‌لیست‌ها و مجموعه‌ها</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">{playlists.length} مجموعه</span>
              <button type="button" onClick={() => setIsCreateOpen(true)} className="inline-flex items-center gap-2 rounded-full border border-[#d6b45c]/35 bg-[#d6b45c]/10 px-4 py-2 text-xs font-black text-[#f0d88a] transition hover:bg-[#d6b45c] hover:text-[#07101b]"><Plus className="h-4 w-4" /> ساخت پلی‌لیست</button>
            </div>
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
                <button key={playlist.id} type="button" onClick={() => { setSelectedPlaylist(playlist); onSelectPlaylist(playlist); }} className="caspian-v2-playlist-card group text-right">
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
            <div className="caspian-v2-kicker">{selectedPlaylist ? 'PLAYLIST TRACKS' : filterLikedOnly ? 'SAVED BY YOU' : 'ALL RELEASES'}</div>
            <h2 className="mt-2 text-xl font-black text-white">{selectedPlaylist ? 'آهنگ‌های این پلی‌لیست' : filterLikedOnly ? 'آهنگ‌های ذخیره‌شده' : 'تمام قطعه‌ها'}</h2>
          </div>
          <span className="text-xs text-slate-500">{displayedTracks.length} قطعه</span>
        </div>

        {displayedTracks.length === 0 ? (
          <div className="caspian-v2-empty">
            <div className="caspian-v2-empty-icon">{filterLikedOnly ? <Heart className="h-8 w-8" /> : <Music2 className="h-8 w-8" />}</div>
            <h3 className="text-lg font-extrabold text-white">{selectedPlaylist ? 'این پلی‌لیست هنوز آهنگی ندارد' : filterLikedOnly ? 'هنوز آهنگی ذخیره نکرده‌ای' : 'آرشیو موسیقی هنوز خالی است'}</h3>
            <p className="max-w-lg text-sm leading-7 text-slate-400">{selectedPlaylist ? 'به‌زودی آهنگ‌های این مجموعه نمایش داده می‌شوند.' : filterLikedOnly ? 'با زدن دکمه قلب کنار هر قطعه، آن را به این فهرست اضافه کن.' : 'به‌محض انتشار آثار تازه، قطعه‌ها در این بخش قرار می‌گیرند.'}</p>
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
                  <button type="button" onClick={() => onAddToQueue(track)} aria-label="افزودن به صف پخش" title="افزودن به صف پخش" className="rounded-full p-2 text-slate-500 transition hover:bg-[#d6b45c]/10 hover:text-[#e8c875]"><ListPlus className="h-4 w-4" /></button>
                  <button type="button" onClick={() => setTrackToAdd(track)} aria-label="افزودن به پلی‌لیست شخصی" title="افزودن به پلی‌لیست شخصی" className="rounded-full p-2 text-slate-500 transition hover:bg-[#d6b45c]/10 hover:text-[#e8c875]"><Plus className="h-4 w-4" /></button>
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

      {isCreateOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md" onClick={() => setIsCreateOpen(false)}>
          <section role="dialog" aria-modal="true" aria-label="ساخت پلی‌لیست" dir="rtl" className="w-full max-w-md space-y-5 rounded-3xl border border-[#d6b45c]/25 bg-[#081524] p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div><div className="caspian-v2-kicker">YOUR OWN COLLECTION</div><h2 className="mt-2 text-xl font-black text-white">پلی‌لیست جدید</h2></div>
              <button type="button" onClick={() => setIsCreateOpen(false)} className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="بستن"><X /></button>
            </div>
            <label className="block space-y-2 text-xs font-bold text-slate-300">نام پلی‌لیست
              <input autoFocus maxLength={80} value={playlistTitle} onChange={(event) => setPlaylistTitle(event.target.value)} placeholder="مثلاً شب‌های کاسپین" className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[#d6b45c]/60" />
            </label>
            <label className="block space-y-2 text-xs font-bold text-slate-300">توضیحات (اختیاری)
              <textarea maxLength={300} value={playlistDescription} onChange={(event) => setPlaylistDescription(event.target.value)} placeholder="حال‌وهوای این مجموعه..." rows={3} className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[#d6b45c]/60" />
            </label>
            <button type="button" disabled={!playlistTitle.trim()} onClick={() => { onCreateUserPlaylist(playlistTitle, playlistDescription); setPlaylistTitle(''); setPlaylistDescription(''); setIsCreateOpen(false); }} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[#f0d88a] to-[#c59c43] px-4 py-3 text-sm font-black text-[#07101b] shadow-lg shadow-[#d6b45c]/15 disabled:cursor-not-allowed disabled:opacity-40"><Check className="h-4 w-4" /> ساخت پلی‌لیست</button>
            <p className="text-center text-[10px] leading-5 text-slate-500">پلی‌لیست‌ها فعلاً روی همین دستگاه و برای همین حساب نگهداری می‌شوند.</p>
          </section>
        </div>
      )}

      {trackToAdd && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md" onClick={() => setTrackToAdd(null)}>
          <section role="dialog" aria-modal="true" aria-label="افزودن آهنگ به پلی‌لیست" dir="rtl" className="w-full max-w-md space-y-4 rounded-3xl border border-[#d6b45c]/25 bg-[#081524] p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div><div className="caspian-v2-kicker">ADD TO YOUR COLLECTION</div><h2 className="mt-2 text-lg font-black text-white">افزودن به پلی‌لیست</h2><p className="mt-1 max-w-[270px] truncate text-xs text-slate-400">{trackToAdd.title}</p></div>
              <button type="button" onClick={() => setTrackToAdd(null)} className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="بستن"><X /></button>
            </div>
            {userPlaylists.length ? (
              <div className="max-h-72 space-y-2 overflow-y-auto">
                {userPlaylists.map((playlist) => {
                  const alreadyAdded = playlist.trackIds.includes(trackToAdd.id);
                  return <button key={playlist.id} type="button" disabled={alreadyAdded} onClick={() => { onAddTrackToUserPlaylist(playlist.id, trackToAdd.id); setSelectedPlaylist((current) => current?.id === playlist.id ? { ...current, trackIds: alreadyAdded ? current.trackIds : [...current.trackIds, trackToAdd.id] } : current); setTrackToAdd(null); }} className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-right transition hover:border-[#d6b45c]/40 disabled:opacity-50">
                    <img src={playlist.coverUrl} alt="" className="h-11 w-11 rounded-xl object-cover" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-white">{playlist.title}</span><span className="mt-1 block text-[10px] text-slate-400">{playlist.trackIds.length} آهنگ</span></span>{alreadyAdded ? <Check className="h-4 w-4 text-emerald-400" /> : <Plus className="h-4 w-4 text-[#e8c875]" />}
                  </button>;
                })}
              </div>
            ) : <div className="caspian-v2-empty min-h-40"><ListMusic className="h-8 w-8 text-[#e8c875]" /><p className="text-sm font-bold text-white">هنوز پلی‌لیست شخصی نداری</p><button type="button" onClick={() => { setTrackToAdd(null); setIsCreateOpen(true); }} className="rounded-full bg-[#d6b45c] px-4 py-2 text-xs font-black text-[#07101b]">ساخت اولین پلی‌لیست</button></div>}
          </section>
        </div>
      )}
    </div>
  );
};
