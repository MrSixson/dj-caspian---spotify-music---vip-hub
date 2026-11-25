import React from 'react';
import {
  Play, Pause, Heart, Download, Crown, Sparkles, ListPlus,
  CheckCircle2, Clock3, Music2, Disc3, Headphones, ArrowUpLeft,
  Radio, AudioLines
} from 'lucide-react';
import { Track, Playlist } from '../types';
import { DJ_CASPIAN_INFO } from '../data/initialData';

interface HomeViewProps {
  tracks: Track[];
  playlists: Playlist[];
  currentTrackId: string | null;
  isPlaying: boolean;
  likedTrackIds: string[];
  recentTrackIds: string[];
  isUserVip: boolean;
  onPlayTrack: (track: Track) => void;
  onToggleLike: (trackId: string) => void;
  onDownloadTrack: (track: Track) => void;
  onQueueTrack: (track: Track) => void;
  onNavigateToSupport: () => void;
  onNavigateToAbout: () => void;
  onSelectPlaylist: (playlist: Playlist) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  tracks, playlists, currentTrackId, isPlaying, likedTrackIds, recentTrackIds,
  isUserVip, onPlayTrack, onToggleLike, onDownloadTrack, onQueueTrack,
  onNavigateToSupport, onNavigateToAbout, onSelectPlaylist,
}) => {
  const featured = tracks[0] || null;
  const recent = recentTrackIds.map(id => tracks.find(t => t.id === id)).filter((t): t is Track => Boolean(t));
  const uniqueArtists = Array.from(new Map(tracks.map(t => [t.artist, t])).values());
  const albums = Array.from(tracks.reduce((map, track) => {
    const key = `${track.artist || 'DJ Caspian'}::${track.album || 'Singles'}`;
    if (!map.has(key)) map.set(key, [] as Track[]);
    map.get(key)!.push(track);
    return map;
  }, new Map<string, Track[]>()).entries()).map(([key, items]) => ({ key, title: items[0].album || 'Singles', artist: items[0].artist, cover: items[0].coverUrl, tracks: items }));
  const fmt = (seconds: number) => `${Math.floor((seconds || 0) / 60)}:${String(Math.floor((seconds || 0) % 60)).padStart(2, '0')}`;

  const playButton = (track: Track, large = false) => {
    const active = currentTrackId === track.id && isPlaying;
    return <button type="button" onClick={() => onPlayTrack(track)} aria-label={active ? 'توقف پخش' : 'پخش'} className={`flex items-center justify-center rounded-full bg-[#d6b45c] text-[#080b10] shadow-lg shadow-[#d6b45c]/20 hover:scale-105 transition-all ${large ? 'w-14 h-14' : 'w-10 h-10'}`}>
      {active ? <Pause className={large ? 'w-6 h-6 fill-current' : 'w-4 h-4 fill-current'} /> : <Play className={large ? 'w-6 h-6 fill-current' : 'w-4 h-4 fill-current'} />}
    </button>;
  };

  const sectionTitle = (title: string, subtitle?: string) => (
    <div className="flex items-end justify-between gap-3 mb-4">
      <div><h2 className="text-lg sm:text-xl font-black text-white">{title}</h2>{subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}</div>
      <span className="text-[10px] tracking-[.2em] text-[#d6b45c]/70 font-bold">CASPIAN SELECTS</span>
    </div>
  );

  const trackCard = (track: Track, index: number) => {
    const active = currentTrackId === track.id && isPlaying;
    const liked = likedTrackIds.includes(track.id);
    return <article key={track.id} className="dc-track-card group min-w-0 rounded-2xl p-3 sm:p-4">
      <div className="relative aspect-square rounded-xl overflow-hidden bg-[#101b29] mb-3">
        {track.coverUrl ? <img src={track.coverUrl} alt={track.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="w-full h-full flex items-center justify-center text-[#d6b45c]"><Disc3 className="w-14 h-14" /></div>}
        {track.isVipOnlyDownload && <span className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/75 border border-amber-400/30 px-2 py-1 text-[9px] font-bold text-amber-300"><Crown className="w-3 h-3" /> VIP</span>}
        <div className="absolute bottom-2 left-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">{playButton(track)}</div>
      </div>
      <div className="min-w-0">
        <button type="button" onClick={() => onPlayTrack(track)} className={`block w-full text-right truncate text-sm font-bold hover:text-[#f0d88a] ${active ? 'text-[#d6b45c]' : 'text-white'}`}>{track.title}</button>
        <p className="truncate text-xs text-slate-400 mt-1">{track.artist}</p>
        <div className="flex items-center justify-between gap-2 mt-3 text-[10px] text-slate-500">
          <span>{track.genre || 'DJ Caspian'}</span><span>{fmt(track.duration)}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 border-t border-white/[.06] mt-3 pt-2">
        <button type="button" onClick={() => onToggleLike(track.id)} aria-label="پسندیدن" className={`p-2 rounded-lg hover:bg-white/[.06] ${liked ? 'text-[#d6b45c]' : 'text-slate-500 hover:text-white'}`}><Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} /></button>
        <button type="button" onClick={() => onQueueTrack(track)} aria-label="افزودن به صف پخش" className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/[.06]"><ListPlus className="w-4 h-4" /></button>
        <button type="button" onClick={() => onDownloadTrack(track)} aria-label="دانلود" className="p-2 rounded-lg text-slate-500 hover:text-[#d6b45c] hover:bg-white/[.06]">{isUserVip ? <Download className="w-4 h-4" /> : <Crown className="w-4 h-4" />}</button>
        <span className="mr-auto text-[10px] text-slate-600 font-mono">#{String(index + 1).padStart(2, '0')}</span>
      </div>
    </article>;
  };

  return <div className="dc-home space-y-9 sm:space-y-12 p-4 sm:p-7 lg:p-9 animate-in fade-in duration-500" dir="rtl">
    <section className="dc-hero relative overflow-hidden rounded-[2rem] min-h-[360px] sm:min-h-[430px] flex items-end">
      <div className="absolute inset-0">
        <img src={DJ_CASPIAN_INFO.bannerUrl} alt="" className="w-full h-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-l from-[#05080e] via-[#07111e]/75 to-[#05080e]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05080e] via-transparent to-[#05080e]/20" />
      </div>
      <div className="absolute -left-20 -top-24 w-80 h-80 rounded-full bg-[#1d5a91]/20 blur-[100px]" />
      <div className="relative z-10 w-full p-6 sm:p-10 lg:p-12">
        <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold tracking-[.24em] text-[#f0d88a] mb-5"><AudioLines className="w-4 h-4" /> DJ CASPIAN • OFFICIAL MUSIC HUB</div>
        <div className="flex flex-col sm:flex-row sm:items-end gap-6">
          <img src={DJ_CASPIAN_INFO.avatarUrl} alt="DJ Caspian" className="w-24 h-24 sm:w-36 sm:h-36 rounded-2xl object-cover border border-[#d6b45c]/50 shadow-2xl shadow-black/50" />
          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#d6b45c]/25 bg-black/30 px-3 py-1 text-[10px] text-[#f0d88a] mb-3"><CheckCircle2 className="w-3 h-3" /> آرتیست رسمی</div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white">{DJ_CASPIAN_INFO.name}</h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mt-3 leading-7">{DJ_CASPIAN_INFO.tagline}</p>
            <div className="flex flex-wrap gap-4 text-xs text-slate-400 mt-4"><span>{DJ_CASPIAN_INFO.monthlyListeners} شنونده ماهانه</span><span>{DJ_CASPIAN_INFO.followers} دنبال‌کننده</span><span>{tracks.length} قطعه منتشرشده</span></div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {featured && playButton(featured, true)}
            <button type="button" onClick={onNavigateToSupport} className="inline-flex items-center gap-2 rounded-full border border-[#d6b45c]/40 bg-black/35 px-5 py-3 text-xs font-bold text-[#f0d88a] hover:bg-[#d6b45c] hover:text-black transition-all"><Crown className="w-4 h-4" /> حمایت از کاسپین</button>
          </div>
        </div>
      </div>
    </section>

    {recent.length > 0 && <section>{sectionTitle('ادامه گوش دادن', 'برگرد به موسیقی‌هایی که اخیراً پخش کرده‌ای')}<div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">{recent.slice(0,4).map((track,i)=><button key={track.id} type="button" onClick={()=>onPlayTrack(track)} className="dc-quick-card flex items-center gap-3 text-right rounded-xl overflow-hidden"><img src={track.coverUrl} alt="" className="w-16 h-16 object-cover shrink-0" /><span className="min-w-0 flex-1 py-2"><strong className="block truncate text-xs text-white">{track.title}</strong><small className="block truncate text-[10px] text-slate-400 mt-1">{track.artist}</small></span><span className="ml-3 text-[#d6b45c]">{currentTrackId===track.id&&isPlaying?<AudioLines className="w-4 h-4"/>:<Play className="w-4 h-4 fill-current"/>}</span></button>)}</div></section>}

    {tracks.length > 0 && <section>{sectionTitle('انتخاب‌شده برای تو', 'تازه‌ترین انتشارها از آرشیو رسمی DJ Caspian')}<div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">{tracks.slice(0,8).map(trackCard)}</div></section>}

    {albums.length > 0 && <section>{sectionTitle('آلبوم‌ها و مجموعه‌ها', 'همه قطعه‌ها در کنار هم، با حال‌وهوای خودشان')}<div className="flex gap-4 overflow-x-auto pb-3 dc-horizontal">{albums.map(album=><button key={album.key} type="button" onClick={()=>onPlayTrack(album.tracks[0])} className="dc-media-tile text-right shrink-0 w-36 sm:w-44"><div className="aspect-square rounded-2xl overflow-hidden mb-3 bg-[#101b29]">{album.cover?<img src={album.cover} alt={album.title} loading="lazy" className="w-full h-full object-cover"/>:<Disc3 className="w-full h-full p-10 text-[#d6b45c]"/>}</div><strong className="block text-sm text-white truncate">{album.title}</strong><span className="block text-xs text-slate-400 truncate mt-1">{album.artist} · {album.tracks.length} قطعه</span></button>)}</div></section>}

    {uniqueArtists.length > 0 && <section>{sectionTitle('هنرمندان', 'صداهایی که در آرشیو کاسپین حضور دارند')}<div className="flex gap-4 overflow-x-auto pb-3 dc-horizontal">{uniqueArtists.map((artist,i)=><button key={artist.artist || i} type="button" onClick={()=>{const first=tracks.find(t=>t.artist===artist.artist);if(first)onPlayTrack(first);}} className="dc-media-tile shrink-0 w-32 sm:w-40 text-center"><div className="aspect-square rounded-full overflow-hidden mb-3 mx-auto border border-white/10 bg-[#101b29]">{artist.coverUrl?<img src={artist.coverUrl} alt={artist.artist} loading="lazy" className="w-full h-full object-cover"/>:<Headphones className="w-full h-full p-9 text-[#d6b45c]"/>}</div><strong className="block text-sm text-white truncate">{artist.artist}</strong><span className="text-xs text-slate-500">هنرمند</span></button>)}</div></section>}

    {playlists.length > 0 && <section>{sectionTitle('پلی‌لیست‌های کاسپین', 'مجموعه‌هایی برای هر مود و هر لحظه')}<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">{playlists.slice(0,6).map(playlist=><button key={playlist.id} type="button" onClick={()=>onSelectPlaylist(playlist)} className="dc-quick-card flex items-center gap-3 rounded-2xl p-3 text-right"><img src={playlist.coverUrl} alt="" className="w-16 h-16 rounded-xl object-cover"/><span className="min-w-0 flex-1"><strong className="block text-sm text-white truncate">{playlist.title}</strong><small className="block text-xs text-slate-400 mt-1 truncate">{playlist.description || `${playlist.trackIds.length} قطعه`}</small></span><ArrowUpLeft className="w-4 h-4 text-[#d6b45c]"/></button>)}</div></section>}

    {tracks.length === 0 && <section className="dc-empty rounded-3xl p-12 text-center"><Radio className="w-12 h-12 mx-auto text-[#d6b45c] mb-4"/><h2 className="text-xl font-black text-white">آرشیو در حال آماده‌سازی است</h2><p className="text-sm text-slate-400 mt-2">به‌زودی موسیقی‌های تازه در اینجا منتشر می‌شوند.</p></section>}
    <section className="dc-support-strip rounded-2xl p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><div className="flex items-center gap-2 text-[#f0d88a] text-xs font-bold"><Sparkles className="w-4 h-4"/> CASPIAN VIP</div><h2 className="text-lg sm:text-xl font-black text-white mt-2">تجربه کامل موسیقی با حمایت از هنرمند</h2><p className="text-xs text-slate-400 mt-1">حمایت امن و فعال‌سازی امکانات ویژه از طریق درگاه رسمی Donito</p></div><button type="button" onClick={onNavigateToSupport} className="rounded-full bg-[#d6b45c] px-6 py-3 text-xs font-black text-black hover:bg-[#f0d88a] transition-colors shrink-0">مشاهده روش‌های حمایت</button></section>
    <button type="button" onClick={onNavigateToAbout} className="mx-auto flex items-center gap-2 text-xs text-slate-500 hover:text-[#d6b45c] transition-colors"><Clock3 className="w-3.5 h-3.5"/> درباره DJ Caspian و شبکه‌های رسمی</button>
  </div>;
};
