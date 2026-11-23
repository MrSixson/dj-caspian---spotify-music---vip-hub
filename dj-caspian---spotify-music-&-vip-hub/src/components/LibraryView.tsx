import React from 'react';
import { Heart, Music, Play, Pause, Download, Crown, Disc3 } from 'lucide-react';
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
  selectedPlaylist?: Playlist | null;
  onBackFromPlaylist?: () => void;
}

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
  selectedPlaylist = null,
  onBackFromPlaylist,
}) => {
  const displayedTracks = filterLikedOnly
    ? tracks.filter((t) => likedTrackIds.includes(t.id))
    : tracks;

  if (selectedPlaylist && !filterLikedOnly) {
    const playlistTracks = selectedPlaylist.trackIds
      .map((id) => tracks.find((track) => track.id === id))
      .filter((track): track is Track => Boolean(track));

    return (
      <div className="p-4 sm:p-8 space-y-6 animate-in fade-in duration-300" dir="rtl">
        <button type="button" onClick={onBackFromPlaylist} className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-[#d6b45c] transition-colors">
          <span>→</span> بازگشت به کتابخانه
        </button>
        <section className="relative overflow-hidden rounded-3xl border border-[#d6b45c]/20 bg-gradient-to-br from-[#15375a] via-[#0b1728] to-[#05080e] p-6 sm:p-9 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-2xl overflow-hidden shadow-2xl shrink-0">
            {selectedPlaylist.coverUrl ? <img src={selectedPlaylist.coverUrl} alt={selectedPlaylist.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Disc3 className="w-12 h-12 text-[#d6b45c]" /></div>}
          </div>
          <div className="min-w-0 text-center sm:text-right">
            <span className="text-[10px] uppercase tracking-[.25em] text-[#f0d88a] font-bold">DJ CASPIAN PLAYLIST</span>
            <h1 className="text-3xl sm:text-5xl font-black text-white mt-2">{selectedPlaylist.title}</h1>
            <p className="text-sm text-neutral-300 mt-3 max-w-xl">{selectedPlaylist.description}</p>
            <p className="text-xs text-neutral-400 mt-3">{playlistTracks.length} قطعه در این پلی‌لیست</p>
          </div>
        </section>
        {playlistTracks.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[.03] p-10 text-center text-sm text-neutral-500">این پلی‌لیست هنوز آهنگی ندارد.</div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[.025] overflow-hidden divide-y divide-white/5">
            {playlistTracks.map((track, index) => (
              <div key={track.id} className="flex items-center gap-3 p-3 hover:bg-white/[.04]">
                <span className="w-6 text-center text-xs text-neutral-600">{index + 1}</span>
                <img src={track.coverUrl} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                <button type="button" onClick={() => onPlayTrack(track)} className="min-w-0 flex-1 text-right">
                  <span className="block text-sm font-bold text-white truncate">{track.title}</span>
                  <span className="block text-xs text-neutral-500 truncate mt-1">{track.artist} · {track.genre}</span>
                </button>
                <button type="button" onClick={() => onPlayTrack(track)} className="p-2 text-[#d6b45c] hover:text-white" aria-label={`پخش ${track.title}`}>
                  <Play className="w-4 h-4 fill-current" />
                </button>
                <button type="button" onClick={() => onDownloadTrack(track)} className="p-2 text-neutral-500 hover:text-[#d6b45c]" aria-label={`دانلود ${track.title}`}>
                  {isUserVip ? <Download className="w-4 h-4" /> : <Crown className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-6 animate-in fade-in duration-300" dir="rtl">
      {/* Top Banner */}
      <div className="flex items-center gap-4 p-6 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/20 to-[#181818] border border-indigo-700/30">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-xl shadow-purple-500/20">
          <Heart className="w-10 h-10 fill-white" />
        </div>
        <div>
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
            {filterLikedOnly ? 'پلی‌لیست اختصاصی' : 'کتابخانه شما'}
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-white mt-1">
            {filterLikedOnly ? 'آهنگ‌های لایک شده' : 'کتابخانه و آرشیو موزیک'}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            {displayedTracks.length} قطعه منتخب از دی‌جی کاسپین
          </p>
        </div>
      </div>

      {/* Playlist Grid if not filtering liked only */}
      {!filterLikedOnly && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white">پلی‌لیست‌های پیشنهادی</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {playlists.map((pl) => (
              <div
                key={pl.id}
                onClick={() => onSelectPlaylist(pl)}
                className="group flex items-center gap-3 p-3 bg-[#181818] hover:bg-[#222] border border-neutral-800 rounded-xl cursor-pointer transition-colors"
              >
                <img
                  src={pl.coverUrl}
                  alt={pl.title}
                  className="w-14 h-14 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-white group-hover:text-[#d6b45c] truncate">
                    {pl.title}
                  </div>
                  <div className="text-[11px] text-neutral-400 truncate mt-0.5">
                    {pl.trackIds.length} قطعه
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Track List */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white">
          {filterLikedOnly ? 'قطعات پسندیده شده' : 'همه قطعات'}
        </h2>

        {displayedTracks.length === 0 ? (
          <div className="bg-[#181818] border border-neutral-800 rounded-2xl p-10 text-center text-neutral-400 space-y-2">
            <Heart className="w-10 h-10 text-neutral-600 mx-auto" />
            <h3 className="text-white font-bold text-sm">هنوز آهنگی را لایک نکرده‌اید</h3>
            <p className="text-xs text-neutral-500">با زدن آیکون قلب، آهنگ‌های مورد علاقه‌تان اینجا ذخیره می‌شوند.</p>
          </div>
        ) : (
          <div className="bg-[#181818] border border-neutral-800 rounded-2xl overflow-hidden divide-y divide-neutral-800">
            {displayedTracks.map((track, idx) => {
              const isCurrent = currentTrackId === track.id && isPlaying;
              const isLiked = likedTrackIds.includes(track.id);

              return (
                <div
                  key={track.id}
                  onClick={() => onPlayTrack(track)}
                  className="p-3.5 flex items-center justify-between gap-3 hover:bg-[#222] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-neutral-500 text-xs font-mono w-4 text-center">
                      {idx + 1}
                    </span>
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className={`font-bold text-sm truncate ${isCurrent ? 'text-[#d6b45c]' : 'text-white'}`}>
                        {track.title}
                      </div>
                      <div className="text-xs text-neutral-400 truncate mt-0.5 flex items-center gap-1.5">
                        <span>{track.artist}</span>
                        <span>•</span>
                        <span className="text-neutral-500">{track.genre}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleLike(track.id);
                      }}
                      className={`p-1.5 cursor-pointer ${isLiked ? 'text-[#d6b45c]' : 'text-neutral-500 hover:text-white'}`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#d6b45c]' : ''}`} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownloadTrack(track);
                      }}
                      className={`py-1 px-2.5 rounded-full text-xs font-bold flex items-center gap-1 cursor-pointer ${
                        isUserVip
                          ? 'bg-[#d6b45c] text-black hover:bg-[#f0d88a]'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{isUserVip ? 'دانلود' : 'VIP'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
