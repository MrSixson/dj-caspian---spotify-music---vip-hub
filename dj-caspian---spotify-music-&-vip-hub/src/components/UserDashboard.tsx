import React, { useState } from 'react';
import { 
  User, Crown, Heart, ListMusic, Ticket, Download, 
  LogOut, Plus, Play, Pause, Trash2, CheckCircle2, 
  Clock, Shield, Sparkles, ExternalLink, Settings, Edit3, Save, Music
} from 'lucide-react';
import { UserAccount, Track, Playlist, VipTicket } from '../types';

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

export const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  allTracks,
  tickets,
  currentTrackId,
  isPlaying,
  onPlayTrack,
  onToggleLike,
  onDownloadTrack,
  onNavigateToSupport,
  onNavigateToAdmin,
  onLogout,
  onUpdateUser,
}) => {
  const [activeTab, setActiveTab] = useState<'liked' | 'playlists' | 'tickets' | 'settings'>('liked');

  // New Playlist Modal / State
  const [isNewPlaylistOpen, setIsNewPlaylistOpen] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');

  // Edit Profile State
  const [editDisplayName, setEditDisplayName] = useState(user.displayName);
  const [editEmail, setEditEmail] = useState(user.email || '');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Filter user's liked tracks
  const userLikedTracks = allTracks.filter((t) => user.likedTrackIds.includes(t.id));

  // Filter user's tickets (match by username, contact, or user ID)
  const userTickets = tickets.filter(
    (t) =>
      t.userName.toLowerCase() === user.displayName.toLowerCase() ||
      t.userName.toLowerCase() === user.username.toLowerCase() ||
      (user.email && t.userContact.toLowerCase().includes(user.email.toLowerCase()))
  );

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistTitle.trim()) return;

    const newPl: Playlist = {
      id: 'pl-user-' + Date.now(),
      title: newPlaylistTitle.trim(),
      description: newPlaylistDesc.trim() || 'پلی‌لیست شخصی ساخته شده توسط ' + user.displayName,
      coverUrl: userLikedTracks[0]?.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
      trackIds: user.likedTrackIds.slice(0, 4),
    };

    const updatedPlaylists = [...(user.customPlaylists || []), newPl];
    onUpdateUser({ ...user, customPlaylists: updatedPlaylists });
    setNewPlaylistTitle('');
    setNewPlaylistDesc('');
    setIsNewPlaylistOpen(false);
  };

  const handleDeletePlaylist = (playlistId: string) => {
    const updatedPlaylists = (user.customPlaylists || []).filter((p) => p.id !== playlistId);
    onUpdateUser({ ...user, customPlaylists: updatedPlaylists });
  };

  const handleSaveProfile = () => {
    onUpdateUser({
      ...user,
      displayName: editDisplayName.trim() || user.displayName,
      email: editEmail.trim() || user.email,
    });
    setIsEditingProfile(false);
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300" dir="rtl">
      
      {/* 1. ULTRA SLEEK PROFILE HEADER BANNER */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#141414] via-[#1a231d] to-[#121212] border border-neutral-700/60 p-6 sm:p-8 shadow-2xl">
        {/* Glow Effects */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#1db954]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-right">
            <div className="relative group shrink-0">
              <img
                src={user.avatarUrl}
                alt={user.displayName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-[#1db954] shadow-xl"
              />
              {user.isVip && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-tr from-amber-500 to-yellow-300 text-black p-1.5 rounded-full shadow-lg">
                  <Crown className="w-4 h-4 fill-black" />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  {user.displayName}
                </h1>
                
                {user.role === 'admin' ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" />
                    <span>مالک سایت و ادمین</span>
                  </span>
                ) : user.isVip ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5 fill-amber-400" />
                    <span>عضو طلایی VIP</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700 text-xs font-medium">
                    کاربر عادی
                  </span>
                )}
              </div>

              <div className="text-xs text-neutral-400 font-mono" dir="ltr">
                @{user.username} {user.email ? `• ${user.email}` : ''}
              </div>

              <div className="text-[11px] text-neutral-500 pt-1">
                عضویت از: {user.createdAt || 'پاییز ۲۰۲۶'}
              </div>
            </div>
          </div>

          {/* Action Buttons in Header */}
          <div className="flex flex-wrap items-center gap-2.5 justify-center">
            {user.role === 'admin' && onNavigateToAdmin && (
              <button
                type="button"
                onClick={onNavigateToAdmin}
                className="py-2.5 px-4 rounded-xl bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-[#1db954]/20 cursor-pointer"
              >
                <Shield className="w-4 h-4" />
                <span>ورود به اتاق‌های مدیریت</span>
              </button>
            )}

            {!user.isVip && (
              <button
                type="button"
                onClick={onNavigateToSupport}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <Crown className="w-4 h-4 fill-black" />
                <span>ارتقا به VIP (۱۰ تتر / 3 میلیون)</span>
              </button>
            )}

            <button
              type="button"
              onClick={onLogout}
              className="py-2.5 px-4 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 hover:text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-700/60"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span>خروج از حساب</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#181818] border border-neutral-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>آهنگ‌های لایک شده</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-white">{user.likedTrackIds.length}</div>
          <div className="text-[11px] text-neutral-500 mt-0.5">در لیست علاقه‌مندی شما</div>
        </div>

        <div className="bg-[#181818] border border-neutral-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>پلی‌لیست‌های اختصاصی</span>
            <ListMusic className="w-4 h-4 text-[#1db954]" />
          </div>
          <div className="text-2xl font-black text-[#1db954]">
            {user.customPlaylists?.length || 0}
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">پلی‌لیست شخصی شما</div>
        </div>

        <div className="bg-[#181818] border border-neutral-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>وضعیت دانلود</span>
            <Download className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-black text-white">
            {user.isVip ? 'نامحدود (VIP)' : 'قفل (نیاز به VIP)'}
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">
            {user.downloadCount || 0} بار دانلود انجام شده
          </div>
        </div>

        <div className="bg-[#181818] border border-neutral-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>نوع اشتراک</span>
            <Crown className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-emerald-400">
            {user.isVip ? 'طلایی (VIP)' : 'عادی (Free)'}
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">
            {user.isVip ? 'دسترسی کامل به دانلود' : 'استریم آنلاین'}
          </div>
        </div>
      </div>

      {/* 3. TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('liked')}
          className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'liked'
              ? 'bg-[#1db954] text-black shadow-lg shadow-[#1db954]/20'
              : 'bg-[#181818] text-neutral-400 hover:text-white'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>علاقه‌مندی‌های من ({userLikedTracks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('playlists')}
          className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'playlists'
              ? 'bg-[#1db954] text-black shadow-lg shadow-[#1db954]/20'
              : 'bg-[#181818] text-neutral-400 hover:text-white'
          }`}
        >
          <ListMusic className="w-4 h-4" />
          <span>پلی‌لیست‌های من ({user.customPlaylists?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-neutral-700 text-white'
              : 'bg-[#181818] text-neutral-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>ویرایش اطلاعات حساب</span>
        </button>
      </div>

      {/* TAB 1: LIKED SONGS */}
      {activeTab === 'liked' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              <span>قطعاتی که مورد پسند شما قرار گرفته‌اند</span>
            </h3>
            <span className="text-xs text-neutral-400 font-mono">{userLikedTracks.length} ترک</span>
          </div>

          {userLikedTracks.length === 0 ? (
            <div className="bg-[#181818] border border-neutral-800 rounded-2xl p-12 text-center text-neutral-400 space-y-2">
              <Heart className="w-12 h-12 text-neutral-600 mx-auto" />
              <h4 className="text-white font-bold text-base">هنوز آهنگی را لایک نکرده‌اید</h4>
              <p className="text-xs text-neutral-500">
                در صفحه خانه یا جستجو، با کلیک بر روی آیکون قلب هر آهنگ، آن را به این بخش اضافه نمایید.
              </p>
            </div>
          ) : (
            <div className="bg-[#181818] border border-neutral-800 rounded-2xl divide-y divide-neutral-800 overflow-hidden">
              {userLikedTracks.map((track, idx) => {
                const isCurrent = currentTrackId === track.id && isPlaying;

                return (
                  <div
                    key={track.id}
                    className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-[#222222] transition-colors group cursor-pointer"
                    onClick={() => onPlayTrack(track)}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-neutral-500 font-mono text-xs w-4 text-center">
                        {idx + 1}
                      </span>
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <div className={`font-bold text-sm truncate ${isCurrent ? 'text-[#1db954]' : 'text-white'}`}>
                          {track.title}
                        </div>
                        <div className="text-xs text-neutral-400 truncate mt-0.5 flex items-center gap-2">
                          <span>{track.artist}</span>
                          <span>•</span>
                          <span className="text-neutral-500">{track.genre}</span>
                          <span>•</span>
                          <span className="text-neutral-500">{track.bpm} BPM</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlayTrack(track);
                        }}
                        className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white cursor-pointer"
                      >
                        {isCurrent ? <Pause className="w-4 h-4 text-[#1db954]" /> : <Play className="w-4 h-4 ml-0.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownloadTrack(track);
                        }}
                        className={`py-1.5 px-3 rounded-full text-xs font-bold flex items-center gap-1 cursor-pointer ${
                          user.isVip
                            ? 'bg-[#1db954] hover:bg-[#1ed760] text-black shadow-sm'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{user.isVip ? 'دانلود ۳۲۰' : 'دانلود VIP'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleLike(track.id);
                        }}
                        className="p-2 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                        title="حذف از علاقه‌مندی‌ها"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY PLAYLISTS */}
      {activeTab === 'playlists' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ListMusic className="w-5 h-5 text-[#1db954]" />
              <span>پلی‌لیست‌های دست‌ساز شما</span>
            </h3>
            <button
              onClick={() => setIsNewPlaylistOpen(true)}
              className="py-2 px-4 rounded-xl bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>ساخت پلی‌لیست جدید</span>
            </button>
          </div>

          {(user.customPlaylists || []).length === 0 ? (
            <div className="bg-[#181818] border border-neutral-800 rounded-2xl p-12 text-center text-neutral-400 space-y-3">
              <ListMusic className="w-12 h-12 text-neutral-600 mx-auto" />
              <h4 className="text-white font-bold text-base">هنوز پلی‌لیستی نساخته‌اید</h4>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                می‌توانید آهنگ‌های مورد علاقه خود از دی‌جی کاسپین را در پلی‌لیست‌های اختصاصی برای مهمانی و ماشین دسته‌بندی کنید.
              </p>
              <button
                onClick={() => setIsNewPlaylistOpen(true)}
                className="py-2 px-5 rounded-full bg-[#1db954] text-black font-bold text-xs cursor-pointer hover:bg-[#1ed760]"
              >
                ایجاد اولین پلی‌لیست
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.customPlaylists?.map((pl) => (
                <div
                  key={pl.id}
                  className="bg-[#181818] border border-neutral-800 hover:border-neutral-700 rounded-2xl p-4 space-y-3 group transition-all"
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-900">
                    <img
                      src={pl.coverUrl}
                      alt={pl.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-[#1db954] text-black flex items-center justify-center shadow-lg">
                        <Play className="w-5 h-5 fill-black ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-sm truncate">{pl.title}</h4>
                      <button
                        onClick={() => handleDeletePlaylist(pl.id)}
                        className="text-neutral-500 hover:text-red-400 p-1"
                        title="حذف پلی‌لیست"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">{pl.description}</p>
                    <div className="text-[11px] text-neutral-500 mt-2 font-mono">
                      {pl.trackIds.length} قطعه انتخاب شده
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}



      {/* TAB 4: ACCOUNT SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-[#181818] border border-neutral-800 rounded-2xl p-6 space-y-4 max-w-lg">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-neutral-400" />
            <span>تنظیمات حساب کاربری</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-neutral-300 block mb-1 font-medium">نام کاربری (غیرقابل تغییر):</label>
              <input
                type="text"
                disabled
                value={user.username}
                className="w-full bg-[#222] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-400 font-mono"
                dir="ltr"
              />
            </div>

            <div>
              <label className="text-xs text-neutral-300 block mb-1 font-medium">نام نمایشی شما:</label>
              <input
                type="text"
                value={editDisplayName}
                onChange={(e) => setEditDisplayName(e.target.value)}
                className="w-full bg-[#242424] border border-neutral-700 focus:border-[#1db954] focus:outline-none rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs text-neutral-300 block mb-1 font-medium">ایمیل یا شماره همراه:</label>
              <input
                type="text"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full bg-[#242424] border border-neutral-700 focus:border-[#1db954] focus:outline-none rounded-xl px-3 py-2 text-xs text-white font-mono"
                dir="ltr"
              />
            </div>

            <button
              type="button"
              onClick={handleSaveProfile}
              className="py-2.5 px-6 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md mt-2"
            >
              <Save className="w-4 h-4" />
              <span>ذخیره تغییرات</span>
            </button>
          </div>
        </div>
      )}

      {/* CREATE PLAYLIST MODAL */}
      {isNewPlaylistOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#181818] border border-neutral-700 rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ListMusic className="w-5 h-5 text-[#1db954]" />
              <span>ایجاد پلی‌لیست شخصی جدید</span>
            </h3>

            <form onSubmit={handleCreatePlaylist} className="space-y-3">
              <div>
                <label className="text-xs text-neutral-300 block mb-1 font-medium">عنوان پلی‌لیست: *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: ریمیکس‌های مسافرت"
                  value={newPlaylistTitle}
                  onChange={(e) => setNewPlaylistTitle(e.target.value)}
                  className="w-full bg-[#242424] border border-neutral-700 focus:border-[#1db954] focus:outline-none rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-300 block mb-1 font-medium">توضیح کوتاه:</label>
                <input
                  type="text"
                  placeholder="توضیحاتی برای پلی‌لیست..."
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  className="w-full bg-[#242424] border border-neutral-700 focus:border-[#1db954] focus:outline-none rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewPlaylistOpen(false)}
                  className="py-2 px-4 rounded-full bg-neutral-800 text-neutral-300 text-xs font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-full bg-[#1db954] text-black text-xs font-bold cursor-pointer hover:bg-[#1ed760]"
                >
                  ایجاد پلی‌لیست
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
