import React from 'react';
import { 
  Home, Search, Library, Crown, Heart, Clock, ShieldCheck, 
  PlusCircle, Radio, Music2, ExternalLink, X, Disc3, User, 
  LayoutDashboard, LogIn, LogOut, Globe
} from 'lucide-react';
import { Playlist, UserAccount } from '../types';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: 'home' | 'search' | 'library' | 'support' | 'tickets' | 'admin' | 'liked' | 'dashboard' | 'about') => void;
  playlists: Playlist[];
  onSelectPlaylist?: (playlist: Playlist) => void;
  likedCount: number;
  isUserVip: boolean;
  currentUser: UserAccount | null;
  onOpenAuthModal: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  playlists,
  onSelectPlaylist,
  likedCount,
  isUserVip,
  currentUser,
  onOpenAuthModal,
  isOpenMobile,
  onCloseMobile,
}) => {
  const isOwnerAdmin = currentUser?.role === 'admin' && currentUser?.username === 'AminJodaie';

  const navItems = [
    { id: 'home', label: 'خانه (Home)', icon: Home },
    { id: 'search', label: 'جستجو و سبک‌ها', icon: Search },
    { id: 'library', label: 'کتابخانه موزیک', icon: Library },
    { id: 'about', label: 'درباره و شبکه‌های ما', icon: Globe },
  ] as const;

  const content = (
    <div className="flex flex-col h-full bg-black text-neutral-300 p-4 select-none w-64 md:w-68 border-l border-neutral-900 overflow-y-auto">
      {/* Top Branding */}
      <div className="flex items-center justify-between pb-6 pt-1 px-2">
        <div 
          onClick={() => {
            onNavigate('home');
            onCloseMobile();
          }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          {/* Spotify Green Wave Icon */}
          <div className="w-10 h-10 rounded-full bg-[#1db954] flex items-center justify-center text-black shadow-lg shadow-[#1db954]/20 group-hover:scale-105 transition-transform">
            <Disc3 className="w-6 h-6 animate-[spin_8s_linear_infinite]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg text-white tracking-wider">CASPIAN</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#1db954] text-black">
                SPOTIFY
              </span>
            </div>
            <div className="text-[10px] text-neutral-400 font-medium">DJ Caspian Official Hub</div>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="md:hidden text-neutral-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Navigation Links */}
      <nav className="space-y-1 mb-5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id as any);
                onCloseMobile();
              }}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                isActive
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#1db954]' : ''}`} />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* User Dashboard Nav Link */}
        <button
          onClick={() => {
            if (currentUser) {
              onNavigate('dashboard');
            } else {
              onOpenAuthModal();
            }
            onCloseMobile();
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            currentView === 'dashboard'
              ? 'bg-neutral-800 text-white'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <LayoutDashboard className={`w-5 h-5 ${currentView === 'dashboard' ? 'text-[#1db954]' : ''}`} />
            <span>داشبورد کاربری من</span>
          </div>
          {currentUser && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-neutral-300">
              {currentUser.username}
            </span>
          )}
        </button>
      </nav>

      {/* SPECIAL HIGHLIGHT: SUPPORT ARTIST & VIP */}
      <div className="space-y-2 mb-5">
        <button
          onClick={() => {
            onNavigate('support');
            onCloseMobile();
          }}
          className={`w-full relative overflow-hidden group p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
            currentView === 'support'
              ? 'bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent border-amber-500/80 text-white shadow-lg shadow-amber-500/10'
              : 'bg-neutral-900/80 border-neutral-800 hover:border-amber-500/50 text-neutral-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
              <Crown className="w-4 h-4 fill-amber-400" />
              <span>حمایت مالی و خرید VIP</span>
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
              ۱۰ تتر / 3 میلیون
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 group-hover:text-neutral-300 leading-tight">
            کارت به کارت و تتر جهت فعال‌سازی دانلود ۳۲۰kbps
          </p>
        </button>

      </div>


      {/* Private Management Room - STRICTLY for logged-in AminJodaie only */}
      {isOwnerAdmin && (
        <div className="mb-5">
          <button
            onClick={() => {
              onNavigate('admin');
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-lg ${
              currentView === 'admin'
                ? 'bg-[#1db954] text-black shadow-[#1db954]/30'
                : 'bg-emerald-950/60 hover:bg-emerald-900 border border-[#1db954]/60 text-[#1db954] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5" />
              <div className="text-right">
                <div className="font-black text-xs leading-none">اتاق مدیریت دی‌جی کاسپین</div>
                <div className="text-[10px] opacity-80 mt-0.5">آپلود و حذف، تایید فیش‌ها</div>
              </div>
            </div>
          </button>
        </div>
      )}

      <div className="h-px bg-neutral-800/80 my-2" />

      {/* Playlists & Liked Section */}
      <div className="flex-1 space-y-1">
        <div className="px-2 py-1 text-[11px] font-bold text-neutral-500 tracking-wider">
          پلی‌لیست‌ها و آرشیو
        </div>

        <button
          onClick={() => {
            onNavigate('liked');
            onCloseMobile();
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            currentView === 'liked' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-600 to-purple-400 flex items-center justify-center text-white shrink-0">
            <Heart className="w-3.5 h-3.5 fill-white" />
          </div>
          <span className="truncate">آهنگ‌های لایک شده</span>
          <span className="mr-auto text-[10px] text-neutral-500">{likedCount}</span>
        </button>

        {playlists.map((pl) => (
          <button
            key={pl.id}
            onClick={() => {
              if (onSelectPlaylist) onSelectPlaylist(pl);
              onCloseMobile();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-900/40 transition-colors text-right truncate cursor-pointer"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#1db954]/60" />
            <span className="truncate">{pl.title}</span>
          </button>
        ))}
      </div>

      {/* Bottom User Account / Login Status Card */}
      <div className="pt-4 border-t border-neutral-900">
        {currentUser ? (
          <div 
            onClick={() => {
              onNavigate('dashboard');
              onCloseMobile();
            }}
            className="p-3 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 border border-neutral-800 text-right space-y-2 cursor-pointer transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.displayName}
                className="w-9 h-9 rounded-xl object-cover border border-neutral-700 group-hover:border-[#1db954] transition-colors"
              />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-xs text-white truncate flex items-center gap-1">
                  <span>{currentUser.displayName}</span>
                  {currentUser.isVip && <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />}
                </div>
                <div className="text-[10px] text-neutral-400 font-mono" dir="ltr">
                  @{currentUser.username}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-neutral-800/80">
              <span className="text-neutral-400">داشبورد کاربری من</span>
              <span className="text-[#1db954] font-bold group-hover:underline">ورود به پنل ←</span>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-gradient-to-b from-neutral-900 to-black border border-neutral-800 text-center space-y-2.5">
            <div className="text-xs font-bold text-white">عضویت در DJ Caspian</div>
            <p className="text-[10px] text-neutral-400">
              برای ذخیره علاقه‌مندی‌ها و فعال‌سازی VIP وارد شوید
            </p>
            <button
              onClick={() => {
                onOpenAuthModal();
                onCloseMobile();
              }}
              className="w-full py-2 rounded-xl bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#1db954]/20"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>ورود یا ثبت‌نام</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block h-screen shrink-0 sticky top-0" dir="rtl">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/80 backdrop-blur-sm flex" dir="rtl">
          <div className="w-72 max-w-[85vw] h-full animate-in slide-in-from-right duration-200">
            {content}
          </div>
          <div className="flex-1" onClick={onCloseMobile} />
        </div>
      )}
    </>
  );
};

