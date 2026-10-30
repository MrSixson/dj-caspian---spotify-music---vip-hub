/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { PlayerBar } from './components/PlayerBar';
import { HomeView } from './components/HomeView';
import { SupportVipView } from './components/SupportVipView';
import { AboutView } from './components/AboutView';
import { AdminPanel } from './components/AdminPanel';
import { SearchView } from './components/SearchView';
import { LibraryView } from './components/LibraryView';
import { UserDashboard } from './components/UserDashboard';
import { AuthModal } from './components/AuthModal';
import { VipModal } from './components/VipModal';
import { VisualizerModal } from './components/VisualizerModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Track, VipTicket, Playlist, UserAccount } from './types';
import { INITIAL_TICKETS, INITIAL_USERS } from './data/initialData';
import { audioEngine } from './utils/audioEngine';
import { getCurrentSupabaseUser, signOutSupabaseUser } from './lib/auth';
import { supabase } from './lib/supabase';
import { loadCatalog, toggleTrackLike, uploadTrackAssets } from './lib/catalog';
import confetti from 'canvas-confetti';

export default function App() {
  // 1. Persistent Users & Auth State
  const [users, setUsers] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem('caspian_users');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_USERS;
  });

  // Restore identity and permissions only from Supabase, not editable browser storage.
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // 2. Persistent tracks & library (Clean initial slate without legacy mock tracks)
  const [tracks, setTracks] = useState<Track[]>([]);

  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  // 3. Persistent VIP Tickets
  const [tickets, setTickets] = useState<VipTicket[]>(() => {
    try {
      const saved = localStorage.getItem('caspian_tickets');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_TICKETS;
  });

  // 4. Derived & Persistent User Permissions
  const isUserVip = Boolean(currentUser?.isVip);

  const [likedTrackIds, setLikedTrackIds] = useState<string[]>([]);

  // 5. Navigation & Views
  const [currentView, setCurrentView] = useState<
    'home' | 'search' | 'library' | 'support' | 'tickets' | 'admin' | 'liked' | 'dashboard' | 'about'
  >('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 6. Audio Playback State
  const [currentTrack, setCurrentTrack] = useState<Track | null>(tracks[0] || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(tracks[0]?.duration || 218);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  // 7. Modals & Notifications
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [vipModalTrackTitle, setVipModalTrackTitle] = useState('');
  const [isVisualizerOpen, setIsVisualizerOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // LocalStorage Synchronization
  useEffect(() => {
    localStorage.setItem('caspian_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('caspian_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (authLoading) return;
    let active = true;
    loadCatalog(currentUser?.id)
      .then((catalog) => {
        if (!active) return;
        setTracks(catalog.tracks);
        setPlaylists(catalog.playlists);
        if (currentUser) setLikedTrackIds(catalog.likedTrackIds);
        setCurrentTrack((previous) => previous ? (catalog.tracks.find((t) => t.id === previous.id) || catalog.tracks[0] || null) : (catalog.tracks[0] || null));
      })
      .catch((error) => {
        console.error('Supabase catalog load failed:', error);
        if (active) showToast(error instanceof Error ? error.message : 'دریافت کتابخانه از سرور ناموفق بود.', 'error');
      });
    return () => { active = false; };
  }, [currentUser?.id, authLoading]);

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      try {
        const user = await getCurrentSupabaseUser();
        if (!active) return;
        setCurrentUser(user);
        if (user?.likedTrackIds) setLikedTrackIds(user.likedTrackIds);
      } catch (error) {
        console.error('Supabase session restore failed:', error);
        if (active) setCurrentUser(null);
      } finally {
        if (active) setAuthLoading(false);
      }
    };

    void restoreSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;

      if (event === 'SIGNED_OUT' || !session) {
        setCurrentUser(null);
        setAuthLoading(false);
        setCurrentView((view) =>
          view === 'admin' || view === 'dashboard' || view === 'liked' ? 'home' : view
        );
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        // Defer profile/role queries until after the auth callback returns.
        Promise.resolve().then(async () => {
          const user = await getCurrentSupabaseUser();
          if (!active) return;
          setCurrentUser(user);
          if (user?.likedTrackIds) setLikedTrackIds(user.likedTrackIds);
          setAuthLoading(false);
        }).catch((error) => {
          console.error('Supabase auth state sync failed:', error);
          if (active) setAuthLoading(false);
        });
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('caspian_liked_tracks', JSON.stringify(likedTrackIds));
  }, [likedTrackIds]);

  const navigateToView = (view: typeof currentView) => {
    if ((view === 'dashboard' || view === 'liked') && !currentUser) {
      showToast('برای دسترسی به این بخش ابتدا وارد حساب کاربری شوید.', 'info');
      setIsAuthModalOpen(true);
      return;
    }
    if (view === 'admin' && currentUser?.role !== 'admin') {
      showToast(
        currentUser ? 'دسترسی مدیریت برای این حساب فعال نیست.' : 'برای ورود به مدیریت ابتدا وارد حساب ادمین شوید.',
        'error'
      );
      if (!currentUser) setIsAuthModalOpen(true);
      setCurrentView('home');
      return;
    }
    setCurrentView(view);
  };

  // Toast Helper
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = 'toast-' + Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Play a specific track
  const handlePlayTrack = async (track: Track) => {
    if (currentTrack?.id === track.id && isPlaying) {
      audioEngine.pause();
      setIsPlaying(false);
      return;
    }

    setCurrentTrack(track);
    setDuration(track.duration);
    setCurrentTime(0);
    setIsPlaying(false);

    try {
      await audioEngine.playTrack(
        track.id,
        track.audioUrl,
        track.bpm,
        track.synthPreset || 'festival_drop',
        (secs) => {
          setCurrentTime(secs);
          if (track.duration > 0 && secs >= track.duration) {
            handleNextTrack();
          }
        }
      );
      setIsPlaying(true);
      setTracks((prev) =>
        prev.map((t) => (t.id === track.id ? { ...t, plays: (t.plays || 0) + 1 } : t))
      );
    } catch (error) {
      setIsPlaying(false);
      showToast(
        error instanceof Error ? error.message : 'پخش آهنگ ناموفق بود.',
        'error'
      );
    }
  };

  const handleTogglePlay = async () => {
    if (!currentTrack) {
      if (tracks.length > 0) await handlePlayTrack(tracks[0]);
      return;
    }

    if (isPlaying) {
      audioEngine.pause();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(false);
    try {
      await audioEngine.playTrack(
        currentTrack.id,
        currentTrack.audioUrl,
        currentTrack.bpm,
        currentTrack.synthPreset || 'festival_drop',
        (secs) => setCurrentTime(secs)
      );
      setIsPlaying(true);
    } catch (error) {
      setIsPlaying(false);
      showToast(
        error instanceof Error ? error.message : 'پخش آهنگ ناموفق بود.',
        'error'
      );
    }
  };

  const handleNextTrack = () => {
    if (tracks.length === 0) return;
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * tracks.length);
      handlePlayTrack(tracks[randomIndex]);
      return;
    }
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    handlePlayTrack(tracks[nextIndex]);
  };

  const handlePreviousTrack = () => {
    if (tracks.length === 0) return;
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack?.id);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    handlePlayTrack(tracks[prevIndex]);
  };

  const handleSeek = (seconds: number) => {
    audioEngine.seek(seconds);
    setCurrentTime(seconds);
  };

  const handleVolumeChange = (vol: number) => {
    setVolume(vol);
    setIsMuted(false);
    audioEngine.setVolume(vol);
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      audioEngine.setVolume(volume);
    } else {
      setIsMuted(true);
      audioEngine.setVolume(0);
    }
  };

  const handleToggleLike = async (trackId: string) => {
    const exists = likedTrackIds.includes(trackId);
    if (!currentUser) {
      showToast('برای ذخیره علاقه‌مندی‌ها ابتدا وارد حساب کاربری شوید.', 'info');
      setIsAuthModalOpen(true);
      return;
    }
    try {
      await toggleTrackLike(currentUser.id, trackId, exists);
      const nextLiked = exists
        ? likedTrackIds.filter((id) => id !== trackId)
        : [...likedTrackIds, trackId];
      setLikedTrackIds(nextLiked);
      setCurrentUser({ ...currentUser, likedTrackIds: nextLiked });
      showToast(exists ? 'از لیست علاقه‌مندی‌ها حذف شد' : 'به آهنگ‌های لایک شده اضافه شد', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'ذخیره علاقه‌مندی ناموفق بود.', 'error');
    }
  };

  // -------------------------------------------------------------
  // THE KEY VIP DOWNLOAD LOGIC
  // -------------------------------------------------------------
  const handleDownloadTrack = (track: Track) => {
    if (!isUserVip && track.isVipOnlyDownload) {
      setVipModalTrackTitle(track.title);
      setIsVipModalOpen(true);
      return;
    }

    if (!track.audioUrl || !(track.audioUrl.startsWith('https://') || track.audioUrl.startsWith('http://'))) {
      showToast('لینک فایل اصلی این آهنگ در دسترس نیست؛ دانلود انجام نشد.', 'error');
      return;
    }

    const safeTitle = track.title.replace(/[^a-zA-Z0-9_-]+/g, '_') || 'Track';
    const anchor = document.createElement('a');
    anchor.href = track.audioUrl;
    anchor.download = `DJ_Caspian_${safeTitle}.mp3`;
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    if (currentUser) {
      const updatedUser: UserAccount = {
        ...currentUser,
        downloadCount: (currentUser.downloadCount || 0) + 1,
      };
      setCurrentUser(updatedUser);
      setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
    }

    showToast(`درخواست دانلود فایل اصلی ${track.title} ارسال شد.`, 'success');
  };

  // AUTH ACTIONS
  // -------------------------------------------------------------
  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    if (user.likedTrackIds) {
      setLikedTrackIds(user.likedTrackIds);
    }
    showToast(`خوش آمدید، ${user.displayName}!`, 'success');
    if (user.role === 'admin') {
      showToast('ورود موفق به اتاق مدیریت DJ Caspian ⚡', 'success');
      setCurrentView('admin');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleRegister = (newUser: UserAccount) => {
    setUsers((prev) => [...prev, newUser]);
    showToast('حساب کاربری جدید با موفقیت ساخته شد!', 'success');
  };

  const handleLogout = async () => {
    try {
      await signOutSupabaseUser();
      setCurrentUser(null);
      setCurrentView('home');
      showToast('از حساب کاربری خود خارج شدید.', 'info');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'خروج از حساب انجام نشد.', 'error');
    }
  };

  const handleUpdateUser = (updatedUser: UserAccount) => {
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    showToast('اطلاعات حساب شما ذخیره شد.', 'success');
  };

  // -------------------------------------------------------------
  // DJ CASPIAN ADMIN ACTIONS
  // -------------------------------------------------------------
  const handleAddTrack = async (input: Parameters<typeof uploadTrackAssets>[0]) => {
    const newTrack = await uploadTrackAssets(input);
    setTracks((prev) => [newTrack, ...prev]);
    return newTrack;
  };

  const handleDeleteTrack = (trackId: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== trackId));
    if (currentTrack?.id === trackId) {
      audioEngine.stop();
      setIsPlaying(false);
      setCurrentTrack(tracks.find((t) => t.id !== trackId) || null);
    }
  };

  const handleAddPlaylist = (newPlaylist: Playlist) => {
    setPlaylists((prev) => [newPlaylist, ...prev]);
  };

  const handleDeletePlaylist = (playlistId: string) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
  };

  const handleUpdateTicketStatus = (
    ticketId: string,
    status: 'approved' | 'rejected',
    adminNote?: string
  ) => {
    const updatedTickets = tickets.map((t) =>
      t.id === ticketId
        ? {
            ...t,
            status,
            adminNote: adminNote || t.adminNote,
            reviewDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
          }
        : t
    );
    setTickets(updatedTickets);

    // If approved, promote the user who submitted this ticket to VIP
    if (status === 'approved') {
      const targetTicket = tickets.find((t) => t.id === ticketId);
      if (targetTicket) {
        setUsers((prevUsers) =>
          prevUsers.map((u) => {
            const matches =
              u.displayName.toLowerCase() === targetTicket.userName.toLowerCase() ||
              u.username.toLowerCase() === targetTicket.userName.toLowerCase() ||
              (u.email && targetTicket.userContact.includes(u.email));

            if (matches) {
              const updatedU = { ...u, isVip: true, vipSince: new Date().toISOString().split('T')[0] };
              if (currentUser?.id === u.id) {
                setCurrentUser(updatedU);
              }
              return updatedU;
            }
            return u;
          })
        );
      }

      // If current user submitted or owns this ticket, activate VIP
      if (currentUser) {
        const isMyTicket = targetTicket && (
          targetTicket.userName.toLowerCase() === currentUser.displayName.toLowerCase() ||
          targetTicket.userName.toLowerCase() === currentUser.username.toLowerCase() ||
          (currentUser.email && targetTicket.userContact.includes(currentUser.email))
        );
        if (isMyTicket) {
          const vipUser = { ...currentUser, isVip: true };
          setCurrentUser(vipUser);
        }
      }

      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
        });
      } catch {
        // ignore
      }
    }
  };

  const handleAddTicket = (newTicket: VipTicket) => {
    setTickets((prev) => [newTicket, ...prev]);
  };

  const handleActivateVipForUser = (ticketId: string) => {
    if (currentUser) {
      const updated = { ...currentUser, isVip: true };
      setCurrentUser(updated);
      setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
    }
    showToast('اشتراک VIP شما با موفقیت روی این دستگاه فعال شد!', 'success');
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
    } catch {
      // ignore
    }
  };

  const handleResetToDefault = () => {
    if (confirm('آیا مایلید تمام تغییرات و تیکت‌ها به اطلاعات اولیه برگردد؟')) {
      setTracks(INITIAL_TRACKS);
      setTickets(INITIAL_TICKETS);
      setUsers(INITIAL_USERS);
      setCurrentUser(INITIAL_USERS[0]);
      localStorage.removeItem('caspian_tracks');
      localStorage.removeItem('caspian_tickets');
      localStorage.removeItem('caspian_users');
      localStorage.removeItem('caspian_current_user');
      showToast('اطلاعات به حالت پیش‌فرض بازگشت', 'info');
    }
  };

  return (
    <div className="flex h-screen bg-[#0d0d0d] text-white font-sans overflow-hidden select-none" dir="rtl">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Spotify Sidebar (Desktop + Mobile Drawer) */}
      <Sidebar
        currentView={currentView}
        onNavigate={navigateToView}
        playlists={playlists}
        onSelectPlaylist={(pl) => {
          setCurrentView('home');
          showToast(`پلی‌لیست "${pl.title}" باز شد`, 'info');
        }}
        likedCount={likedTrackIds.length}
        isUserVip={isUserVip}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-gradient-to-b from-[#141414] via-[#101010] to-[#0a0a0a]">
        {/* Top Navbar */}
        <TopNav
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          currentUser={currentUser}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          isUserVip={isUserVip}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto pb-28">
          {currentView === 'home' && (
            <HomeView
              tracks={tracks}
              playlists={playlists}
              currentTrackId={currentTrack?.id || null}
              isPlaying={isPlaying}
              likedTrackIds={likedTrackIds}
              isUserVip={isUserVip}
              onPlayTrack={handlePlayTrack}
              onToggleLike={handleToggleLike}
              onDownloadTrack={handleDownloadTrack}
              onNavigateToSupport={() => setCurrentView('support')}
              onNavigateToAbout={() => setCurrentView('about')}
              onSelectPlaylist={(pl) => {
                showToast(`پلی‌لیست "${pl.title}" انتخاب شد`, 'info');
              }}
            />
          )}

          {currentView === 'search' && (
            <SearchView
              tracks={tracks}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              currentTrackId={currentTrack?.id || null}
              isPlaying={isPlaying}
              likedTrackIds={likedTrackIds}
              isUserVip={isUserVip}
              onPlayTrack={handlePlayTrack}
              onToggleLike={handleToggleLike}
              onDownloadTrack={handleDownloadTrack}
            />
          )}

          {currentView === 'library' && (
            <LibraryView
              tracks={tracks}
              playlists={playlists}
              likedTrackIds={likedTrackIds}
              currentTrackId={currentTrack?.id || null}
              isPlaying={isPlaying}
              isUserVip={isUserVip}
              onPlayTrack={handlePlayTrack}
              onToggleLike={handleToggleLike}
              onDownloadTrack={handleDownloadTrack}
              onSelectPlaylist={(pl) => {
                showToast(`پلی‌لیست "${pl.title}" انتخاب شد`, 'info');
              }}
            />
          )}

          {currentView === 'liked' && (
            <LibraryView
              tracks={tracks}
              playlists={playlists}
              likedTrackIds={likedTrackIds}
              currentTrackId={currentTrack?.id || null}
              isPlaying={isPlaying}
              isUserVip={isUserVip}
              onPlayTrack={handlePlayTrack}
              onToggleLike={handleToggleLike}
              onDownloadTrack={handleDownloadTrack}
              onSelectPlaylist={(pl) => {
                showToast(`پلی‌لیست "${pl.title}" انتخاب شد`, 'info');
              }}
              filterLikedOnly={true}
            />
          )}

          {currentView === 'dashboard' && (
            authLoading ? (
              <div className="p-8 text-center text-neutral-400">در حال بررسی نشست کاربری...</div>
            ) : currentUser ? (
              <UserDashboard
                user={currentUser}
                allTracks={tracks}
                tickets={tickets}
                currentTrackId={currentTrack?.id || null}
                isPlaying={isPlaying}
                onPlayTrack={handlePlayTrack}
                onToggleLike={handleToggleLike}
                onDownloadTrack={handleDownloadTrack}
                onNavigateToSupport={() => setCurrentView('support')}
                onNavigateToAdmin={() => navigateToView('admin')}
                onLogout={handleLogout}
                onUpdateUser={handleUpdateUser}
              />
            ) : (
              <div className="p-8 text-center space-y-4">
                <p className="text-neutral-400">برای دسترسی به داشبورد، لطفاً ابتدا وارد حساب کاربری خود شوید.</p>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="py-2.5 px-6 rounded-full bg-[#1db954] text-black font-bold text-xs"
                >
                  ورود یا ثبت‌نام
                </button>
              </div>
            )
          )}

          {currentView === 'support' && (
            <SupportVipView
              onAddTicket={handleAddTicket}
              onShowToast={showToast}
              isUserVip={isUserVip}
            />
          )}

          {currentView === 'about' && (
            <AboutView
              onNavigateToSupport={() => setCurrentView('support')}
              onShowToast={showToast}
              isUserVip={isUserVip}
            />
          )}

          {currentView === 'admin' && (
            authLoading ? (
              <div className="p-8 text-center text-neutral-400">در حال بررسی دسترسی مدیریت...</div>
            ) : currentUser?.role === 'admin' ? (
              <AdminPanel
                currentUser={currentUser}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
                tracks={tracks}
                playlists={playlists}
                tickets={tickets}
                onAddTrack={handleAddTrack}
                onDeleteTrack={handleDeleteTrack}
                onAddPlaylist={handleAddPlaylist}
                onDeletePlaylist={handleDeletePlaylist}
                onUpdateTicketStatus={handleUpdateTicketStatus}
                onResetToDefault={handleResetToDefault}
                onShowToast={showToast}
                currentPlayingTrackId={currentTrack?.id || null}
                isPlaying={isPlaying}
                onPlayTrack={handlePlayTrack}
              />
            ) : (
              <div className="p-8 text-center space-y-4">
                <p className="text-neutral-400">این بخش فقط برای حساب‌های دارای نقش ادمین قابل دسترسی است.</p>
                {!currentUser && (
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="py-2.5 px-6 rounded-full bg-[#1db954] text-black font-bold text-xs"
                  >
                    ورود به حساب ادمین
                  </button>
                )}
              </div>
            )
          )}
        </main>
      </div>

      {/* Persistent Spotify Bottom Player */}
      <PlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        isShuffle={isShuffle}
        isRepeat={isRepeat}
        isLiked={currentTrack ? likedTrackIds.includes(currentTrack.id) : false}
        isUserVip={isUserVip}
        onTogglePlay={handleTogglePlay}
        onNext={handleNextTrack}
        onPrevious={handlePreviousTrack}
        onSeek={handleSeek}
        onVolumeChange={handleVolumeChange}
        onToggleMute={handleToggleMute}
        onToggleShuffle={() => setIsShuffle((prev) => !prev)}
        onToggleRepeat={() => setIsRepeat((prev) => !prev)}
        onToggleLike={handleToggleLike}
        onDownloadTrack={handleDownloadTrack}
        onOpenVisualizer={() => setIsVisualizerOpen(true)}
      />

      {/* Auth Modal (Login & Register) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        users={users}
      />

      {/* VIP Required Modal (shown when free user tries to download) */}
      <VipModal
        isOpen={isVipModalOpen}
        onClose={() => setIsVipModalOpen(false)}
        onGoToSupport={() => setCurrentView('support')}
        trackTitle={vipModalTrackTitle}
      />

      {/* Fullscreen Audio Visualizer Modal */}
      <VisualizerModal
        isOpen={isVisualizerOpen}
        onClose={() => setIsVisualizerOpen(false)}
        track={currentTrack}
        isPlaying={isPlaying}
        isLiked={currentTrack ? likedTrackIds.includes(currentTrack.id) : false}
        isUserVip={isUserVip}
        onTogglePlay={handleTogglePlay}
        onNext={handleNextTrack}
        onPrevious={handlePreviousTrack}
        onToggleLike={handleToggleLike}
        onDownloadTrack={handleDownloadTrack}
        onGoToSupport={() => {
          setIsVisualizerOpen(false);
          setCurrentView('support');
        }}
      />
    </div>
  );
}
