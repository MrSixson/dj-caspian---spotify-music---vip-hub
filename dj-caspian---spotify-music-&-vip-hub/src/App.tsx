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
import { addRecentTrack, addTrackToQueue, pickNextTrack } from './utils/playback.mjs';
import { getCurrentSupabaseUser, signOutSupabaseUser } from './lib/auth';
import { supabase } from './lib/supabase';
import { loadCatalog, toggleTrackLike, uploadTrackAssets } from './lib/catalog';
import confetti from 'canvas-confetti';
import { UpdateBreak } from './components/UpdateBreak';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { AppPromoModal } from './components/AppPromoModal';
import { AppUpdatePrompt } from './components/AppUpdatePrompt';
import { NotificationPermissionPrompt } from './components/NotificationPermissionPrompt';
import { ProfilesView } from './components/ProfilesView';
import { ListeningHub } from './components/ListeningHub';
import { ReleaseAnnouncement } from './components/ReleaseAnnouncement';

export default function App() {
  const updateBreakEndsAt = new Date('2026-11-25T09:34:00Z').getTime();
  const [clockNow, setClockNow] = useState(() => Date.now());
  useEffect(() => { const interval = window.setInterval(() => setClockNow(Date.now()), 1000); return () => window.clearInterval(interval); }, []);
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
  const [personalPlaylists, setPersonalPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  // 3. Persistent VIP Tickets
  const [tickets, setTickets] = useState<VipTicket[]>([]);

  // 4. Derived & Persistent User Permissions
  const isUserVip = Boolean(currentUser?.isVip);
  const allPlaylists = [...playlists, ...personalPlaylists];

  const [likedTrackIds, setLikedTrackIds] = useState<string[]>([]);

  // 5. Navigation & Views
  const [currentView, setCurrentView] = useState<
    'home' | 'search' | 'library' | 'support' | 'tickets' | 'admin' | 'liked' | 'dashboard' | 'about' | 'community' | 'experience'
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
  const isRepeatRef = useRef(isRepeat);
  isRepeatRef.current = isRepeat;
  const handleNextTrackRef = useRef<(fromEnd?: boolean) => void>(() => {});
  const [queue, setQueue] = useState<Track[]>([]);
  const [recentTrackIds, setRecentTrackIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('caspian_recent_tracks');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
    } catch {
      return [];
    }
  });

  // 7. Modals & Notifications
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [vipModalTrackTitle, setVipModalTrackTitle] = useState('');
  const [isVisualizerOpen, setIsVisualizerOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Personal playlists are private to the signed-in browser profile until account sync is implemented.
  useEffect(() => {
    if (!currentUser?.id) { setPersonalPlaylists([]); return; }
    try {
      const saved = localStorage.getItem(`caspian_personal_playlists_${currentUser.id}`);
      const parsed = saved ? JSON.parse(saved) : [];
      setPersonalPlaylists(Array.isArray(parsed) ? parsed.filter((item) => item && typeof item.id === 'string' && item.id.startsWith('personal:')) : []);
    } catch {
      setPersonalPlaylists([]);
    }
  }, [currentUser?.id]);

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

  // Live catalog sync: changes made in the admin panel reach open clients without an APK update.
  useEffect(() => {
    if (authLoading) return;
    let active = true;
    let refreshTimer: number | undefined;
    const refresh = () => {
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(async () => {
        try {
          const catalog = await loadCatalog(currentUser?.id);
          if (!active) return;
          setTracks(catalog.tracks);
          setPlaylists(catalog.playlists);
          if (currentUser) setLikedTrackIds(catalog.likedTrackIds);
          setCurrentTrack((previous) => previous
            ? (catalog.tracks.find((track) => track.id === previous.id) || catalog.tracks[0] || null)
            : (catalog.tracks[0] || null));
        } catch (error) {
          console.error('Live catalog refresh failed:', error);
        }
      }, 250);
    };
    const channel = supabase.channel('dj-caspian-live-catalog')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tracks' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'playlists' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'playlist_tracks' }, refresh)
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') refresh();
      });
    return () => {
      active = false;
      window.clearTimeout(refreshTimer);
      void supabase.removeChannel(channel);
    };
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

  useEffect(() => {
    localStorage.setItem('caspian_recent_tracks', JSON.stringify(recentTrackIds));
  }, [recentTrackIds]);

  const navigateToView = (view: typeof currentView) => {
    if ((view === 'dashboard' || view === 'liked') && !currentUser) {
      showToast('برای دسترسی به این بخش ابتدا وارد حساب کاربری شوید.', 'info');
      setIsAuthModalOpen(true);
      return;
    }
    if (view === 'community' && currentUser?.role !== 'admin') {
      showToast('بخش جامعه کاربران فقط برای مدیر قابل مشاهده است.', 'error');
      setCurrentView('home');
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
    if (view !== 'library') setSelectedPlaylist(null);
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

  const restartCurrentTrack = () => {
    void audioEngine.restart().then(() => {
      setCurrentTime(0);
      setIsPlaying(true);
    }).catch((error) => {
      setIsPlaying(false);
      showToast(error instanceof Error ? error.message : 'شروع دوباره آهنگ ناموفق بود.', 'error');
    });
  };

  const handleTrackEnded = () => {
    if (isRepeatRef.current) {
      restartCurrentTrack();
      return;
    }
    handleNextTrackRef.current(true);
  };

  // Play a specific track
  const handlePlayTrack = async (track: Track, forceRestart = false) => {
    if (!currentUser) {
      showToast('برای پخش موسیقی ابتدا وارد حساب کاربری شوید.', 'info');
      setIsAuthModalOpen(true);
      return;
    }

    if (!forceRestart && currentTrack?.id === track.id && isPlaying) {
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
          const mediaDuration = audioEngine.getDuration();
          if (mediaDuration > 0) setDuration(mediaDuration);
        },
        handleTrackEnded
      );
      const loadedDuration = audioEngine.getDuration();
      setDuration(loadedDuration > 0 ? loadedDuration : track.duration);
      setIsPlaying(true);
      setRecentTrackIds((previous) => addRecentTrack(previous, track.id));
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
    if (!currentUser) {
      showToast('برای پخش موسیقی ابتدا وارد حساب کاربری شوید.', 'info');
      setIsAuthModalOpen(true);
      return;
    }

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
        (secs) => {
          setCurrentTime(secs);
          const mediaDuration = audioEngine.getDuration();
          if (mediaDuration > 0) setDuration(mediaDuration);
        },
        handleTrackEnded
      );
      const loadedDuration = audioEngine.getDuration();
      setDuration(loadedDuration > 0 ? loadedDuration : currentTrack.duration);
      setIsPlaying(true);
    } catch (error) {
      setIsPlaying(false);
      showToast(
        error instanceof Error ? error.message : 'پخش آهنگ ناموفق بود.',
        'error'
      );
    }
  };

  const handleRoomSync = async (trackId: string, position: number, playing: boolean) => {
    const track = tracks.find((item) => item.id === trackId);
    if (!track || !currentUser) return;
    try {
      if (currentTrack?.id !== track.id || !audioEngine.getDebugInfo().source || (playing && audioEngine.getDebugInfo().paused)) {
        await audioEngine.playTrack(track.id, track.audioUrl, track.bpm, track.synthPreset || 'festival_drop',
          (secs) => { setCurrentTime(secs); const mediaDuration = audioEngine.getDuration(); if (mediaDuration > 0) setDuration(mediaDuration); },
          handleTrackEnded);
      }
      audioEngine.seek(position);
      if (!playing) audioEngine.pause();
      setCurrentTrack(track); setCurrentTime(position); setDuration(track.duration); setIsPlaying(playing);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'همگام‌سازی اتاق انجام نشد.', 'error');
    }
  };

  const lastHistoryBucket = useRef('');
  useEffect(() => {
    if (!currentUser?.id || !currentTrack?.id) return;
    if (currentTime < 30) { lastHistoryBucket.current = ''; return; }
    if (!isPlaying) return;
    const bucket = currentUser.id + ':' + currentTrack.id + ':' + Math.floor(currentTime / 30);
    if (lastHistoryBucket.current === bucket) return;
    lastHistoryBucket.current = bucket;
    void supabase.from('listening_history').insert({
      user_id: currentUser.id,
      track_id: currentTrack.id,
      listened_seconds: 30,
      completed: duration > 0 && currentTime >= duration - 5,
    }).then(({ error }) => { if (error) console.warn('Listening history was not saved:', error.message); });
  }, [currentUser?.id, currentTrack?.id, currentTime, isPlaying, duration]);

  const handleNextTrack = (fromEnd = false) => {
    const next = pickNextTrack({
      tracks,
      currentTrackId: currentTrack?.id || null,
      queue,
      isShuffle,
    });
    if (next.fromQueue) setQueue(next.remainingQueue);
    if (!next.track) return;
    if (next.track.id === currentTrack?.id) {
      if (next.fromQueue || !fromEnd) restartCurrentTrack();
      else setIsPlaying(false);
      return;
    }
    void handlePlayTrack(next.track, true);
  };
  handleNextTrackRef.current = handleNextTrack;

  const handleAddToQueue = (track: Track) => {
    setQueue((previous) => addTrackToQueue(previous, track));
    showToast(`«${track.title}» به صف پخش اضافه شد.`, 'success');
  };

  const handleRemoveFromQueue = (trackId: string) => {
    setQueue((previous) => previous.filter((track) => track.id !== trackId));
  };

  const handlePlayQueuedTrack = (track: Track) => {
    setQueue((previous) => previous.filter((item) => item.id !== track.id));
    if (track.id === currentTrack?.id) {
      restartCurrentTrack();
      return;
    }
    void handlePlayTrack(track, true);
  };

  const handlePreviousTrack = () => {
    if (tracks.length === 0) return;

    // A short press on Previous restarts the current track, as expected by
    // common music players; a second press moves to the previous item.
    if (currentTrack && currentTime > 3) {
      audioEngine.seek(0);
      setCurrentTime(0);
      return;
    }

    const currentIndex = tracks.findIndex((t) => t.id === currentTrack?.id);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    void handlePlayTrack(tracks[prevIndex], true);
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
  const handleDownloadTrack = async (track: Track) => {
    if (track.isVipOnlyDownload && !isUserVip) {
      setVipModalTrackTitle(track.title);
      setIsVipModalOpen(true);
      return;
    }

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const headers: Record<string, string> = {};
      if (sessionData.session?.access_token) {
        headers.Authorization = `Bearer ${sessionData.session.access_token}`;
      }

      const downloadUrl = `https://irkdzjizhwxbmnnfyqsx.supabase.co/functions/v1/audio-gateway?track_id=${encodeURIComponent(track.id)}&mode=download`;
      const response = await fetch(downloadUrl, { method: 'GET', headers });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setVipModalTrackTitle(track.title);
          setIsVipModalOpen(true);
          return;
        }
        throw new Error(response.status === 404 ? 'فایل این آهنگ در Storage پیدا نشد.' : 'دریافت فایل آهنگ ناموفق بود.');
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const safeTitle = track.title.replace(/[^a-zA-Z0-9_-]+/g, '_') || 'Track';
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = `DJ_Caspian_${safeTitle}.mp3`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
      showToast(`دانلود فایل اصلی ${track.title} آغاز شد.`, 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'دانلود آهنگ انجام نشد.', 'error');
    }
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

  const handleUpdateUser = async (updatedUser: UserAccount) => {
    const { error } = await supabase.from('profiles').update({ display_name: updatedUser.displayName.trim() }).eq('id', updatedUser.id);
    if (error) {
      showToast('ذخیره پروفایل در سرور ناموفق بود: ' + error.message, 'error');
      return;
    }
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    showToast('پروفایل شما در دیتابیس ذخیره شد.', 'success');
  };

  // -------------------------------------------------------------
  // DJ CASPIAN ADMIN ACTIONS
  // -------------------------------------------------------------
  const handleAddTrack = async (input: Parameters<typeof uploadTrackAssets>[0]) => {
    const newTrack = await uploadTrackAssets(input);
    setTracks((prev) => [newTrack, ...prev]);

    // Notify installed Android apps after the track has been safely saved.
    void supabase.functions.invoke('send-push-notification', {
      body: {
        title: '🎵 آهنگ جدید در DJ Caspian',
        body: `${newTrack.title} از ${newTrack.artist} منتشر شد.`,
        url: '/',
      },
    }).then(({ error, data }) => {
      if (error) {
        showToast('آهنگ منتشر شد، اما اعلان ارسال نشد: ' + error.message, 'error');
      } else if (data?.sent === 0) {
        showToast('آهنگ منتشر شد؛ هنوز دستگاهی برای دریافت اعلان ثبت نشده است.', 'info');
      } else {
        showToast(`اعلان آهنگ به ${data?.sent ?? 0} دستگاه ارسال شد.`, 'success');
      }
    });

    return newTrack;
  };

  const handleDeleteTrack = async (trackId: string) => {
    if (currentUser?.role !== 'admin') {
      showToast('دسترسی مدیریت لازم است.', 'error');
      return;
    }
    const track = tracks.find((item) => item.id === trackId);
    if (!track) return;

    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) {
      showToast('برای حذف آهنگ باید دوباره وارد حساب مدیریت شوید.', 'error');
      return;
    }

    const { data, error } = await supabase.functions.invoke('track-delete', {
      body: { track_id: trackId },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (error || !data?.success) {
      showToast('حذف آهنگ کامل نشد: ' + (data?.error || error?.message || 'خطای نامشخص'), 'error');
      return;
    }

    setTracks((prev) => prev.filter((item) => item.id !== trackId));
    if (currentTrack?.id === trackId) {
      audioEngine.stop();
      setIsPlaying(false);
      setCurrentTrack(tracks.find((item) => item.id !== trackId) || null);
    }
    showToast('آهنگ و فایل‌های وابسته با موفقیت حذف شدند.', 'success');
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

  const handleCreatePersonalPlaylist = (title: string, description: string) => {
    if (!currentUser) {
      showToast('برای ساخت پلی‌لیست شخصی ابتدا وارد حساب کاربری شو.', 'info');
      setIsAuthModalOpen(true);
      return;
    }
    const created: Playlist = {
      id: `personal:${crypto.randomUUID()}`,
      title,
      description,
      coverUrl: tracks[0]?.coverUrl || '',
      trackIds: [],
    };
    const next = [created, ...personalPlaylists];
    setPersonalPlaylists(next);
    localStorage.setItem(`caspian_personal_playlists_${currentUser.id}`, JSON.stringify(next));
    setSelectedPlaylist(created);
    showToast('پلی‌لیست شخصی ساخته شد.', 'success');
  };

  const handleDeletePersonalPlaylist = (playlistId: string) => {
    if (!currentUser || !playlistId.startsWith('personal:')) return;
    const next = personalPlaylists.filter(item => item.id !== playlistId);
    setPersonalPlaylists(next);
    localStorage.setItem(`caspian_personal_playlists_${currentUser.id}`, JSON.stringify(next));
    if (selectedPlaylist?.id === playlistId) setSelectedPlaylist(null);
    showToast('پلی‌لیست شخصی حذف شد.', 'success');
  };

  const handleAddTrackToPersonalPlaylist = (playlistId: string, trackId: string) => {
    if (!currentUser || !playlistId.startsWith('personal:')) return;
    const next = personalPlaylists.map(item => item.id === playlistId && !item.trackIds.includes(trackId)
      ? { ...item, trackIds: [...item.trackIds, trackId], coverUrl: item.coverUrl || tracks.find(t => t.id === trackId)?.coverUrl || '' }
      : item);
    setPersonalPlaylists(next);
    localStorage.setItem(`caspian_personal_playlists_${currentUser.id}`, JSON.stringify(next));
    setSelectedPlaylist(next.find(item => item.id === playlistId) || null);
    showToast('آهنگ به پلی‌لیست اضافه شد.', 'success');
  };

  const handleRemoveTrackFromPersonalPlaylist = (playlistId: string, trackId: string) => {
    if (!currentUser || !playlistId.startsWith('personal:')) return;
    const next = personalPlaylists.map(item => item.id === playlistId
      ? { ...item, trackIds: item.trackIds.filter(id => id !== trackId) }
      : item);
    setPersonalPlaylists(next);
    localStorage.setItem(`caspian_personal_playlists_${currentUser.id}`, JSON.stringify(next));
    setSelectedPlaylist(next.find(item => item.id === playlistId) || null);
  };

  const handleUpdateTicketStatus = async (ticketId: string, status: 'approved' | 'rejected', adminNote?: string) => {
    const target = tickets.find((ticket) => ticket.id === ticketId);
    if (!target || currentUser?.role !== 'admin' || !target.userId) {
      showToast('تیکت یا دسترسی معتبر نیست.', 'error');
      return;
    }

    const { error } = await supabase.rpc('review_vip_ticket', {
      p_ticket_id: ticketId,
      p_status: status,
      p_admin_note: adminNote || null,
    });
    if (error) {
      showToast('ثبت نتیجه بررسی ناموفق بود: ' + error.message, 'error');
      return;
    }

    const reviewDate = new Date().toISOString();
    setTickets((previous) => previous.map((ticket) =>
      ticket.id === ticketId ? { ...ticket, status, adminNote, reviewDate } : ticket
    ));
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

    if (error || !data) {
      if (ticket.receiptPath) {
        const { error: cleanupError } = await supabase.storage.from('receipts').remove([ticket.receiptPath]);
        if (cleanupError) console.error('Could not clean up orphan VIP receipt:', cleanupError.message);
      }
      throw new Error('ثبت تیکت در سرور ناموفق بود: ' + (error?.message || 'No record returned'));
    }

    const created = { ...ticket, id: data.id, createdAt: data.created_at };
    setTickets((previous) => [created, ...previous]);
    return created;
  };

  // VIP access is read from Supabase auth/profile state only.
  // There is intentionally no client-side VIP activation shortcut.


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

  if (clockNow < updateBreakEndsAt) return <UpdateBreak endsAt={updateBreakEndsAt} />;

  return (
    <div className="flex h-screen bg-[#0d0d0d] text-white font-sans overflow-hidden select-none" dir="rtl">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <AppPromoModal />
      <NotificationPermissionPrompt />
      <ReleaseAnnouncement />

      {/* Spotify Sidebar (Desktop + Mobile Drawer) */}
      <Sidebar
        currentView={currentView}
        onNavigate={navigateToView}
        playlists={allPlaylists}
        onSelectPlaylist={(pl) => {
          setSelectedPlaylist(pl);
          setCurrentView('library');
          setIsMobileMenuOpen(false);
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
          onNavigate={(view) => { if (view !== 'library') setSelectedPlaylist(null); setCurrentView(view); }}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          currentUser={currentUser}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          isUserVip={isUserVip}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Scrollable View Content */}
        <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain pb-28">\n          <PWAInstallBanner />
          {currentView === 'home' && (
            <HomeView
              tracks={tracks}
              playlists={allPlaylists}
              currentTrackId={currentTrack?.id || null}
              isPlaying={isPlaying}
              likedTrackIds={likedTrackIds}
              recentTrackIds={recentTrackIds}
              isUserVip={isUserVip}
              onPlayTrack={handlePlayTrack}
              onToggleLike={handleToggleLike}
              onDownloadTrack={handleDownloadTrack}
              onQueueTrack={handleAddToQueue}
              onNavigateToSupport={() => setCurrentView('support')}
              onNavigateToAbout={() => setCurrentView('about')}
              onSelectPlaylist={(pl) => {
                setSelectedPlaylist(pl);
                setCurrentView('library');
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
              playlists={allPlaylists}
              likedTrackIds={likedTrackIds}
              currentTrackId={currentTrack?.id || null}
              isPlaying={isPlaying}
              isUserVip={isUserVip}
              onPlayTrack={handlePlayTrack}
              onToggleLike={handleToggleLike}
              onDownloadTrack={handleDownloadTrack}
              onSelectPlaylist={(pl) => setSelectedPlaylist(pl)}
              selectedPlaylist={selectedPlaylist}
              onBackFromPlaylist={() => setSelectedPlaylist(null)}
              onCreatePlaylist={handleCreatePersonalPlaylist}
              onDeletePersonalPlaylist={handleDeletePersonalPlaylist}
              onAddTrackToPlaylist={handleAddTrackToPersonalPlaylist}
              onRemoveTrackFromPlaylist={handleRemoveTrackFromPersonalPlaylist}
            />
          )}

          {currentView === 'liked' && (
            <LibraryView
              tracks={tracks}
              playlists={allPlaylists}
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
                  className="py-2.5 px-6 rounded-full bg-[#d6b45c] text-black font-bold text-xs"
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

          {currentView === 'community' && currentUser?.role === 'admin' && <ProfilesView />}

          {currentView === 'experience' && (
            <ListeningHub
              tracks={tracks}
              recentTrackIds={recentTrackIds}
              likedTrackIds={likedTrackIds}
              currentTrack={currentTrack}
              currentTime={currentTime}
              isPlaying={isPlaying}
              user={currentUser}
              onPlayTrack={handlePlayTrack}
              onSyncPlayback={handleRoomSync}
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
                    className="py-2.5 px-6 rounded-full bg-[#d6b45c] text-black font-bold text-xs"
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
        queue={queue}
        onRemoveQueueTrack={handleRemoveFromQueue}
        onPlayQueuedTrack={handlePlayQueuedTrack}
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
      <AppUpdatePrompt />
    </div>
  );
}
