import React, { useState } from 'react';
import { Search, Play, Pause, Heart, Download, Crown, Disc3, Sparkles } from 'lucide-react';
import { Track } from '../types';

interface SearchViewProps {
  tracks: Track[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  currentTrackId: string | null;
  isPlaying: boolean;
  likedTrackIds: string[];
  isUserVip: boolean;
  onPlayTrack: (track: Track) => void;
  onToggleLike: (trackId: string) => void;
  onDownloadTrack: (track: Track) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  tracks,
  searchQuery,
  onSearchChange,
  currentTrackId,
  isPlaying,
  likedTrackIds,
  isUserVip,
  onPlayTrack,
  onToggleLike,
  onDownloadTrack,
}) => {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const genres = [
    { name: 'همه سبک‌ها', color: 'from-emerald-600 to-teal-800' },
    { name: 'Persian Club', color: 'from-amber-600 to-orange-800' },
    { name: 'Melodic Techno', color: 'from-purple-600 to-indigo-900' },
    { name: 'Deep House', color: 'from-blue-600 to-cyan-900' },
    { name: 'Persian EDM', color: 'from-rose-600 to-pink-900' },
    { name: 'Tech House', color: 'from-emerald-700 to-green-950' },
    { name: 'Tribal House', color: 'from-yellow-700 to-amber-900' },
  ];

  const filtered = tracks.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      t.title.toLowerCase().includes(q) ||
      t.artist.toLowerCase().includes(q) ||
      t.genre.toLowerCase().includes(q) ||
      t.album.toLowerCase().includes(q);

    const matchGenre = !selectedGenre || selectedGenre === 'همه سبک‌ها' || t.genre === selectedGenre;

    return matchQuery && matchGenre;
  });

  return (
    <div className="p-4 sm:p-8 space-y-6 animate-in fade-in duration-300" dir="rtl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
          <Search className="w-7 h-7 text-[#1db954]" />
          <span>جستجو و مرور سبک‌های دی‌جی کاسپین</span>
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          جستجو بر اساس نام ترک، ژانر الکترونیک، سرعت یا آلبوم
        </p>
      </div>

      {/* Genre Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {genres.map((g) => (
          <button
            key={g.name}
            onClick={() => {
              if (g.name === 'همه سبک‌ها') {
                setSelectedGenre(null);
              } else {
                setSelectedGenre(g.name === selectedGenre ? null : g.name);
              }
            }}
            className={`py-2 px-4 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
              (g.name === 'همه سبک‌ها' && !selectedGenre) || selectedGenre === g.name
                ? 'bg-white text-black shadow-lg scale-105'
                : 'bg-[#202020] hover:bg-[#2c2c2c] text-neutral-300'
            }`}
          >
            {g.name}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-neutral-400 border-b border-neutral-800 pb-2">
        <span>نتایج: {filtered.length} قطعه</span>
        {selectedGenre && <span>سبک انتخاب شده: {selectedGenre}</span>}
      </div>

      {/* Tracks Grid */}
      {filtered.length === 0 ? (
        <div className="bg-[#181818] border border-neutral-800 rounded-2xl p-12 text-center text-neutral-400 space-y-2">
          <Disc3 className="w-12 h-12 text-neutral-600 mx-auto" />
          <h3 className="text-white font-bold text-base">قطعه‌ای با این مشخصات پیدا نشد</h3>
          <p className="text-xs text-neutral-500">کلمات دیگری را جستجو کنید یا سبک دیگری را برگزینید.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((track) => {
            const isCurrent = currentTrackId === track.id && isPlaying;
            const isLiked = likedTrackIds.includes(track.id);

            return (
              <div
                key={track.id}
                onClick={() => onPlayTrack(track)}
                className="group p-4 bg-[#181818] hover:bg-[#222222] border border-neutral-800/80 hover:border-neutral-700 rounded-2xl cursor-pointer transition-all space-y-3"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden shadow-lg bg-neutral-900">
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayTrack(track);
                      }}
                      className="w-10 h-10 rounded-full bg-[#1db954] text-black flex items-center justify-center shadow-xl hover:scale-105 cursor-pointer"
                    >
                      {isCurrent ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-0.5" />}
                    </button>
                  </div>
                  {track.isVipOnlyDownload && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-amber-300 text-[10px] font-bold border border-amber-500/30 flex items-center gap-1">
                      <Crown className="w-3 h-3 fill-amber-400" />
                      <span>VIP</span>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className={`font-bold text-sm truncate ${isCurrent ? 'text-[#1db954]' : 'text-white'}`}>
                    {track.title}
                  </h3>
                  <div className="text-xs text-neutral-400 flex items-center justify-between mt-1">
                    <span className="truncate">{track.artist}</span>
                    <span className="text-[10px] text-neutral-500 font-mono">{track.bpm} BPM</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-800 text-xs">
                  <span className="text-[10px] text-neutral-500">{track.genre}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleLike(track.id);
                      }}
                      className={`p-1 text-xs ${isLiked ? 'text-[#1db954]' : 'text-neutral-500 hover:text-white'}`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-[#1db954]' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownloadTrack(track);
                      }}
                      className={`p-1.5 rounded-full ${
                        isUserVip ? 'text-[#1db954] hover:bg-[#1db954]/20' : 'text-amber-400 hover:bg-amber-400/20'
                      }`}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
