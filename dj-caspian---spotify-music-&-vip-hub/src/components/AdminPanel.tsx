import React, { useState } from 'react';
import { 
  Shield, Music, Ticket, Plus, Trash2, CheckCircle, XCircle, 
  Upload, Play, Pause, Headphones, DollarSign, Users, Sparkles, 
  Eye, RefreshCw, Key, Lock, ArrowRight, Check, AlertCircle, 
  FileAudio, LogIn, ListMusic, Image as ImageIcon, Volume2
} from 'lucide-react';
import { Track, VipTicket, Playlist, UserAccount } from '../types';
import { DJ_CASPIAN_INFO } from '../data/initialData';
import confetti from 'canvas-confetti';

interface AdminPanelProps {
  currentUser: UserAccount | null;
  onOpenAuthModal: () => void;
  tracks: Track[];
  playlists: Playlist[];
  tickets: VipTicket[];
  onAddTrack: (track: Track) => void;
  onDeleteTrack: (trackId: string) => void;
  onAddPlaylist: (playlist: Playlist) => void;
  onDeletePlaylist: (playlistId: string) => void;
  onUpdateTicketStatus: (ticketId: string, status: 'approved' | 'rejected', adminNote?: string) => void;
  onResetToDefault: () => void;
  onShowToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  currentPlayingTrackId: string | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  onOpenAuthModal,
  tracks,
  playlists,
  tickets,
  onAddTrack,
  onDeleteTrack,
  onAddPlaylist,
  onDeletePlaylist,
  onUpdateTicketStatus,
  onResetToDefault,
  onShowToast,
  currentPlayingTrackId,
  isPlaying,
  onPlayTrack,
}) => {
  const isOwnerAdmin = currentUser?.role === 'admin' && currentUser?.username === 'AminJodaie';

  // Active sub-tab in Admin
  const [activeTab, setActiveTab] = useState<'tracks' | 'playlists' | 'tickets'>('tracks');
  const [ticketFilter, setTicketFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // -------------------------------------------------------------
  // NEW TRACK UPLOAD & METADATA MANAGEMENT MODAL
  // -------------------------------------------------------------
  const [isAddTrackOpen, setIsAddTrackOpen] = useState(false);
  const [uploadStep, setUploadStep] = useState<1 | 2>(1); // Step 1: Audio file, Step 2: Metadata panel
  
  const [newTitle, setNewTitle] = useState('');
  const [newArtist, setNewArtist] = useState('DJ Caspian');
  const [newAlbum, setNewAlbum] = useState('Exclusive Drops 2026');
  const [newGenre, setNewGenre] = useState('Melodic Techno');
  const [newBpm, setNewBpm] = useState(128);
  const [newDuration, setNewDuration] = useState(210);
  const [newCoverUrl, setNewCoverUrl] = useState('');
  const [newAudioUrl, setNewAudioUrl] = useState('');
  const [newAudioFileName, setNewAudioFileName] = useState('');
  const [newSynthPreset, setNewSynthPreset] = useState<'festival_drop' | 'deep_groove' | 'persian_club' | 'melodic_techno' | 'tech_house'>('persian_club');
  const [newIsVipOnly, setNewIsVipOnly] = useState(true);
  const [newDescription, setNewDescription] = useState('');

  // -------------------------------------------------------------
  // NEW PLAYLIST MODAL
  // -------------------------------------------------------------
  const [isNewPlaylistOpen, setIsNewPlaylistOpen] = useState(false);
  const [newPlTitle, setNewPlTitle] = useState('');
  const [newPlDesc, setNewPlDesc] = useState('');
  const [newPlCoverUrl, setNewPlCoverUrl] = useState('');
  const [selectedTrackIdsForPl, setSelectedTrackIdsForPl] = useState<string[]>([]);

  // Presets
  const presetCovers = [
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&auto=format&fit=crop&q=80',
  ];

  // Admin note for ticket review
  const [editingTicketNotes, setEditingTicketNotes] = useState<Record<string, string>>({});
  const [selectedReceiptImage, setSelectedReceiptImage] = useState<string | null>(null);

  // Audio Upload Handler
  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewAudioFileName(file.name);
      const url = URL.createObjectURL(file);
      setNewAudioUrl(url);

      // Auto-populate title if empty from filename
      if (!newTitle) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        setNewTitle(cleanName);
      }

      onShowToast(`فایل صوتی ${file.name} بارگذاری شد. به مرحله تنظیمات منتقل می‌شوید...`, 'success');
      // Automatically advance to Step 2 (Metadata & Profile Management panel!)
      setUploadStep(2);
    }
  };

  // Cover Image Upload Handler
  const handleCoverFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewCoverUrl(reader.result as string);
        onShowToast('تصویر پروفایل کاور با موفقیت انتخاب شد', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  // Final Publish Track Handler
  const handlePublishTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      onShowToast('عنوان قطعه الزامی است', 'error');
      return;
    }

    const cover = newCoverUrl.trim() || presetCovers[Math.floor(Math.random() * presetCovers.length)];
    const trackId = 'caspian-track-' + Date.now();

    const createdTrack: Track = {
      id: trackId,
      title: newTitle.trim(),
      artist: newArtist.trim() || 'DJ Caspian',
      album: newAlbum.trim() || 'Caspian Singles',
      genre: newGenre,
      bpm: Number(newBpm) || 128,
      duration: Number(newDuration) || 210,
      coverUrl: cover,
      audioUrl: newAudioUrl || undefined,
      synthPreset: newSynthPreset,
      plays: 1,
      likes: 1,
      releaseDate: new Date().toISOString().split('T')[0],
      isVipOnlyDownload: newIsVipOnly,
      description: newDescription.trim() || 'قطعه اختصاصی جدید آپلود شده توسط DJ Caspian',
      fileSize: '10.5 MB (MP3 320k)',
    };

    onAddTrack(createdTrack);
    
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    onShowToast(`آهنگ "${createdTrack.title}" با موفقیت روی سایت منتشر شد و همه می‌توانند آن را گوش دهند!`, 'success');
    setIsAddTrackOpen(false);

    // Reset upload form
    setNewTitle('');
    setNewCoverUrl('');
    setNewAudioUrl('');
    setNewAudioFileName('');
    setNewDescription('');
    setUploadStep(1);
  };

  // Create Playlist Handler
  const handlePublishPlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlTitle.trim()) {
      onShowToast('عنوان پلی‌لیست الزامی است', 'error');
      return;
    }

    const newPl: Playlist = {
      id: 'pl-official-' + Date.now(),
      title: newPlTitle.trim(),
      description: newPlDesc.trim() || 'پلی‌لیست رسمی DJ Caspian',
      coverUrl: newPlCoverUrl.trim() || (tracks[0]?.coverUrl || presetCovers[0]),
      trackIds: selectedTrackIdsForPl,
    };

    onAddPlaylist(newPl);
    onShowToast(`پلی‌لیست "${newPl.title}" ساخته شد و در سایت قرار گرفت!`, 'success');
    setIsNewPlaylistOpen(false);
    setNewPlTitle('');
    setNewPlDesc('');
    setNewPlCoverUrl('');
    setSelectedTrackIdsForPl([]);
  };

  // Metrics Calculations
  const pendingCount = tickets.filter((t) => t.status === 'pending').length;
  const approvedCount = tickets.filter((t) => t.status === 'approved').length;
  const totalPlays = tracks.reduce((acc, t) => acc + (t.plays || 0), 0);

  const filteredTickets = tickets.filter((t) => {
    if (ticketFilter === 'all') return true;
    return t.status === ticketFilter;
  });

  // Guard: If not AminJodaie, show restricted room
  if (!isOwnerAdmin) {
    return (
      <div className="p-4 sm:p-8 max-w-lg mx-auto min-h-[60vh] flex items-center justify-center animate-in fade-in" dir="rtl">
        <div className="w-full bg-gradient-to-b from-[#1c1c1c] to-[#121212] border border-neutral-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">اتاق مدیریت DJ Caspian</h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              این بخش منحصراً مخصوص مالک سایت است و تنها پس از ورود با حساب کاربری اختصاصی <strong className="text-white font-mono">AminJodaie</strong> قابل دسترسی می‌باشد.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenAuthModal}
            className="w-full py-3.5 px-6 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#1db954]/20"
          >
            <LogIn className="w-4 h-4" />
            <span>ورود به حساب کاربری</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300" dir="rtl">
      
      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={DJ_CASPIAN_INFO.avatarUrl}
              alt="DJ Caspian"
              className="w-14 h-14 rounded-2xl object-cover border-2 border-[#1db954]"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#1db954] rounded-full flex items-center justify-center text-black font-black text-[10px]">
              ✓
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">اتاق مدیریت دی‌جی کاسپین</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#1db954]/20 text-[#1db954] border border-[#1db954]/40 text-[11px] font-bold">
                مدیر کل (AminJodaie)
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              آپلود آهنگ جدید، ساخت پلی‌لیست‌های رسمی و بررسی تیکت‌های واریزی VIP
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              setUploadStep(1);
              setIsAddTrackOpen(true);
            }}
            className="py-2.5 px-4 rounded-xl bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-lg shadow-[#1db954]/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ آپلود آهنگ جدید</span>
          </button>

          <button
            onClick={() => setIsNewPlaylistOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer border border-neutral-700"
          >
            <ListMusic className="w-4 h-4 text-[#1db954]" />
            <span>+ ساخت پلی‌لیست</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#181818] border border-neutral-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>آهنگ‌های منتشر شده</span>
            <Music className="w-4 h-4 text-[#1db954]" />
          </div>
          <div className="text-2xl font-black text-white">{tracks.length}</div>
          <div className="text-[11px] text-neutral-500 mt-0.5">در دسترس عموم</div>
        </div>

        <div className="bg-[#181818] border border-neutral-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>پلی‌لیست‌های رسمی</span>
            <ListMusic className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400">{playlists.length}</div>
          <div className="text-[11px] text-neutral-500 mt-0.5">ساخته شده توسط شما</div>
        </div>

        <div className="bg-[#181818] border border-neutral-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>فیش‌های در انتظار بررسی</span>
            <Ticket className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{pendingCount}</div>
          <div className="text-[11px] text-amber-500/80 mt-0.5">نیازمند تایید فیش</div>
        </div>

        <div className="bg-[#181818] border border-neutral-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>کاربران VIP فعال</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{approvedCount}</div>
          <div className="text-[11px] text-neutral-500 mt-0.5">تایید شده توسط شما</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-neutral-800 pb-2">
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('tracks')}
            className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'tracks'
                ? 'bg-[#1db954] text-black shadow-lg shadow-[#1db954]/20'
                : 'text-neutral-400 hover:text-white bg-[#181818]'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>آهنگ‌ها و استودیوی آپلود ({tracks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('playlists')}
            className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'playlists'
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                : 'text-neutral-400 hover:text-white bg-[#181818]'
            }`}
          >
            <ListMusic className="w-4 h-4" />
            <span>پلی‌لیست‌های رسمی سایت ({playlists.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'tickets'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'text-neutral-400 hover:text-white bg-[#181818]'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>بررسی فیش‌های واریزی ({tickets.length})</span>
          </button>
        </div>

        <button
          onClick={onResetToDefault}
          className="text-xs text-neutral-500 hover:text-neutral-300 flex items-center gap-1 cursor-pointer shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">بازنشانی سیستم</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: TRACKS MANAGEMENT */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'tracks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">قطعات فعال روی سایت ({tracks.length})</h3>
            <button
              onClick={() => {
                setUploadStep(1);
                setIsAddTrackOpen(true);
              }}
              className="py-2 px-4 rounded-xl bg-[#1db954] text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-[#1ed760]"
            >
              <Plus className="w-4 h-4" />
              <span>آپلود قطعه جدید</span>
            </button>
          </div>

          {tracks.length === 0 ? (
            <div className="bg-[#181818] border border-dashed border-neutral-700 rounded-3xl p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-[#1db954]">
                <Music className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-white">آرشیف آهنگ‌های سایت خالی است</h4>
                <p className="text-xs text-neutral-400 max-w-md mx-auto">
                  تمامی آهنگ‌های نمونه قبلی با درخواست شما پاک شدند. اکنون می‌توانید قطعات و ریمیکس‌های اختصاصی خود را آپلود کنید تا برای عموم در سایت نمایش داده شود.
                </p>
              </div>
              <button
                onClick={() => {
                  setUploadStep(1);
                  setIsAddTrackOpen(true);
                }}
                className="py-3 px-6 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-xs transition-all shadow-lg shadow-[#1db954]/20 cursor-pointer"
              >
                + شروع آپلود اولین آهنگ
              </button>
            </div>
          ) : (
            <div className="bg-[#181818] border border-neutral-800 rounded-2xl divide-y divide-neutral-800 overflow-hidden">
              {tracks.map((track, idx) => {
                const isCurrent = currentPlayingTrackId === track.id && isPlaying;

                return (
                  <div
                    key={track.id}
                    className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-[#202020] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-neutral-500 text-xs font-mono w-5 text-center shrink-0">
                        {idx + 1}
                      </span>

                      <div className="relative group shrink-0">
                        <img
                          src={track.coverUrl}
                          alt={track.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <button
                          onClick={() => onPlayTrack(track)}
                          className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg cursor-pointer text-white"
                        >
                          {isCurrent ? <Pause className="w-5 h-5 text-[#1db954]" /> : <Play className="w-5 h-5 ml-0.5" />}
                        </button>
                      </div>

                      <div className="min-w-0">
                        <div className="font-bold text-white text-sm truncate flex items-center gap-1.5">
                          <span className={isCurrent ? 'text-[#1db954]' : ''}>{track.title}</span>
                          {track.isVipOnlyDownload && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[10px] font-semibold border border-amber-500/30">
                              VIP
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-neutral-400 flex items-center gap-2 mt-0.5">
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
                        onClick={() => onPlayTrack(track)}
                        className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer"
                        title={isCurrent ? 'توقف' : 'پخش آهنگ'}
                      >
                        {isCurrent ? <Pause className="w-4 h-4 text-[#1db954]" /> : <Play className="w-4 h-4 ml-0.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`آیا از حذف آهنگ "${track.title}" از روی سایت اطمینان دارید؟`)) {
                            onDeleteTrack(track.id);
                            onShowToast(`آهنگ "${track.title}" با موفقیت حذف شد`, 'info');
                          }
                        }}
                        className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40 transition-colors cursor-pointer"
                        title="حذف قطعه از سایت"
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

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: PLAYLISTS MANAGEMENT */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'playlists' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">پلی‌لیست‌های رسمی DJ Caspian ({playlists.length})</h3>
            <button
              onClick={() => setIsNewPlaylistOpen(true)}
              className="py-2 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>ساخت پلی‌لیست رسمی جدید</span>
            </button>
          </div>

          {playlists.length === 0 ? (
            <div className="bg-[#181818] border border-neutral-800 rounded-2xl p-12 text-center text-neutral-400 space-y-3">
              <ListMusic className="w-12 h-12 text-neutral-600 mx-auto" />
              <h4 className="text-white font-bold text-base">هیچ پلی‌لیست رسمی ساخته نشده است</h4>
              <p className="text-xs text-neutral-500 max-w-md mx-auto">
                می‌توانید برای سِت‌های ویژه، مهمانی‌ها یا پادکست‌های رادیویی پلی‌لیست رسمی بسازید تا در صفحه اصلی و سایدبار برای همه نمایش داده شود.
              </p>
              <button
                onClick={() => setIsNewPlaylistOpen(true)}
                className="py-2.5 px-6 rounded-full bg-cyan-500 text-black font-bold text-xs cursor-pointer"
              >
                ایجاد پلی‌لیست جدید
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {playlists.map((pl) => (
                <div
                  key={pl.id}
                  className="bg-[#181818] border border-neutral-800 rounded-2xl p-4 space-y-3"
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-900">
                    <img
                      src={pl.coverUrl}
                      alt={pl.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-sm truncate">{pl.title}</h4>
                      <button
                        onClick={() => {
                          if (confirm(`آیا از حذف پلی‌لیست "${pl.title}" اطمینان دارید؟`)) {
                            onDeletePlaylist(pl.id);
                            onShowToast(`پلی‌لیست "${pl.title}" حذف شد`, 'info');
                          }
                        }}
                        className="text-neutral-500 hover:text-red-400 p-1"
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

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: TICKETS REVIEW (ADMIN-EXCLUSIVE) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-base font-bold text-white">
              بررسی فیش‌ها و فعال‌سازی اشتراک VIP کاربران ({tickets.length})
            </h3>

            {/* Filter Pills */}
            <div className="flex gap-1.5">
              {(
                [
                  { id: 'all', label: `همه (${tickets.length})` },
                  { id: 'pending', label: `در انتظار بررسی (${pendingCount})` },
                  { id: 'approved', label: `تایید شده VIP (${approvedCount})` },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setTicketFilter(f.id)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    ticketFilter === f.id
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'bg-[#202020] text-neutral-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {filteredTickets.length === 0 ? (
            <div className="bg-[#181818] border border-neutral-800 rounded-2xl p-10 text-center text-neutral-400 text-sm">
              هیچ فیشی در این دسته وجود ندارد.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTickets.map((ticket) => {
                const noteVal = editingTicketNotes[ticket.id] ?? ticket.adminNote ?? '';
                const isPending = ticket.status === 'pending';

                return (
                  <div
                    key={ticket.id}
                    className={`bg-[#181818] border rounded-2xl p-5 space-y-4 ${
                      isPending ? 'border-amber-500/40 bg-amber-950/10' : 'border-neutral-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-black px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-700 text-amber-400">
                          {ticket.id}
                        </span>
                        <div>
                          <div className="font-bold text-white text-sm">{ticket.userName}</div>
                          <div className="text-xs text-neutral-400 font-mono" dir="ltr">
                            {ticket.userContact}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-neutral-900 text-emerald-400 border border-emerald-500/30">
                          {ticket.amount}
                        </span>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-300">
                          {ticket.method === 'card' ? 'کارت به کارت' : `تتر (${ticket.cryptoNetwork || 'USDT'})`}
                        </span>
                      </div>
                    </div>

                    {/* Details row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs p-3 bg-neutral-900/80 rounded-xl border border-neutral-800">
                      <div>
                        <span className="text-neutral-500">کد رهگیری / هش تراکنش (TxID):</span>
                        <div className="font-mono text-white mt-0.5 break-all select-all" dir="ltr">
                          {ticket.txHashOrReceiptNo}
                        </div>
                      </div>
                      <div>
                        <span className="text-neutral-500">تاریخ ثبت:</span>
                        <div className="text-neutral-300 mt-0.5">{ticket.createdAt}</div>
                      </div>
                      {ticket.notes && (
                        <div className="sm:col-span-2">
                          <span className="text-neutral-500">توضیحات ارسال شده:</span>
                          <div className="text-neutral-200 mt-0.5">{ticket.notes}</div>
                        </div>
                      )}
                    </div>

                    {/* Attached Receipt Image */}
                    {ticket.receiptImageData && (
                      <div className="space-y-1">
                        <span className="text-xs text-neutral-400 font-medium">تصویر رسید واریزی:</span>
                        <div>
                          <img
                            src={ticket.receiptImageData}
                            alt="رسید واریزی"
                            onClick={() => setSelectedReceiptImage(ticket.receiptImageData!)}
                            className="max-h-40 rounded-xl border border-neutral-700 cursor-pointer hover:opacity-90"
                          />
                          <span className="text-[10px] text-neutral-500 block mt-0.5">برای مشاهده تمام‌صفحه کلیک کنید</span>
                        </div>
                      </div>
                    )}

                    {/* Admin Actions */}
                    <div className="pt-3 border-t border-neutral-800 space-y-3">
                      <div>
                        <label className="text-xs text-neutral-400 block mb-1">
                          متن پاسخ شما به کاربر:
                        </label>
                        <input
                          type="text"
                          placeholder="مثلاً: فیش تایید گردید و دسترسی VIP فعال شد."
                          value={noteVal}
                          onChange={(e) =>
                            setEditingTicketNotes((prev) => ({ ...prev, [ticket.id]: e.target.value }))
                          }
                          className="w-full bg-[#242424] border border-neutral-700 focus:border-[#1db954] focus:outline-none rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const defaultMsg = 'فیش واریزی بررسی و تایید شد. دسترسی VIP نامحدود شما فعال گردید.';
                            onUpdateTicketStatus(ticket.id, 'approved', noteVal || defaultMsg);
                            onShowToast(`تیکت ${ticket.id} تایید شد و کاربر VIP گردید`, 'success');
                          }}
                          className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            ticket.status === 'approved'
                              ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                              : 'bg-[#1db954] hover:bg-[#1ed760] text-black shadow-lg shadow-[#1db954]/20'
                          }`}
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>{ticket.status === 'approved' ? 'تایید شده (VIP فعال است)' : 'تایید پرداخت و فعال‌سازی VIP'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const defaultMsg = 'مدرک واریزی ارسالی نامعتبر است.';
                            onUpdateTicketStatus(ticket.id, 'rejected', noteVal || defaultMsg);
                            onShowToast(`تیکت ${ticket.id} رد شد`, 'info');
                          }}
                          className={`py-2 px-3.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                            ticket.status === 'rejected'
                              ? 'bg-red-900/30 text-red-400 border border-red-500/50'
                              : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                          }`}
                        >
                          <XCircle className="w-4 h-4" />
                          <span>رد فیش</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* FULL TRACK UPLOAD & METADATA MANAGEMENT MODAL */}
      {/* ------------------------------------------------------------- */}
      {isAddTrackOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in select-none" dir="rtl">
          <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#1c1c1c] via-[#161616] to-[#0f0f0f] border border-neutral-700 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#1db954] text-black flex items-center justify-center font-bold">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">استودیوی انتشار آهنگ DJ Caspian</h3>
                  <div className="text-[11px] text-neutral-400">
                    {uploadStep === 1 ? 'گام اول: بارگذاری فایل صوتی' : 'گام دوم: پنل مدیریت عنوان، پروفایل و مشخصات قطعه'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsAddTrackOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* STEP 1: AUDIO UPLOAD */}
            {uploadStep === 1 && (
              <div className="space-y-6 pt-5">
                <div className="border-2 border-dashed border-[#1db954]/50 hover:border-[#1db954] bg-[#222222]/60 rounded-3xl p-8 text-center transition-colors">
                  <div className="w-16 h-16 rounded-full bg-[#1db954]/20 border border-[#1db954]/40 flex items-center justify-center mx-auto text-[#1db954] mb-3">
                    <FileAudio className="w-8 h-8" />
                  </div>

                  <h4 className="text-base font-bold text-white mb-1">
                    انتخاب فایل صوتی آهنگ (MP3 / WAV)
                  </h4>
                  <p className="text-xs text-neutral-400 max-w-md mx-auto mb-4">
                    فایل موزیک خود را از کامپیوتر یا موبایل انتخاب کنید تا مستقیماً به استودیو اضافه شود.
                  </p>

                  <label className="inline-flex items-center gap-2 py-3 px-6 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-xs cursor-pointer shadow-lg shadow-[#1db954]/20 transition-all hover:scale-105">
                    <Upload className="w-4 h-4" />
                    <span>انتخاب فایل موزیک از دستگاه</span>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioFileUpload}
                      className="hidden"
                    />
                  </label>

                  {newAudioFileName && (
                    <div className="mt-4 p-3 bg-neutral-900 rounded-xl border border-neutral-700 text-xs text-emerald-400 font-mono">
                      ✓ فایل انتخاب شده: {newAudioFileName}
                    </div>
                  )}
                </div>

                <div className="p-4 bg-neutral-900/80 rounded-2xl border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-neutral-300 font-bold">
                    <span>یا تولید الگوی ریتم و درامز زنده دی‌جی کاسپین:</span>
                    <span className="text-[#1db954]">موتور سنتز هوشمند</span>
                  </div>
                  <select
                    value={newSynthPreset}
                    onChange={(e) => setNewSynthPreset(e.target.value as any)}
                    className="w-full bg-[#242424] border border-neutral-700 rounded-xl p-2.5 text-xs text-white"
                  >
                    <option value="persian_club">Persian Club (پرشین کلاب شاد و درامز پرانرژی)</option>
                    <option value="festival_drop">Festival Drop (کیک عمیق فستیوالی ۱۲۸ BPM)</option>
                    <option value="deep_groove">Deep Groove (دیپ هاوس نرم ساحلی)</option>
                    <option value="melodic_techno">Melodic Techno (تکنو ملودیک فضایی)</option>
                    <option value="tech_house">Tech House (تک هاوس ریتمیک کلاب)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setUploadStep(2)}
                  className="w-full py-3.5 px-6 rounded-full bg-white hover:bg-neutral-200 text-black font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span>ادامه به پنل تنظیم مشخصات و تصویر پروفایل آهنگ ←</span>
                </button>
              </div>
            )}

            {/* STEP 2: METADATA & PROFILE MANAGEMENT PANEL */}
            {uploadStep === 2 && (
              <form onSubmit={handlePublishTrack} className="space-y-4 pt-4">
                
                {/* Audio file indicator */}
                {newAudioFileName && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs text-emerald-300">
                    <div className="flex items-center gap-2 truncate">
                      <FileAudio className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span className="truncate">فایل متصل شده: {newAudioFileName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadStep(1)}
                      className="text-[11px] text-neutral-400 hover:text-white underline shrink-0"
                    >
                      تغییر فایل
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-neutral-300 block mb-1 font-medium">عنوان آهنگ (Track Title): *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: Caspian Sunset (Extended Mix)"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full bg-[#242424] border border-neutral-700 focus:border-[#1db954] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-neutral-300 block mb-1 font-medium">نام آرتیست / پرودیوسر:</label>
                    <input
                      type="text"
                      value={newArtist}
                      onChange={(e) => setNewArtist(e.target.value)}
                      className="w-full bg-[#242424] border border-neutral-700 focus:border-[#1db954] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-neutral-300 block mb-1 font-medium">سبک / ژانر:</label>
                    <select
                      value={newGenre}
                      onChange={(e) => setNewGenre(e.target.value)}
                      className="w-full bg-[#242424] border border-neutral-700 focus:border-[#1db954] focus:outline-none rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="Melodic Techno">Melodic Techno</option>
                      <option value="Persian Club">Persian Club</option>
                      <option value="Deep House">Deep House</option>
                      <option value="Persian EDM">Persian EDM</option>
                      <option value="Tech House">Tech House</option>
                      <option value="Tribal House">Tribal House</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-neutral-300 block mb-1 font-medium">سرعت (BPM):</label>
                    <input
                      type="number"
                      value={newBpm}
                      onChange={(e) => setNewBpm(Number(e.target.value))}
                      className="w-full bg-[#242424] border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white font-mono text-center"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-neutral-300 block mb-1 font-medium">مدت (ثانیه):</label>
                    <input
                      type="number"
                      value={newDuration}
                      onChange={(e) => setNewDuration(Number(e.target.value))}
                      className="w-full bg-[#242424] border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white font-mono text-center"
                    />
                  </div>
                </div>

                {/* Profile Cover Image Upload Section */}
                <div className="space-y-2 bg-[#202020] p-4 rounded-2xl border border-neutral-700">
                  <label className="text-xs text-white font-bold block flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#1db954]" />
                    <span>تصویر پروفایل و کاور آهنگ:</span>
                  </label>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {newCoverUrl ? (
                      <img
                        src={newCoverUrl}
                        alt="پیش‌نمایش کاور"
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-[#1db954] shadow-md"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-500 text-xs">
                        بدون تصویر
                      </div>
                    )}

                    <div className="flex-1 space-y-2 w-full">
                      <label className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold cursor-pointer border border-neutral-600">
                        <Upload className="w-3.5 h-3.5" />
                        <span>بارگذاری عکس کاور از کامپیوتر</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverFileUpload}
                          className="hidden"
                        />
                      </label>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-neutral-500">یا انتخاب از گالری آماده:</span>
                        {presetCovers.map((pUrl, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setNewCoverUrl(pUrl)}
                            className="w-6 h-6 rounded-md overflow-hidden border border-neutral-700 hover:border-[#1db954]"
                          >
                            <img src={pUrl} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* VIP Only Flag */}
                <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                  <input
                    type="checkbox"
                    id="vipFlagCheck"
                    checked={newIsVipOnly}
                    onChange={(e) => setNewIsVipOnly(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                  <label htmlFor="vipFlagCheck" className="text-xs text-amber-200 cursor-pointer">
                    <strong>دانلود فقط مخصوص اعضای VIP باشد</strong> (استریم آنلاین آزاد برای همه، دانلود با فرمت ۳۲۰ استودیویی مخصوص حامیان مالی)
                  </label>
                </div>

                {/* Track Description */}
                <div>
                  <label className="text-xs text-neutral-300 block mb-1 font-medium">توضیحات و معرفی قطعه:</label>
                  <textarea
                    rows={2}
                    placeholder="مثلاً: جدیدترین ریمیکس ۲۰۲۶ دی‌جی کاسپین با بیس‌لاین کلاب..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full bg-[#242424] border border-neutral-700 focus:border-[#1db954] focus:outline-none rounded-xl px-3 py-2 text-xs text-white resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setUploadStep(1)}
                    className="py-2.5 px-4 rounded-full bg-neutral-800 text-neutral-300 text-xs font-bold cursor-pointer"
                  >
                    ← بازگشت به فایل صوتی
                  </button>

                  <button
                    type="submit"
                    className="py-3 px-8 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xl shadow-[#1db954]/25 hover:scale-105"
                  >
                    <Check className="w-4 h-4" />
                    <span>انتشار نهایی آهنگ روی سایت (پخش زنده برای همه)</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CREATE PLAYLIST MODAL */}
      {/* ------------------------------------------------------------- */}
      {isNewPlaylistOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in select-none" dir="rtl">
          <div className="relative w-full max-w-lg bg-[#181818] border border-neutral-700 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ListMusic className="w-5 h-5 text-cyan-400" />
              <span>ساخت پلی‌لیست رسمی جدید در سایت</span>
            </h3>

            <form onSubmit={handlePublishPlaylist} className="space-y-4">
              <div>
                <label className="text-xs text-neutral-300 block mb-1 font-medium">عنوان پلی‌لیست: *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: Persian Club & Party 2026"
                  value={newPlTitle}
                  onChange={(e) => setNewPlTitle(e.target.value)}
                  className="w-full bg-[#242424] border border-neutral-700 focus:border-cyan-400 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-300 block mb-1 font-medium">توضیح کوتاه:</label>
                <input
                  type="text"
                  placeholder="مثلاً: بهترین ریمیکس‌های ۱۳۰ بیت مخصوص پارتی"
                  value={newPlDesc}
                  onChange={(e) => setNewPlDesc(e.target.value)}
                  className="w-full bg-[#242424] border border-neutral-700 focus:border-cyan-400 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              {/* Select Tracks for Playlist */}
              <div className="space-y-1.5">
                <label className="text-xs text-neutral-300 block font-medium">
                  انتخاب آهنگ‌ها برای افزودن به پلی‌لیست ({selectedTrackIdsForPl.length} انتخاب شده):
                </label>
                <div className="max-h-40 overflow-y-auto bg-[#202020] rounded-xl border border-neutral-700 p-2 divide-y divide-neutral-800">
                  {tracks.length === 0 ? (
                    <div className="p-3 text-center text-xs text-neutral-500">
                      ابتدا باید آهنگی روی سایت آپلود کنید.
                    </div>
                  ) : (
                    tracks.map((t) => {
                      const isSelected = selectedTrackIdsForPl.includes(t.id);
                      return (
                        <div
                          key={t.id}
                          onClick={() => {
                            setSelectedTrackIdsForPl((prev) =>
                              isSelected ? prev.filter((id) => id !== t.id) : [...prev, t.id]
                            );
                          }}
                          className="flex items-center gap-2 p-2 hover:bg-neutral-800 rounded-lg cursor-pointer text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="w-4 h-4 accent-cyan-400"
                          />
                          <img src={t.coverUrl} alt="" className="w-6 h-6 rounded object-cover" />
                          <span className="text-white truncate flex-1">{t.title}</span>
                          <span className="text-neutral-500 font-mono text-[10px]">{t.bpm} BPM</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsNewPlaylistOpen(false)}
                  className="py-2 px-4 rounded-full bg-neutral-800 text-neutral-300 text-xs font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs cursor-pointer shadow-md"
                >
                  انتشار پلی‌لیست روی سایت
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECEIPT PREVIEW MODAL */}
      {selectedReceiptImage && (
        <div 
          onClick={() => setSelectedReceiptImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-pointer animate-in fade-in"
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-[#1a1a1a] p-3 rounded-2xl border border-neutral-700">
            <img
              src={selectedReceiptImage}
              alt="رسید واریزی کامل"
              className="max-h-[75vh] w-auto rounded-xl object-contain mx-auto"
            />
            <p className="text-center text-xs text-neutral-400 mt-2">برای بستن هر جا کلیک کنید</p>
          </div>
        </div>
      )}
    </div>
  );
};
