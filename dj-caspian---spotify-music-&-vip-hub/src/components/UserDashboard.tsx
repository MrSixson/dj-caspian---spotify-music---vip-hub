import React, { useMemo, useState } from 'react';
import {
  User, Crown, Heart, ListMusic, Download, LogOut, Plus, Play, Pause,
  Trash2, Shield, Sparkles, Settings, Save, Music, Search, Headphones,
  Disc3, Clock3, ArrowUpRight, X, Check, LockKeyhole, Mail, CalendarDays,
  AudioWaveform, CircleUserRound, HardDriveDownload
} from 'lucide-react';
import type { UserAccount, Track, Playlist, VipTicket } from '../types';
import { OfflineLibrary } from './OfflineLibrary';

interface UserDashboardProps {
  user: UserAccount;
  allTracks: Track[];
  tickets: VipTicket[];
  currentTrackId: string | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
  onToggleLike: (trackId: string) => void;
  onDownloadTrack: (track: Track) => void;
  onNavigateToSupport: () => void;
  onNavigateToAdmin?: () => void;
  onLogout: () => void;
  onUpdateUser: (updatedUser: UserAccount) => void;
}

type DashboardTab = 'overview' | 'liked' | 'playlists' | 'offline' | 'settings';

const formatDate = (value?: string) => {
  if (!value) return 'عضو کاسپین';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
};

