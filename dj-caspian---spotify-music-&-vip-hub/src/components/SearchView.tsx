import React, { useMemo, useState } from 'react';
import { Search, Play, Pause, Heart, Download, Crown, Disc3, X, SlidersHorizontal, Music2, UserRound, Album, ListPlus } from 'lucide-react';
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
  onAddToQueue: (track: Track) => void;
}

type SortMode = 'newest' | 'popular' | 'title';

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
  onAddToQueue,
}) => {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<{ type: 'artist' | 'album'; name: string } | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('newest');

  const genres = useMemo(() => Array.from(new Set(tracks.map((track) => track.genre).filter(Boolean))).sort(), [tracks]);
  const artists = useMemo(() => Array.from(new Set(tracks.map((track) => track.artist).filter(Boolean))).slice(0, 8), [tracks]);
  const albums = useMemo(() => Array.from(new Set(tracks.map((track) => track.album).filter(Boolean))).slice(0, 8), [tracks]);

  const filtered = useMemo(() => {
    const query = searchQuery.toLocaleLowerCase().trim();
    const result = tracks.filter((track) => {
      const haystack = [track.title, track.artist, track.genre, track.album, track.description || ''].join(' ').toLocaleLowerCase();
      const matchesQuery = !query || haystack.includes(query);
      const matchesGenre = !selectedGenre || track.genre === selectedGenre;
      const matchesCollection = !selectedCollection || (selectedCollection.type === 'artist' ? track.artist === selectedCollection.name : track.album === selectedCollection.name);
      return matchesQuery && matchesGenre && matchesCollection;
    });
    return result.sort((a, b) => {
      if (sortMode === 'popular') return (b.plays || 0) - (a.plays || 0);
      if (sortMode === 'title') return a.title.localeCompare(b.title, 'fa');
      return new Date(b.releaseDate || 0).getTime() - new Date(a.releaseDate || 0).getTime();
    });
  }, [tracks, searchQuery, selectedGenre, selectedCollection, sortMode]);

  const chooseCollection = (type: 'artist' | 'album', name: string) => {
    setSelectedCollection({ type, name });
    onSearchChange('');
    setSelectedGenre(null);
  };

  return (
    <div className="caspian-v2-search space-y-8 p-4 sm:p-7 lg:p-9" dir="rtl">
      <section className="space-y-5">
        <div>
          <div className="caspian-v2-kicker">FIND YOUR NEXT FAVORITE</div>
          <h1 className="mt-2 flex items-center gap-3 text-2xl font-black text-white sm:text-4xl">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#d6b45c]/20 bg-[#d6b45c]/[0.08] text-[#e8c875]"><Search className="h-5 w-5" /></span>
            کشف موسیقی
          </h1>
          <p className="mt-2 text-sm text-slate-400">بین قطعه‌ها، هنرمندها، آلبوم‌ها و سبک‌های موسیقی کاسپین جستجو کن.</p>
        </div>

        <div className="caspian-v2-searchbox">
          <Search className="h-5 w-5 shrink-0 text-[#e8c875]" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="نام آهنگ، هنرمند، آلبوم یا سبک..."
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            aria-label="جستجوی موسیقی"
          />
          {searchQuery && (
            <button type="button" onClick={() => onSearchChange('')} aria-label="پاک کردن جستجو" className="rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          )}
          <span className="hidden rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] text-slate-500 sm:block">LIVE SEARCH</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setSelectedGenre(null)} className={`caspian-v2-filter-pill ${!selectedGenre ? 'is-active' : ''}`}>همه سبک‌ها</button>
          {genres.map((genre) => (
            <button key={genre} type="button" onClick={() => setSelectedGenre((current) => current === genre ? null : genre)} className={`caspian-v2-filter-pill ${selectedGenre === genre ? 'is-active' : ''}`}>
              {genre}
            </button>
          ))}
        </div>
      </section>

      {selectedCollection && (() => {
        const collectionTracks = tracks.filter((track) => selectedCollection.type === 'artist' ? track.artist === selectedCollection.name : track.album === selectedCollection.name);
        const cover = collectionTracks.find((track) => track.coverUrl)?.coverUrl;
        const firstTrack = collectionTracks[0];
        return (
          <section className="relative overflow-hidden rounded-[2rem] border border-[#d6b45c]/20 bg-gradient-to-l from-[#102944] via-[#091827] to-[#050b13] p-5 sm:p-8">
            {cover && <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-10 blur-2xl" />}
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end">
              {cover ? <img src={cover} alt="" className="h-32 w-32 rounded-2xl border border-white/10 object-cover shadow-2xl" /> : <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-white/5 text-[#e8c875]"><Disc3 className="h-12 w-12" /></div>}
              <div className="min-w-0 flex-1">
                <div className="caspian-v2-kicker">{selectedCollection.type === 'artist' ? 'ARTIST PROFILE' : 'ALBUM COLLECTION'}</div>
                <h2 className="mt-2 break-words text-3xl font-black text-white sm:text-5xl">{selectedCollection.name}</h2>
                <p className="mt-2 text-sm text-slate-300">{collectionTracks.length} قطعه در آرشیو DJ Caspian</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={() => firstTrack && onPlayTrack(firstTrack)} disabled={!firstTrack} className="rounded-full bg-[#d6b45c] px-5 py-2.5 text-xs font-black text-[#07101b] disabled:opacity-40"><Play className="ml-1 inline h-4 w-4 fill-current" /> پخش مجموعه</button>
                  <button type="button" onClick={() => setSelectedCollection(null)} className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-bold text-white hover:bg-white/10">بازگشت به کشف موسیقی</button>
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {!selectedCollection && !searchQuery.trim() && tracks.length > 0 && (
        <div className="grid grid-cols-1 gap-7 xl:grid-cols-2">
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-extrabold text-white"><UserRound className="h-4 w-4 text-[#e8c875]" /> هنرمندان</div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {artists.map((artist, index) => (
                <button key={artist} type="button" onClick={() => chooseCollection('artist', artist)} className="caspian-v2-collection-card group">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d6b45c]/20 bg-[#d6b45c]/[0.08] text-[#e8c875]"><UserRound className="h-4 w-4" /></span>
                  <span className="mt-3 block truncate text-sm font-bold text-white">{artist}</span>
                  <span className="mt-1 block text-[10px] text-slate-500">{tracks.filter((track) => track.artist === artist).length} قطعه</span>
                </button>
              ))}
            </div>
          </section>
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-extrabold text-white"><Album className="h-4 w-4 text-[#e8c875]" /> آلبوم‌ها و مجموعه‌ها</div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {albums.map((album) => {
                const sample = tracks.find((track) => track.album === album);
                return (
                  <button key={album} type="button" onClick={() => chooseCollection('album', album)} className="caspian-v2-collection-card group">
                    {sample?.coverUrl ? <img src={sample.coverUrl} alt="" loading="lazy" className="h-10 w-10 rounded-xl object-cover" /> : <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#173654] text-[#b9dafa]"><Disc3 className="h-4 w-4" /></span>}
                    <span className="mt-3 block truncate text-sm font-bold text-white">{album}</span>
                    <span className="mt-1 block text-[10px] text-slate-500">{tracks.filter((track) => track.album === album).length} قطعه</span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      )}

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="caspian-v2-kicker">CATALOG RESULTS</div>
            <h2 className="mt-2 text-xl font-black text-white">{selectedCollection ? `قطعه‌های ${selectedCollection.name}` : searchQuery.trim() ? 'نتایج جستجو' : 'تمام قطعه‌ها'}</h2>
            <p className="mt-1 text-xs text-slate-400">{filtered.length} قطعه پیدا شد</p>
          </div>
          <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-300">
            <SlidersHorizontal className="h-4 w-4 text-[#e8c875]" />
            <span>مرتب‌سازی</span>
            <select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)} className="bg-transparent font-bold text-white outline-none">
              <option value="newest" className="bg-[#081321]">جدیدترین</option>
              <option value="popular" className="bg-[#081321]">محبوب‌ترین</option>
              <option value="title" className="bg-[#081321]">نام قطعه</option>
            </select>
          </label>
        </div>

        {filtered.length === 0 ? (
          <div className="caspian-v2-empty">
            <div className="caspian-v2-empty-icon"><Music2 className="h-8 w-8" /></div>
            <h3 className="text-lg font-extrabold text-white">{tracks.length === 0 ? 'آرشیو موسیقی هنوز خالی است' : 'قطعه‌ای با این مشخصات پیدا نشد'}</h3>
            <p className="max-w-lg text-sm leading-7 text-slate-400">
              {tracks.length === 0 ? 'به‌محض انتشار آثار جدید، این بخش به‌روزرسانی می‌شود.' : 'عبارت جستجو یا سبک انتخابی را تغییر بده و دوباره امتحان کن.'}
            </p>
            {(searchQuery || selectedGenre) && <button type="button" onClick={() => { onSearchChange(''); setSelectedGenre(null); }} className="mt-2 text-xs font-bold text-[#e8c875] hover:text-white">پاک کردن فیلترها</button>}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {filtered.map((track) => {
              const isCurrent = currentTrackId === track.id;
              const isActive = isCurrent && isPlaying;
              const isLiked = likedTrackIds.includes(track.id);
              return (
                <article key={track.id} className="caspian-v2-track-card group">
                  <button type="button" onClick={() => onPlayTrack(track)} className="relative block w-full overflow-hidden rounded-2xl text-right">
                    <img src={track.coverUrl} alt={track.title} loading="lazy" className="aspect-square w-full object-cover transition duration-700 group-hover:scale-105" />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/5" />
                    <span className="absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#d6b45c] text-[#07101b] shadow-lg transition sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
                      {isActive ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
                    </span>
                    {track.isVipOnlyDownload && <span className="absolute right-3 top-3 rounded-full border border-[#d6b45c]/35 bg-black/60 px-2 py-1 text-[9px] font-black text-[#f0d88a]">VIP DOWNLOAD</span>}
                  </button>
                  <div className="flex items-start justify-between gap-2 px-1 pt-3">
                    <button type="button" onClick={() => onPlayTrack(track)} className="min-w-0 flex-1 text-right">
                      <span className={`block truncate text-sm font-extrabold ${isCurrent ? 'text-[#e8c875]' : 'text-white'}`}>{track.title}</span>
                      <span className="mt-1 block truncate text-xs text-slate-400">{track.artist}</span>
                    </button>
                    <button type="button" onClick={() => onToggleLike(track.id)} aria-label={isLiked ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'} className={`rounded-full p-2 transition ${isLiked ? 'text-[#e8c875]' : 'text-slate-500 hover:text-white'}`}>
                      <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                    </button>
                    <button type="button" onClick={() => onAddToQueue(track)} aria-label="افزودن به صف پخش" title="افزودن به صف پخش" className="rounded-full p-2 text-slate-500 transition hover:bg-[#d6b45c]/10 hover:text-[#e8c875]"><ListPlus className="h-4 w-4" /></button>
                  </div>
                  <div className="flex items-center justify-between px-1 pt-2 text-[10px] text-slate-500">
                    <span className="truncate">{track.genre}</span>
                    <span className="shrink-0 font-mono" dir="ltr">{track.bpm} BPM</span>
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
    </div>
  );
};
