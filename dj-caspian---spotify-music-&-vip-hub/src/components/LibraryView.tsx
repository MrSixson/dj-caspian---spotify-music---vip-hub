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
}) => {
  const displayedTracks = filterLikedOnly
    ? tracks.filter((t) => likedTrackIds.includes(t.id))
    : tracks;

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
                  <div className="font-bold text-sm text-white group-hover:text-[#1db954] truncate">
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
                      <div className={`font-bold text-sm truncate ${isCurrent ? 'text-[#1db954]' : 'text-white'}`}>
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
                      className={`p-1.5 cursor-pointer ${isLiked ? 'text-[#1db954]' : 'text-neutral-500 hover:text-white'}`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#1db954]' : ''}`} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownloadTrack(track);
                      }}
                      className={`py-1 px-2.5 rounded-full text-xs font-bold flex items-center gap-1 cursor-pointer ${
                        isUserVip
                          ? 'bg-[#1db954] text-black hover:bg-[#1ed760]'
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