export const UserDashboard: React.FC<UserDashboardProps> = ({
  user, allTracks, tickets, currentTrackId, isPlaying, onPlayTrack,
  onToggleLike, onDownloadTrack, onNavigateToSupport, onNavigateToAdmin,
  onLogout, onUpdateUser,
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [query, setQuery] = useState('');
  const [isNewPlaylistOpen, setIsNewPlaylistOpen] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [editDisplayName, setEditDisplayName] = useState(user.displayName);
  const [savedNotice, setSavedNotice] = useState(false);

  // Ticket data is currently supplied only to the admin workspace, not regular accounts.
  void tickets;

  const likedTracks = useMemo(
    () => allTracks.filter((track) => user.likedTrackIds.includes(track.id)),
    [allTracks, user.likedTrackIds],
  );
  const filteredLikedTracks = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    if (!needle) return likedTracks;
    return likedTracks.filter((track) =>
      [track.title, track.artist, track.album, track.genre].some((value) =>
        value?.toLocaleLowerCase().includes(needle),
      ),
    );
  }, [likedTracks, query]);

  const playlists = user.customPlaylists || [];
  const totalMinutes = Math.round(likedTracks.reduce((sum, track) => sum + (track.duration || 0), 0) / 60);
  const initials = (user.displayName || user.username || 'DJ').trim().slice(0, 2).toUpperCase();

  const createPlaylist = (event: React.FormEvent) => {
    event.preventDefault();
    const title = newPlaylistTitle.trim();
    if (!title) return;
    const playlist: Playlist = {
      id: 'pl-user-' + Date.now(),
      title,
      description: newPlaylistDesc.trim() || 'مجموعه شخصی من در DJ CASPIAN',
      coverUrl: likedTracks[0]?.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=700&auto=format&fit=crop&q=85',
      trackIds: likedTracks.slice(0, 4).map((track) => track.id),
    };
    onUpdateUser({ ...user, customPlaylists: [...playlists, playlist] });
    setNewPlaylistTitle('');
    setNewPlaylistDesc('');
    setIsNewPlaylistOpen(false);
    setActiveTab('playlists');
  };

  const deletePlaylist = (id: string) => {
    onUpdateUser({ ...user, customPlaylists: playlists.filter((playlist) => playlist.id !== id) });
  };

  const saveDisplayName = () => {
    const displayName = editDisplayName.trim();
    if (!displayName) return;
    onUpdateUser({ ...user, displayName });
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 2600);
  };

  const tabs: { id: DashboardTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'نمای کلی', icon: <AudioWaveform /> },
    { id: 'liked', label: 'علاقه‌مندی‌ها', icon: <Heart /> },
    { id: 'playlists', label: 'پلی‌لیست‌های من', icon: <ListMusic /> },
    { id: 'offline', label: 'آفلاین', icon: <HardDriveDownload /> },
    { id: 'settings', label: 'حساب کاربری', icon: <Settings /> },
  ];

  return (
    <main className="dc-account" dir="rtl">
      <div className="dc-account-ambient" aria-hidden="true" />
      <div className="dc-account-inner">
        <header className="dc-account-topline">
          <div className="dc-account-breadcrumb"><span>DJ CASPIAN</span><i /> <span>فضای کاربری</span></div>
          <div className="dc-account-live"><span /> پنل شخصی شما</div>
        </header>

        <section className="dc-account-hero">
          <div className="dc-account-hero-grid" aria-hidden="true" />
          <div className="dc-account-orbit dc-account-orbit-one" aria-hidden="true" />
          <div className="dc-account-orbit dc-account-orbit-two" aria-hidden="true" />
          <div className="dc-account-hero-main">
            <div className="dc-account-avatar-wrap">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.displayName} className="dc-account-avatar" />
              ) : (
                <div className="dc-account-avatar dc-account-avatar-fallback">{initials}</div>
              )}
              <span className="dc-account-avatar-status" title="حساب فعال" />
              {user.isVip && <span className="dc-account-avatar-crown"><Crown /></span>}
            </div>
            <div className="dc-account-identity">
              <div className="dc-account-eyebrow"><Sparkles /> PERSONAL MUSIC SPACE</div>
              <h1>{user.displayName || user.username}</h1>
              <div className="dc-account-userline" dir="ltr">@{user.username}</div>
              <div className="dc-account-badges">
                {user.role === 'admin' ? (
                  <span className="dc-account-badge admin"><Shield /> مدیر سیستم</span>
                ) : user.isVip ? (
                  <span className="dc-account-badge vip"><Crown /> عضو طلایی VIP</span>
                ) : (
                  <span className="dc-account-badge member"><User /> عضو کاسپین</span>
                )}
                <span className="dc-account-member-since"><CalendarDays /> عضویت: {formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="dc-account-hero-actions">
            {user.role === 'admin' && onNavigateToAdmin && (
              <button className="dc-account-button gold" onClick={onNavigateToAdmin}><Shield /> پنل مدیریت <ArrowUpRight /></button>
            )}
            {!user.isVip && (
              <button className="dc-account-button vip-cta" onClick={onNavigateToSupport}><Crown /> ارتقای حساب به VIP <ArrowUpRight /></button>
            )}
            <button className="dc-account-button ghost" onClick={onLogout}><LogOut /> خروج از حساب</button>
          </div>
          <div className="dc-account-hero-foot">
            <span><LockKeyhole /> نشست امن حساب</span>
            <span>YOUR SOUND. YOUR SPACE.</span>
          </div>
        </section>

        <section className="dc-account-stats" aria-label="آمار حساب">
          <article className="dc-account-stat">
            <span className="dc-account-stat-icon rose"><Heart /></span>
            <div><strong>{likedTracks.length.toLocaleString('fa-IR')}</strong><small>آهنگ مورد علاقه</small></div>
            <span className="dc-account-stat-foot">مجموع لایک‌ها</span>
          </article>
          <article className="dc-account-stat">
            <span className="dc-account-stat-icon gold"><ListMusic /></span>
            <div><strong>{playlists.length.toLocaleString('fa-IR')}</strong><small>پلی‌لیست شخصی</small></div>
            <span className="dc-account-stat-foot">مجموع مجموعه‌ها</span>
          </article>
          <article className="dc-account-stat">
            <span className="dc-account-stat-icon blue"><Clock3 /></span>
            <div><strong>{totalMinutes.toLocaleString('fa-IR')} <em>دقیقه</em></strong><small>مدت آهنگ‌های لایک‌شده</small></div>
            <span className="dc-account-stat-foot">زمان تقریبی موسیقی</span>
          </article>
          <article className="dc-account-stat">
            <span className="dc-account-stat-icon green"><Download /></span>
            <div><strong>{(user.downloadCount || 0).toLocaleString('fa-IR')}</strong><small>دانلود انجام‌شده</small></div>
            <span className="dc-account-stat-foot">{user.isVip ? 'دسترسی دانلود VIP' : 'دانلود ویژه با VIP'}</span>
          </article>
        </section>

        <nav className="dc-account-tabs" aria-label="بخش‌های داشبورد">
          {tabs.map((tab) => (
            <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => { setActiveTab(tab.id); setQuery(''); }}>
              {tab.icon}<span>{tab.label}</span>
              {tab.id === 'liked' && <small>{likedTracks.length}</small>}
              {tab.id === 'playlists' && <small>{playlists.length}</small>}
            </button>
          ))}
        </nav>

        {activeTab === 'overview' && (
          <div className="dc-account-content">
            <div className="dc-account-section-heading">
              <div><span className="dc-account-kicker">YOUR DASHBOARD</span><h2>خلاصه فضای موسیقی تو</h2><p>همه چیزهایی که در کاسپین جمع کرده‌ای، یک‌جا.</p></div>
              <button className="dc-account-text-link" onClick={() => setActiveTab('liked')}>همه علاقه‌مندی‌ها <ArrowUpRight /></button>
            </div>
            <div className="dc-account-overview-grid">
              <article className="dc-account-feature-card">
                <div className="dc-account-feature-art"><Disc3 /><span>YOUR COLLECTION</span></div>
                <div className="dc-account-feature-copy"><span className="dc-account-kicker">مجموعه شخصی</span><h3>موسیقی‌هایی که انتخاب کردی</h3><p>{likedTracks.length ? `تاکنون ${likedTracks.length} آهنگ را به علاقه‌مندی‌ها اضافه کرده‌ای.` : 'هنوز مجموعه‌ات را نساخته‌ای. از صفحه موسیقی قلب آهنگ‌ها را بزن تا اینجا جمع شوند.'}</p><button onClick={() => setActiveTab('liked')}>مشاهده مجموعه <ArrowUpRight /></button></div>
              </article>
              <article className="dc-account-vip-card">
                <div className="dc-account-vip-icon"><Crown /></div>
                <span className="dc-account-kicker">CASPIAN MEMBERSHIP</span>
                <h3>{user.isVip ? 'دسترسی طلایی فعال است' : 'تجربه کامل‌تر با VIP'}</h3>
                <p>{user.isVip ? 'حساب تو به امکانات ویژه دانلود دسترسی دارد.' : 'با عضویت VIP به دانلودهای ویژه و امکانات اختصاصی دسترسی پیدا کن.'}</p>
                <button onClick={onNavigateToSupport}>{user.isVip ? 'مشاهده حمایت‌ها' : 'بررسی عضویت VIP'} <ArrowUpRight /></button>
              </article>
            </div>
            <div className="dc-account-section-heading compact">
              <div><span className="dc-account-kicker">RECENT FAVORITES</span><h2>آخرین انتخاب‌ها</h2></div>
              {likedTracks.length > 0 && <button className="dc-account-text-link" onClick={() => setActiveTab('liked')}>نمایش همه <ArrowUpRight /></button>}
            </div>
            {likedTracks.length ? (
              <div className="dc-account-track-list">
                {likedTracks.slice(0, 4).map((track, index) => (
                  <TrackRow key={track.id} track={track} index={index} currentTrackId={currentTrackId} isPlaying={isPlaying} isVip={user.isVip} onPlayTrack={onPlayTrack} onToggleLike={onToggleLike} onDownloadTrack={onDownloadTrack} />
                ))}
              </div>
            ) : <EmptyState icon={<Heart />} title="هنوز انتخابی ثبت نشده" text="آهنگ‌های مورد علاقه‌ات را لایک کن تا مجموعه شخصی‌ات شکل بگیرد." action="رفتن به موسیقی" onAction={() => setActiveTab('liked')} />}
          </div>
        )}

        {activeTab === 'liked' && (
          <div className="dc-account-content">
            <div className="dc-account-section-heading">
              <div><span className="dc-account-kicker">SAVED MUSIC</span><h2>علاقه‌مندی‌های من</h2><p>{likedTracks.length} آهنگ در مجموعه شخصی تو</p></div>
              <div className="dc-account-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جستجو بین آهنگ‌ها..." aria-label="جستجو در علاقه‌مندی‌ها" /><kbd>⌕</kbd></div>
            </div>
            {filteredLikedTracks.length ? (
              <div className="dc-account-track-list">
                {filteredLikedTracks.map((track, index) => (
                  <TrackRow key={track.id} track={track} index={index} currentTrackId={currentTrackId} isPlaying={isPlaying} isVip={user.isVip} onPlayTrack={onPlayTrack} onToggleLike={onToggleLike} onDownloadTrack={onDownloadTrack} />
                ))}
              </div>
            ) : <EmptyState icon={<Search />} title={query ? 'نتیجه‌ای پیدا نشد' : 'لیست علاقه‌مندی‌ها خالی است'} text={query ? 'نام آهنگ، خواننده یا سبک دیگری را امتحان کن.' : 'از صفحه خانه یا جستجو، آهنگ‌ها را لایک کن تا اینجا نمایش داده شوند.'} action={query ? 'پاک کردن جستجو' : 'رفتن به نمای کلی'} onAction={() => query ? setQuery('') : setActiveTab('overview')} />}
          </div>
        )}

        {activeTab === 'playlists' && (
          <div className="dc-account-content">
            <div className="dc-account-section-heading">
              <div><span className="dc-account-kicker">YOUR MIXTAPES</span><h2>پلی‌لیست‌های اختصاصی</h2><p>موسیقی‌ها را برای حال‌وهوای خودت دسته‌بندی کن.</p></div>
              <button className="dc-account-button gold" onClick={() => setIsNewPlaylistOpen(true)}><Plus /> ساخت پلی‌لیست جدید</button>
            </div>
            {playlists.length ? (
              <div className="dc-account-playlist-grid">
                {playlists.map((playlist) => (
                  <article className="dc-account-playlist" key={playlist.id}>
                    <div className="dc-account-playlist-art"><img src={playlist.coverUrl} alt={playlist.title} /><span><Music /></span></div>
                    <div className="dc-account-playlist-info"><div><h3>{playlist.title}</h3><button onClick={() => deletePlaylist(playlist.id)} title="حذف پلی‌لیست" aria-label={`حذف ${playlist.title}`}><Trash2 /></button></div><p>{playlist.description}</p><small><Music /> {playlist.trackIds.length.toLocaleString('fa-IR')} قطعه</small></div>
                  </article>
                ))}
              </div>
            ) : <EmptyState icon={<ListMusic />} title="اولین پلی‌لیستت را بساز" text="برای ماشین، باشگاه، مهمانی یا هر حال‌وهوایی یک مجموعه اختصاصی درست کن." action="ساخت پلی‌لیست" onAction={() => setIsNewPlaylistOpen(true)} />}
          </div>
        )}

        {activeTab === 'offline' && <div className="dc-account-content"><OfflineLibrary user={user} tracks={allTracks} onPlayTrack={onPlayTrack} /></div>}

        {activeTab === 'settings' && (
          <div className="dc-account-content">
            <div className="dc-account-section-heading"><div><span className="dc-account-kicker">ACCOUNT CONTROL</span><h2>تنظیمات حساب</h2><p>اطلاعات نمایشی و وضعیت حساب کاربری.</p></div></div>
            <div className="dc-account-settings-grid">
              <section className="dc-account-settings-card">
                <div className="dc-account-settings-title"><CircleUserRound /><div><h3>اطلاعات پروفایل</h3><p>نام نمایشی حساب خود را مدیریت کن.</p></div></div>
                <label>نام کاربری</label><div className="dc-account-readonly" dir="ltr">@{user.username}</div>
                <label htmlFor="dc-display-name">نام نمایشی</label><input id="dc-display-name" value={editDisplayName} onChange={(event) => setEditDisplayName(event.target.value)} maxLength={48} />
                <label>ایمیل حساب</label><div className="dc-account-readonly" dir="ltr"><Mail />{user.email || 'ایمیلی ثبت نشده'}</div>
                <p className="dc-account-field-note">تغییر ایمیل ورود نیازمند فرایند تأیید جداگانه است و از این بخش انجام نمی‌شود.</p>
                <button className="dc-account-button gold" onClick={saveDisplayName}><Save /> ذخیره نام نمایشی</button>
                {savedNotice && <span className="dc-account-saved"><Check /> تغییر در نشست فعلی اعمال شد.</span>}
              </section>
              <section className="dc-account-settings-card dc-account-security-card">
                <div className="dc-account-settings-title"><Shield /><div><h3>وضعیت حساب</h3><p>نمای کلی دسترسی‌های فعلی.</p></div></div>
                <div className="dc-account-security-row"><span>سطح دسترسی</span><b>{user.role === 'admin' ? 'مدیر' : user.isVip ? 'VIP' : 'رایگان'}</b></div>
                <div className="dc-account-security-row"><span>وضعیت اشتراک</span><b className={user.isVip ? 'is-active' : ''}>{user.isVip ? 'فعال' : 'عادی'}</b></div>
                <div className="dc-account-security-row"><span>شناسه حساب</span><code>{user.id.slice(0, 8)}…</code></div>
                <div className="dc-account-security-note"><LockKeyhole /><span>برای امنیت حساب، رمز عبور را در اختیار هیچ‌کس قرار نده و پس از استفاده از دستگاه عمومی خارج شو.</span></div>
                <button className="dc-account-button danger" onClick={onLogout}><LogOut /> خروج امن از حساب</button>
              </section>
            </div>
          </div>
        )}
        <footer className="dc-account-footer"><span>DJ CASPIAN <i>✦</i> PERSONAL SPACE</span><span>BUILT FOR THE LOVE OF MUSIC</span></footer>
      </div>

      {isNewPlaylistOpen && (
        <div className="dc-account-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsNewPlaylistOpen(false); }}>
          <section className="dc-account-modal" role="dialog" aria-modal="true" aria-labelledby="dc-playlist-title">
            <button className="dc-account-modal-close" onClick={() => setIsNewPlaylistOpen(false)} aria-label="بستن"><X /></button>
            <span className="dc-account-modal-icon"><ListMusic /></span>
            <span className="dc-account-kicker">CREATE YOUR MIXTAPE</span>
            <h2 id="dc-playlist-title">پلی‌لیست تازه بساز</h2>
            <p>یک اسم انتخاب کن و مجموعه شخصی خودت را شکل بده.</p>
            <form onSubmit={createPlaylist}>
              <label htmlFor="dc-playlist-name">نام پلی‌لیست</label>
              <input id="dc-playlist-name" autoFocus required maxLength={60} value={newPlaylistTitle} onChange={(event) => setNewPlaylistTitle(event.target.value)} placeholder="مثلاً رانندگی نیمه‌شب" />
              <label htmlFor="dc-playlist-desc">توضیحات <small>(اختیاری)</small></label>
              <textarea id="dc-playlist-desc" rows={3} maxLength={180} value={newPlaylistDesc} onChange={(event) => setNewPlaylistDesc(event.target.value)} placeholder="حال‌وهوای این پلی‌لیست..." />
              <div className="dc-account-modal-actions"><button type="button" className="dc-account-button ghost" onClick={() => setIsNewPlaylistOpen(false)}>انصراف</button><button type="submit" className="dc-account-button gold"><Plus /> ایجاد پلی‌لیست</button></div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
};

function TrackRow({ track, index, currentTrackId, isPlaying, isVip, onPlayTrack, onToggleLike, onDownloadTrack }: {
  track: Track; index: number; currentTrackId: string | null; isPlaying: boolean; isVip: boolean;
  onPlayTrack: (track: Track) => void; onToggleLike: (id: string) => void; onDownloadTrack: (track: Track) => void;
}) {
  const isCurrent = currentTrackId === track.id;
  return (
    <article className={`dc-account-track ${isCurrent ? 'is-current' : ''}`}>
      <span className="dc-account-track-number">{(index + 1).toString().padStart(2, '0')}</span>
      <img src={track.coverUrl} alt={track.title} loading="lazy" />
      <div className="dc-account-track-info"><strong>{track.title}</strong><span>{track.artist} <i>•</i> {track.genre || track.album}</span></div>
      <span className="dc-account-track-bpm">{track.bpm ? `${track.bpm} BPM` : 'DJ CASPIAN'}</span>
      <button className="dc-account-track-play" onClick={() => onPlayTrack(track)} aria-label={isCurrent && isPlaying ? 'توقف' : 'پخش'}>{isCurrent && isPlaying ? <Pause /> : <Play />}</button>
      <button className={`dc-account-track-like ${!isCurrent ? '' : 'active'}`} onClick={() => onToggleLike(track.id)} aria-label="حذف از علاقه‌مندی‌ها"><Heart /></button>
      <button className={`dc-account-track-download ${isVip ? 'vip' : ''}`} onClick={() => onDownloadTrack(track)} title={isVip ? 'دانلود آهنگ' : 'دانلود ویژه VIP'}><Download /><span>{isVip ? 'دانلود' : 'VIP'}</span></button>
    </article>
  );
}

function EmptyState({ icon, title, text, action, onAction }: { icon: React.ReactNode; title: string; text: string; action: string; onAction: () => void }) {
  return <div className="dc-account-empty"><span>{icon}</span><h3>{title}</h3><p>{text}</p><button onClick={onAction}>{action}<ArrowUpRight /></button></div>;
}
