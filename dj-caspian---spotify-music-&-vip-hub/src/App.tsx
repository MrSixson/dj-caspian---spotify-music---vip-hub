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
import { INITIAL_USERS } from './data/initialData';
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
  const [tickets, setTickets] = useState<VipTicket[]>([]);

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
    localStorage.setItem('caspian_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (authLoading || currentUser?.role !== 'admin') { setTickets([]); return; }
    let active = true;
    supabase.from('vip_tickets').select('*').order('created_at', { ascending: false }).then(async ({ data, error }) => {
      if (!active) return;
      if (error) { showToast('دریافت تیکت‌های VIP ناموفق بود: ' + error.message, 'error'); return; }
      const mapped = await Promise.all((data || []).map(async (row: any) => {
        let receiptImageData: string | undefined;
        if (row.receipt_path) {
          const { data: signed } = await supabase.storage.from('receipts').createSignedUrl(row.receipt_path, 15 * 60);
          receiptImageData = signed?.signedUrl;
        }
        return {
          id: row.id, userId: row.user_id, userName: row.user_name, userContact: row.user_contact,
          method: row.method, amount: row.method === 'crypto' ? String(row.amount) + ' USDT' : Number(row.amount).toLocaleString('en-US') + ' Toman',
          cryptoNetwork: row.crypto_network || undefined, txHashOrReceiptNo: row.tx_hash_or_receipt_no,
          receiptPath: row.receipt_path || undefined, receiptImageData, notes: row.notes || undefined, status: row.status,
          createdAt: row.created_at, reviewDate: row.review_date || undefined, adminNote: row.admin_note || undefined,
        };
      }));
      if (active) setTickets(mapped);
    });
    return () => { active = false; };
  }, [currentUser?.id, currentUser?.role, authLoading]);
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

  const handleDeleteTrack = async (trackId: string) => {
    if (currentUser?.role !== 'admin') { showToast('دسترسی مدیریت لازم است.', 'error'); return; }
    const track = tracks.find((item) => item.id === trackId);
    if (!track) return;
    const { error: linksError } = await supabase.from('playlist_tracks').delete().eq('track_id', trackId);
    if (linksError) { showToast('حذف ارتباط آهنگ با پلی‌لیست‌ها ناموفق بود: ' + linksError.message, 'error'); return; }
    const { error: likesError } = await supabase.from('user_likes').delete().eq('track_id', trackId);
    if (likesError) { showToast('پاک‌سازی علاقه‌مندی‌ها ناموفق بود: ' + likesError.message, 'error'); return; }
    const { error: rowError } = await supabase.from('tracks').delete().eq('id', trackId);
    if (rowError) { showToast('حذف آهنگ از دیتابیس ناموفق بود: ' + rowError.message, 'error'); return; }
    const audioPath = track.audioUrl ? undefined : undefined;
    const { data: stored } = await supabase.from('tracks').select('audio_path,cover_path').eq('id', trackId).maybeSingle();
    void audioPath; void stored;
    setTracks((prev) => prev.filter((item) => item.id !== trackId));
    if (currentTrack?.id === trackId) {
      audioEngine.stop(); setIsPlaying(false);
      setCurrentTrack(tracks.find((item) => item.id !== trackId) || null);
    }
    showToast('رکورد آهنگ حذف شد. فایل‌های ذخیره‌سازی نیازمند پاک‌سازی جداگانه‌اند.', 'success');
  };

  const handleAddPlaylist = async (newPlaylist: Playlist) => {
    if (currentUser?.role !== 'admin') throw new Error('دسترسی مدیریت لازم است.');
    const id = crypto.randomUUID();
    const { error: playlistError } = await supabase.from('playlists').insert({
      id, title: newPlaylist.title.trim(), description: newPlaylist.description || '',
      cover_path: newPlaylist.coverUrl || null,
    });
    if (playlistError) throw new Error('ساخت پلی‌لیست ناموفق بود: ' + playlistError.message);
    if (newPlaylist.trackIds.length) {
      const rows = newPlaylist.trackIds.map((track_id, position) => ({ playlist_id: id, track_id, position }));
      const { error: linksError } = await supabase.from('playlist_tracks').insert(rows);
      if (linksError) {
        await supabase.from('playlists').delete().eq('id', id);
        throw new Error('ثبت آهنگ‌های پلی‌لیست ناموفق بود: ' + linksError.message);
      }
    }
    setPlaylists((prev) => [{ ...newPlaylist, id }, ...prev]);
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    if (currentUser?.role !== 'admin') { showToast('دسترسی مدیریت لازم است.', 'error'); return; }
    const { error: linksError } = await supabase.from('playlist_tracks').delete().eq('playlist_id', playlistId);
    if (linksError) { showToast('حذف آهنگ‌های پلی‌لیست ناموفق بود: ' + linksError.message, 'error'); return; }
    const { error } = await supabase.from('playlists').delete().eq('id', playlistId);
    if (error) { showToast('حذف پلی‌لیست ناموفق بود: ' + error.message, 'error'); return; }
    setPlaylists((prev) => prev.filter((item) => item.id !== playlistId));
    showToast('پلی‌لیست از دیتابیس حذف شد.', 'success');
  };

  const handleUpdateTicketStatus = async (ticketId: string, status: 'approved' | 'rejected', adminNote?: string) => {
    const target = tickets.find((ticket) => ticket.id === ticketId);
    if (!target || currentUser?.role !== 'admin' || !target.userId) { showToast('تیکت یا دسترسی معتبر نیست.', 'error'); return; }
    const { error } = await supabase.from('vip_tickets').update({ status, admin_note: adminNote || null, review_date: new Date().toISOString() }).eq('id', ticketId);
    if (error) { showToast('ثبت نتیجه بررسی ناموفق بود: ' + error.message, 'error'); return; }
    if (status === 'approved') {
      const { error: vipError } = await supabase.from('vip_entitlements').upsert({ user_id: target.userId, is_active: true, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
      if (vipError) { showToast('تیکت ثبت شد اما فعال‌سازی VIP ناموفق بود: ' + vipError.message, 'error'); return; }
    }
    setTickets((previous) => previous.map((ticket) => ticket.id === ticketId ? { ...ticket, status, adminNote, reviewDate: new Date().toISOString() } : ticket));
    showToast(status === 'approved' ? 'تیکت تایید و اشتراک VIP فعال شد.' : 'تیکت رد شد.', 'success');
    if (status === 'approved' && currentUser.id === target.userId) {
      const refreshed = await getCurrentSupabaseUser();
      if (refreshed) setCurrentUser(refreshed);
    }
  };

  const handleAddTicket = async (ticket: VipTicket): Promise<VipTicket> => {
    if (!currentUser?.id || ticket.userId !== currentUser.id) throw new Error('برای ثبت تیکت باید وارد حساب کاربری خود شوید.');
    const { data, error } = await supabase.from('vip_tickets').insert({
      user_id: currentUser.id, user_name: ticket.userName, user_contact: ticket.userContact,
      method: ticket.method, amount: ticket.method === 'crypto' ? 10 : 3000000,
      crypto_network: ticket.cryptoNetwork || null, tx_hash_or_receipt_no: ticket.txHashOrReceiptNo,
      receipt_path: ticket.receiptPath || null, notes: ticket.notes || null, status: 'pending',
    }).select('id,created_at').single();
    if (error || !data) throw new Error('ثبت تیکت در سرور ناموفق بود: ' + (error?.message || 'No record returned'));
    const created = { ...ticket, id: data.id, createdAt: data.created_at };
    setTickets((previous) => [created, ...previous]);
    return created;
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

  const handleResetToDefault = async () => {
    if (!confirm('کتابخانه دوباره از Supabase بارگذاری شود؟ هیچ آهنگ، حساب یا تیکتی از سرور حذف نخواهد شد.')) return;
    try {
      const catalog = await loadCatalog(currentUser?.id);
      setTracks(catalog.tracks);
      setPlaylists(catalog.playlists);
      setLikedTrackIds(catalog.likedTrackIds);
      setCurrentTrack(catalog.tracks[0] || null);
      setCurrentTime(0);
      audioEngine.stop();
      setIsPlaying(false);
      showToast('کتابخانه از Supabase تازه‌سازی شد.', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'تازه‌سازی کتابخانه ناموفق بود.', 'error');
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
              userId={currentUser?.id || null}
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
