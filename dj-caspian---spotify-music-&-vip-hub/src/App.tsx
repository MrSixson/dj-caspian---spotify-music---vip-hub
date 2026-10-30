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
import { INITIAL_TRACKS, INITIAL_PLAYLISTS, INITIAL_TICKETS, INITIAL_USERS } from './data/initialData';
import { audioEngine } from './utils/audioEngine';
import { getCurrentSupabaseUser, signOutSupabaseUser } from './services/supabase/auth.service';
import { loadCatalog, toggleTrackLike, uploadTrackAssets } from './services/supabase/catalog.service';
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

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // 2. Persistent tracks & library (Clean initial slate without legacy mock tracks)
  const [tracks, setTracks] = useState<Track[]>(() => {
    try {
      const saved = localStorage.getItem('caspian_tracks');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Exclude legacy mock tracks if any exist from older versions
        return parsed.filter((t: Track) => !t.id.startsWith('caspian-0'));
      }
    } catch {
      // fallback
    }
    return INITIAL_TRACKS;
  });

  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    try {
      const saved = localStorage.getItem('caspian_playlists');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_PLAYLISTS;
  });

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

  const [likedTrackIds, setLikedTrackIds] = useState<string[]>(() => {
    if (currentUser?.likedTrackIds && currentUser.likedTrackIds.length > 0) {
      return currentUser.likedTrackIds;
    }
    try {
      const saved = localStorage.getItem('caspian_liked_tracks');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return ['caspian-01', 'caspian-03', 'caspian-04'];
  });

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
    localStorage.setItem('caspian_tracks', JSON.stringify(tracks));
  }, [tracks]);

  useEffect(() => {
    localStorage.setItem('caspian_playlists', JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    localStorage.setItem('caspian_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('caspian_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
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
  }, [currentUser?.id]);

  useEffect(() => {
    let active = true;
    getCurrentSupabaseUser()
      .then((user) => {
        if (active) {
          setCurrentUser(user);
          if (user?.likedTrackIds) setLikedTrackIds(user.likedTrackIds);
        }
      })
      .catch((error) => console.error('Supabase session restore failed:', error));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('caspian_liked_tracks', JSON.stringify(likedTrackIds));
  }, [likedTrackIds]);

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
  const handlePlayTrack = (track: Track) => {
    if (currentTrack?.id === track.id && isPlaying) {
      // Pause
      audioEngine.pause();
      setIsPlaying(false);
      return;
    }

    setCurrentTrack(track);
    setDuration(track.duration);
    setCurrentTime(0);
    setIsPlaying(true);

    audioEngine.playTrack(
      track.id,
      track.audioUrl,
      track.bpm,
      track.synthPreset || 'festival_drop',
      (secs) => {
        setCurrentTime((prev) => {
          if (secs >= track.duration) {
            handleNextTrack();
            return 0;
          }
          return secs;
        });
      }
    );

    // Increment play count
    setTracks((prev) =>
      prev.map((t) => (t.id === track.id ? { ...t, plays: (t.plays || 0) + 1 } : t))
    );
  };

  const handleTogglePlay = () => {
    if (!currentTrack) {
      if (tracks.length > 0) {
        handlePlayTrack(tracks[0]);
      }
      return;
    }

    if (isPlaying) {
      audioEngine.pause();
      setIsPlaying(false);
    } else {
      audioEngine.playTrack(
        currentTrack.id,
        currentTrack.audioUrl,
        currentTrack.bpm,
        currentTrack.synthPreset || 'festival_drop',
        (secs) => {
          setCurrentTime(secs);
        }
      );
      setIsPlaying(true);
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
      // Free user attempting to download VIP track -> Show VIP Modal
      setVipModalTrackTitle(track.title);
      setIsVipModalOpen(true);
      return;
    }

    // Download only the original uploaded audio file. Never fabricate a fallback track.
    const downloadUrl = track.audioUrl;
    if (!downloadUrl) {
      showToast('فایل اصلی این آهنگ در دسترس نیست و دانلود انجام نشد.', 'error');
      return;
    }

    showToast(`دانلود فایل اصلی ${track.title} آغاز شد...`, 'success');

    // Increment user download count only when a real source URL exists.
    if (currentUser) {
      const updatedUser: UserAccount = {
        ...currentUser,
        downloadCount: (currentUser.downloadCount || 0) + 1,
      };
      setCurrentUser(updatedUser);
      setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
    }

    try {
      const filename = `DJ_Caspian_${track.title.replace(/[^a-zA-Z0-9]/g, '_')}`;

      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
        });
      } catch {
        // ignore
      }
    } catch (err) {
      console.error(err);
      showToast('خطا در دانلود فایل', 'error');
    }
  };

  // -------------------------------------------------------------
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
        onNavigate={(view) => setCurrentView(view)}
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
            currentUser ? (
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
                onNavigateToAdmin={() => setCurrentView('admin')}
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
            currentUser?.role === 'admin' ? (
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
            ) : null
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
