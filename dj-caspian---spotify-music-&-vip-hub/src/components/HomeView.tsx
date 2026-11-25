import React from 'react';
import {
  Play, Pause, Heart, Download, Crown, Sparkles, ListPlus,
  CheckCircle2, Music2, Disc3, Headphones, ArrowUpLeft,
  Radio, AudioLines, ArrowLeft, Waves, Zap, Clock3
} from 'lucide-react';
import { Track, Playlist } from '../types';
import { UpcomingRelease } from './UpcomingRelease';
import { TrackShareButton } from './TrackShareButton';
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
    return <button type="button" onClick={() => onPlayTrack(track)} aria-label={active ? 'توقف پخش' : 'پخش'} className={`dc3-play ${large ? 'dc3-play-large' : ''}`}>
      {active ? <Pause className="fill-current" /> : <Play className="fill-current" />}
    </button>;
  };

  const heading = (eyebrow: string, title: string, subtitle?: string) => (
    <div className="dc3-section-heading">
      <div><span className="dc3-eyebrow">{eyebrow}</span><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
    </div>
  );

  const trackCard = (track: Track, index: number) => {
    const active = currentTrackId === track.id && isPlaying;
    const liked = likedTrackIds.includes(track.id);
    return <article key={track.id} className="dc3-track">
      <div className="dc3-track-art">
        {track.coverUrl ? <img src={track.coverUrl} alt={track.title} loading="lazy" /> : <Disc3 />}
        {track.isVipOnlyDownload && <span className="dc3-vip-tag"><Crown /> VIP</span>}
        <div className="dc3-track-play">{playButton(track)}</div>
        <span className="dc3-track-index">{String(index + 1).padStart(2, '0')}</span>
      </div>
      <div className="dc3-track-meta">
        <button type="button" onClick={() => onPlayTrack(track)} className={active ? 'is-active' : ''}>{track.title}</button>
        <span>{track.artist}</span>
        <div className="dc3-track-sub"><span>{track.genre || 'DJ CASPIAN'}</span><span>{fmt(track.duration)}</span></div>
      </div>
      <div className="dc3-track-actions">
        <TrackShareButton title={track.title} artist={track.artist} coverUrl={track.coverUrl} />
        <button type="button" onClick={() => onToggleLike(track.id)} aria-label="پسندیدن" className={liked ? 'is-liked' : ''}><Heart className={liked ? 'fill-current' : ''}/></button>
        <button type="button" onClick={() => onQueueTrack(track)} aria-label="افزودن به صف"><ListPlus /></button>
        <button type="button" onClick={() => onDownloadTrack(track)} aria-label="دانلود">{isUserVip ? <Download /> : <Crown />}</button>
      </div>
    </article>;
  };

  return <div className="dc3-home" dir="rtl">
    <section className="dc3-hero">
      <div className="dc3-hero-image">
        <img src={DJ_CASPIAN_INFO.bannerUrl} alt="" />
        <div className="dc3-hero-shade" />
      </div>
      <div className="dc3-hero-orbit dc3-orbit-one" /><div className="dc3-hero-orbit dc3-orbit-two" />
      <div className="dc3-hero-content">
        <div className="dc3-kicker"><span className="dc3-live-dot" /> OFFICIAL MUSIC UNIVERSE <span className="dc3-kicker-line" /></div>
        <div className="dc3-hero-title-row">
          <div className="dc3-brand-mark"><img src={DJ_CASPIAN_INFO.avatarUrl} alt="DJ Caspian" /></div>
          <div className="dc3-hero-copy">
            <div className="dc3-overline">SOUND • ENERGY • IDENTITY</div>
            <h1>DJ <span>CASPIAN</span></h1>
            <p>{DJ_CASPIAN_INFO.tagline}</p>
          </div>
        </div>
        <div className="dc3-hero-bottom">
          <div className="dc3-hero-actions">
            {featured ? playButton(featured, true) : <button type="button" className="dc3-hero-cta" onClick={onNavigateToAbout}><Headphones /> آشنایی با کاسپین</button>}
            <button type="button" className="dc3-outline-cta" onClick={onNavigateToSupport}><Crown /> حمایت از پروژه</button>
            <button type="button" className="dc3-text-cta" onClick={onNavigateToAbout}>درباره ما <ArrowLeft /></button>
          </div>
          <div className="dc3-hero-stats"><div><strong>{tracks.length.toLocaleString('fa-IR')}</strong><span>قطعه در آرشیو</span></div><i /><div><strong>{playlists.length.toLocaleString('fa-IR')}</strong><span>پلی‌لیست عمومی</span></div><i /><div><strong>24/7</strong><span>دسترسی آنلاین</span></div></div>
        </div>
      </div>
      <div className="dc3-hero-watermark">CASPIAN</div>
      <div className="dc3-hero-corner">EST. DJ CASPIAN</div>
    </section>

    <div className="dc3-content">
      <UpcomingRelease />
      <div className="dc3-shortcuts">
        <button type="button" onClick={onNavigateToAbout}><span className="dc3-shortcut-icon"><Waves /></span><span><b>دنیای کاسپین</b><small>درباره و شبکه‌های رسمی</small></span><ArrowUpLeft /></button>
        <button type="button" onClick={onNavigateToSupport}><span className="dc3-shortcut-icon gold"><Crown /></span><span><b>حمایت و VIP</b><small>پشتیبانی از مسیر رسمی Donito</small></span><ArrowUpLeft /></button>
        <div className="dc3-shortcut-note"><Zap /><span>YOUR SOUNDTRACK<br/><b>YOUR MOMENT</b></span></div>
      </div>

      {featured && <section className="dc3-featured">
        <div className="dc3-featured-art"><img src={featured.coverUrl} alt={featured.title}/><div className="dc3-featured-glow"/><span>FEATURED SOUND</span></div>
        <div className="dc3-featured-copy"><span className="dc3-eyebrow">THE CASPIAN SPOTLIGHT</span><h2>صدای بعدی<br/><em>از کاسپین</em></h2><p>انتخاب اول از آرشیو موسیقی DJ CASPIAN. پلی کن و وارد حال‌وهوای خودت شو.</p><div className="dc3-featured-track"><b>{featured.title}</b><span>{featured.artist} · {fmt(featured.duration)}</span></div><div className="dc3-featured-actions">{playButton(featured, true)}<button type="button" onClick={() => onToggleLike(featured.id)}><Heart className={likedTrackIds.includes(featured.id) ? 'fill-current' : ''}/>{likedTrackIds.includes(featured.id) ? 'پسندیده‌شده' : 'افزودن به علاقه‌مندی'}</button><TrackShareButton title={featured.title} artist={featured.artist} coverUrl={featured.coverUrl} /></div></div>
      </section>}

      {recent.length > 0 && <section className="dc3-section">{heading('PICK UP WHERE YOU LEFT OFF','ادامه شنیدن','موسیقی‌هایی که اخیراً سراغشان رفته‌ای')}<div className="dc3-recent-grid">{recent.slice(0,4).map((track,i)=><button key={track.id} type="button" onClick={()=>onPlayTrack(track)} className="dc3-recent"><img src={track.coverUrl} alt=""/><span><b>{track.title}</b><small>{track.artist}</small></span><span className="dc3-recent-play">{currentTrackId===track.id&&isPlaying?<AudioLines/>:<Play className="fill-current"/>}</span></button>)}</div></section>}

      {tracks.length > 0 && <section className="dc3-section">{heading('FRESH FROM THE STUDIO','تازه‌های آرشیو','قطعه‌هایی که ارزش شنیدن دوباره دارند')}<div className="dc3-track-grid">{tracks.slice(0,8).map(trackCard)}</div></section>}

      {albums.length > 0 && <section className="dc3-section">{heading('CURATED COLLECTIONS','آلبوم‌ها و مجموعه‌ها','هر مجموعه، یک فضای متفاوت')}<div className="dc3-horizontal">{albums.map(album=><button key={album.key} type="button" onClick={()=>onPlayTrack(album.tracks[0])} className="dc3-collection"><div className="dc3-collection-art">{album.cover?<img src={album.cover} alt={album.title}/>:<Disc3/>}<span><Play className="fill-current"/></span></div><b>{album.title}</b><small>{album.artist} · {album.tracks.length} قطعه</small></button>)}</div></section>}

      {uniqueArtists.length > 0 && <section className="dc3-section">{heading('THE ARTISTS','هنرمندان','صداهایی که در آرشیو کاسپین حضور دارند')}<div className="dc3-horizontal">{uniqueArtists.map((artist,i)=><button key={artist.artist || i} type="button" onClick={()=>{const first=tracks.find(t=>t.artist===artist.artist);if(first)onPlayTrack(first);}} className="dc3-artist"><div>{artist.coverUrl?<img src={artist.coverUrl} alt={artist.artist}/>:<Headphones/>}</div><b>{artist.artist}</b><small>هنرمند</small></button>)}</div></section>}

      {playlists.length > 0 && <section className="dc3-section">{heading('MADE FOR YOUR MOOD','پلی‌لیست‌های کاسپین','مجموعه‌هایی برای هر مود و هر لحظه')}<div className="dc3-playlist-grid">{playlists.slice(0,6).map(playlist=><button key={playlist.id} type="button" onClick={()=>onSelectPlaylist(playlist)} className="dc3-playlist"><img src={playlist.coverUrl} alt=""/><span><b>{playlist.title}</b><small>{playlist.description || `${playlist.trackIds.length} قطعه`}</small></span><ArrowUpLeft/></button>)}</div></section>}

      {tracks.length === 0 && <section className="dc3-empty"><Radio/><span className="dc3-eyebrow">NEW SOUNDS ARE COMING</span><h2>آرشیو در حال آماده‌سازی است</h2><p>به‌زودی موسیقی‌های تازه در اینجا منتشر می‌شوند.</p></section>}

      <section className="dc3-support"><div className="dc3-support-symbol"><Crown/></div><div><span className="dc3-eyebrow">JOIN THE INNER CIRCLE</span><h2>کاسپین با حمایت تو قوی‌تر می‌شود.</h2><p>اگر از موسیقی‌ها لذت می‌بری، از پروژه حمایت کن و از امکانات VIP باخبر شو.</p></div><button type="button" onClick={onNavigateToSupport}>ورود به بخش حمایت <ArrowLeft/></button></section>
      <button type="button" onClick={onNavigateToAbout} className="dc3-about-link"><Music2/> درباره DJ CASPIAN و راه‌های ارتباطی رسمی</button>
      <div className="dc3-footer-mark">DJ CASPIAN <span>•</span> MADE FOR THE MOMENT</div>
    </div>
  </div>;
};
