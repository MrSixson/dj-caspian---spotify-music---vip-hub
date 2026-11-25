import React from 'react';
import { Heart, Music, Play, Pause, Download, Crown, Disc3, Plus, Trash2, X, ListMusic, Check } from 'lucide-react';
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
  onCreatePlaylist?: (title: string, description: string) => void;
  onDeletePersonalPlaylist?: (playlistId: string) => void;
  onAddTrackToPlaylist?: (playlistId: string, trackId: string) => void;
  onRemoveTrackFromPlaylist?: (playlistId: string, trackId: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  tracks, playlists, likedTrackIds, currentTrackId, isPlaying, isUserVip,
  onPlayTrack, onToggleLike, onDownloadTrack, onSelectPlaylist,
  filterLikedOnly = false, selectedPlaylist = null, onBackFromPlaylist,
  onCreatePlaylist, onDeletePersonalPlaylist, onAddTrackToPlaylist, onRemoveTrackFromPlaylist,
}) => {
  const [isCreating, setIsCreating] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState('');
  const [newDescription, setNewDescription] = React.useState('');
  const displayedTracks = filterLikedOnly ? tracks.filter(t => likedTrackIds.includes(t.id)) : tracks;
  const isPersonal = Boolean(selectedPlaylist?.id.startsWith('personal:'));

  const submitPlaylist = (event: React.FormEvent) => {
    event.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    onCreatePlaylist?.(title, newDescription.trim());
    setNewTitle('');
    setNewDescription('');
    setIsCreating(false);
  };

  const trackRow = (track: Track, index: number, removable = false) => (
    <div key={track.id} className="flex items-center gap-3 p-3 hover:bg-white/[.045] border-b border-white/[.045] last:border-0 group">
      <span className="w-6 text-center text-xs text-slate-600">{index + 1}</span>
      <img src={track.coverUrl} alt="" className="w-11 h-11 rounded-lg object-cover shrink-0 bg-[#101b29]" />
      <button type="button" onClick={() => onPlayTrack(track)} className="min-w-0 flex-1 text-right">
        <span className={`block text-sm font-bold truncate ${currentTrackId===track.id&&isPlaying?'text-[#d6b45c]':'text-white'}`}>{track.title}</span>
        <span className="block text-xs text-slate-500 truncate mt-1">{track.artist} · {track.genre}</span>
      </button>
      <span className="hidden sm:block text-[10px] text-slate-600 font-mono">{Math.floor(track.duration/60)}:{String(track.duration%60).padStart(2,'0')}</span>
      <button type="button" onClick={() => onToggleLike(track.id)} aria-label="پسندیدن" className={`p-2 rounded-lg hover:bg-white/5 ${likedTrackIds.includes(track.id)?'text-[#d6b45c]':'text-slate-500 hover:text-white'}`}><Heart className={`w-4 h-4 ${likedTrackIds.includes(track.id)?'fill-current':''}`} /></button>
      <button type="button" onClick={() => onDownloadTrack(track)} aria-label="دانلود" className="p-2 rounded-lg text-slate-500 hover:text-[#d6b45c]">{isUserVip ? <Download className="w-4 h-4"/> : <Crown className="w-4 h-4"/>}</button>
      {removable && <button type="button" onClick={() => selectedPlaylist && onRemoveTrackFromPlaylist?.(selectedPlaylist.id,track.id)} aria-label="حذف از پلی‌لیست" className="p-2 rounded-lg text-slate-600 hover:text-red-400"><X className="w-4 h-4"/></button>}
    </div>
  );

  if (selectedPlaylist && !filterLikedOnly) {
    const playlistTracks = selectedPlaylist.trackIds.map(id => tracks.find(t => t.id===id)).filter((t): t is Track => Boolean(t));
    const availableTracks = tracks.filter(t => !selectedPlaylist.trackIds.includes(t.id));
    return <div className="p-4 sm:p-8 space-y-6 animate-in fade-in duration-300" dir="rtl">
      <button type="button" onClick={onBackFromPlaylist} className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-[#d6b45c]"><span>→</span> بازگشت به کتابخانه</button>
      <section className="dc-library-hero rounded-3xl p-6 sm:p-9 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-2xl overflow-hidden shadow-2xl shrink-0 bg-[#101b29]">{selectedPlaylist.coverUrl?<img src={selectedPlaylist.coverUrl} alt={selectedPlaylist.title} className="w-full h-full object-cover"/>:<div className="w-full h-full flex items-center justify-center"><Disc3 className="w-14 h-14 text-[#d6b45c]"/></div>}</div>
        <div className="min-w-0 text-center sm:text-right flex-1">
          <span className="text-[10px] uppercase tracking-[.25em] text-[#f0d88a] font-bold">{isPersonal?'YOUR PLAYLIST':'DJ CASPIAN PLAYLIST'}</span>
          <h1 className="text-3xl sm:text-5xl font-black text-white mt-2">{selectedPlaylist.title}</h1>
          <p className="text-sm text-slate-300 mt-3 max-w-xl">{selectedPlaylist.description || 'مجموعه موسیقی منتخب شما'}</p>
          <p className="text-xs text-slate-400 mt-3">{playlistTracks.length} قطعه در این پلی‌لیست</p>
        </div>
        {playlistTracks[0] && <button type="button" onClick={()=>onPlayTrack(playlistTracks[0])} className="w-14 h-14 rounded-full bg-[#d6b45c] text-black flex items-center justify-center shadow-xl"><Play className="w-6 h-6 fill-current"/></button>}
      </section>
      {isPersonal && availableTracks.length > 0 && <section className="rounded-2xl border border-[#d6b45c]/20 bg-[#0b1522]/85 p-4">
        <div className="flex items-center gap-2 text-sm font-black text-white mb-3"><Plus className="w-4 h-4 text-[#d6b45c]"/> افزودن آهنگ به پلی‌لیست</div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {availableTracks.slice(0,8).map(track=><button key={track.id} type="button" onClick={()=>onAddTrackToPlaylist?.(selectedPlaylist.id,track.id)} className="shrink-0 flex items-center gap-2 rounded-xl bg-white/[.04] border border-white/[.07] p-2 hover:border-[#d6b45c]/40">
            <img src={track.coverUrl} alt="" className="w-9 h-9 rounded-lg object-cover"/><span className="max-w-28 text-right"><strong className="block text-[11px] text-white truncate">{track.title}</strong><small className="block text-[10px] text-slate-500 truncate">{track.artist}</small></span><Plus className="w-3.5 h-3.5 text-[#d6b45c]"/>
          </button>)}
        </div>
      </section>}
      {playlistTracks.length===0 ? <div className="rounded-2xl border border-white/10 bg-white/[.025] p-10 text-center text-sm text-slate-500">این پلی‌لیست هنوز آهنگی ندارد. از بخش افزودن آهنگ شروع کن.</div> : <div className="rounded-2xl border border-white/10 bg-[#091321]/70 overflow-hidden">{playlistTracks.map((track,index)=>trackRow(track,index,isPersonal))}</div>}
    </div>;
  }

  return <div className="p-4 sm:p-8 space-y-7 animate-in fade-in duration-300" dir="rtl">
    <section className="dc-library-hero rounded-3xl p-6 sm:p-8 flex items-center gap-4">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1b4772] to-[#101b29] flex items-center justify-center text-[#d6b45c] shadow-xl"><Heart className="w-9 h-9 fill-current"/></div>
      <div className="min-w-0 flex-1"><span className="text-[10px] font-bold tracking-[.2em] text-[#f0d88a]">{filterLikedOnly?'YOUR FAVORITES':'YOUR COLLECTION'}</span><h1 className="text-2xl sm:text-4xl font-black text-white mt-1">{filterLikedOnly?'آهنگ‌های لایک شده':'کتابخانه شما'}</h1><p className="text-xs text-slate-400 mt-1">{displayedTracks.length} آهنگ پسندیده‌شده · {playlists.length} پلی‌لیست</p></div>
      {!filterLikedOnly && <button type="button" onClick={()=>setIsCreating(v=>!v)} className="inline-flex items-center gap-2 rounded-full bg-[#d6b45c] px-4 py-2.5 text-xs font-black text-black hover:bg-[#f0d88a]"><Plus className="w-4 h-4"/> ساخت پلی‌لیست</button>}
    </section>

    {isCreating && !filterLikedOnly && <form onSubmit={submitPlaylist} className="rounded-2xl border border-[#d6b45c]/25 bg-[#0b1522]/90 p-5 space-y-3">
      <div className="flex items-center justify-between"><h2 className="font-black text-white">پلی‌لیست جدید</h2><button type="button" onClick={()=>setIsCreating(false)} className="text-slate-500 hover:text-white"><X className="w-4 h-4"/></button></div>
      <input value={newTitle} onChange={e=>setNewTitle(e.target.value)} required maxLength={60} placeholder="نام پلی‌لیست" className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[#d6b45c]/60"/>
      <input value={newDescription} onChange={e=>setNewDescription(e.target.value)} maxLength={160} placeholder="توضیح کوتاه (اختیاری)" className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[#d6b45c]/60"/>
      <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-[#d6b45c] px-5 py-2.5 text-xs font-black text-black"><Check className="w-4 h-4"/> ایجاد پلی‌لیست</button>
    </form>}

    {!filterLikedOnly && <section className="space-y-3">
      <div className="flex items-center justify-between"><h2 className="text-lg font-black text-white">پلی‌لیست‌های شما و کاسپین</h2><span className="text-[10px] text-slate-500">{playlists.length} مجموعه</span></div>
      {playlists.length===0 ? <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-500">هنوز پلی‌لیستی ساخته نشده است.</div> : <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {playlists.map(pl=><div key={pl.id} className="dc-quick-card flex items-center gap-3 rounded-2xl p-3">
          <button type="button" onClick={()=>onSelectPlaylist(pl)} className="min-w-0 flex-1 flex items-center gap-3 text-right"><img src={pl.coverUrl} alt="" className="w-14 h-14 rounded-xl object-cover bg-[#101b29]"/><span className="min-w-0"><strong className="block text-sm text-white truncate">{pl.title}</strong><small className="block text-[10px] text-slate-400 mt-1 truncate">{pl.trackIds.length} قطعه · {pl.id.startsWith('personal:')?'پلی‌لیست شخصی':'مجموعه رسمی'}</small></span></button>
          {pl.id.startsWith('personal:') && <button type="button" onClick={()=>onDeletePersonalPlaylist?.(pl.id)} aria-label="حذف پلی‌لیست" className="p-2 text-slate-600 hover:text-red-400"><Trash2 className="w-4 h-4"/></button>}
        </div>)}
      </div>}
    </section>}

    <section className="space-y-3">
      <div className="flex items-center justify-between"><h2 className="text-lg font-black text-white">{filterLikedOnly?'موردعلاقه‌های شما':'تمام آهنگ‌ها'}</h2><span className="text-[10px] text-slate-500">{displayedTracks.length} قطعه</span></div>
      {displayedTracks.length===0 ? <div className="rounded-2xl border border-white/10 bg-[#0b1522]/80 p-12 text-center space-y-2"><Music className="w-10 h-10 text-[#d6b45c] mx-auto"/><h3 className="text-white font-bold">هنوز آهنگی اینجا نیست</h3><p className="text-xs text-slate-500">با لایک‌کردن آهنگ‌ها، کتابخانه شخصی‌ات را بساز.</p></div> : <div className="rounded-2xl border border-white/10 bg-[#091321]/70 overflow-hidden">{displayedTracks.map((track,index)=>trackRow(track,index))}</div>}
    </section>
  </div>;
};
