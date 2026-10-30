import React from 'react';
import { 
  ChevronRight, ChevronLeft, Search, Crown, Shield, 
  Menu, Sparkles, User, ExternalLink, LogIn, LayoutDashboard
} from 'lucide-react';
import { DJ_CASPIAN_INFO } from '../data/initialData';
import { UserAccount } from '../types';

interface TopNavProps {
  currentView: string;
  onNavigate: (view: 'home' | 'search' | 'library' | 'support' | 'tickets' | 'admin' | 'liked' | 'dashboard' | 'about') => void;
  onOpenMobileMenu: () => void;
  currentUser: UserAccount | null;
  onOpenAuthModal: () => void;
  isUserVip: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentView,
  onNavigate,
  onOpenMobileMenu,
  currentUser,
  onOpenAuthModal,
  isUserVip,
  searchQuery,
  onSearchChange,
}) => {
  const isOwnerAdmin = currentUser?.role === 'admin' && currentUser?.username === 'AminJodaie';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 sm:gap-4 px-3 sm:px-8 py-3 bg-[#101010]/95 backdrop-blur-md border-b border-neutral-900/80 select-none" dir="rtl">
      {/* Right side in RTL: Mobile menu & Search */}
      <div className="flex items-center gap-2.5 sm:gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-neutral-400 hover:text-white bg-neutral-900 rounded-xl"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => onNavigate('home')}
            className="w-8 h-8 rounded-full bg-black/60 hover:bg-black text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="خانه"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Global Search Bar */}
        <div className="relative flex-1 min-w-[170px] sm:min-w-[240px]">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="جستجوی آهنگ، ریمیکس، سبک یا آلبوم..."
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              if (currentView !== 'search' && e.target.value.trim()) {
                onNavigate('search');
              }
            }}
            onFocus={() => {
              if (currentView !== 'search') {
                onNavigate('search');
              }
            }}
            className="w-full bg-[#1c1c1c] hover:bg-[#222222] focus:bg-[#222222] border border-neutral-800 focus:border-[#1db954] focus:outline-none rounded-full py-2 pr-9 pl-4 text-xs sm:text-sm text-white placeholder-neutral-500 transition-colors"
          />
        </div>
      </div>

      {/* Left side in RTL: VIP Pill, Owner Room, and User Account */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* VIP Status Pill / Button */}
        {isUserVip ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold shadow-sm">
            <Crown className="w-3.5 h-3.5 fill-amber-400 shrink-0" />
            <span className="hidden sm:inline">VIP طلایی</span>
            <span className="sm:hidden text-[10px]">VIP</span>
          </div>
        ) : (
          <button
            onClick={() => onNavigate('support')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold transition-all shadow-md shadow-amber-500/20 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Crown className="w-3.5 h-3.5 fill-black shrink-0" />
            <span className="hidden sm:inline">خرید VIP (۱۰ تتر)</span>
            <span className="sm:hidden text-[10px]">VIP</span>
          </button>
        )}

        {/* DJ Caspian Admin shortcut - ONLY if logged in as Admin AminJodaie! */}
        {isOwnerAdmin && (
          <button
            onClick={() => onNavigate('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-md ${
              currentView === 'admin'
                ? 'bg-[#1db954] text-black shadow-[#1db954]/20'
                : 'bg-emerald-950/60 hover:bg-emerald-900 border border-[#1db954]/60 text-[#1db954] hover:text-white'
            }`}
            title="ورود به اتاق‌های مدیریت DJ Caspian"
          >
            <Shield className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline">اتاق مدیریت DJ Caspian</span>
            <span className="md:hidden">مدیریت</span>
          </button>
        )}

        {/* User Account / Profile Button */}
        {currentUser ? (
          <div
            onClick={() => onNavigate('dashboard')}
            className={`flex items-center gap-2 p-1 pl-3 rounded-full border transition-all cursor-pointer ${
              currentView === 'dashboard'
                ? 'bg-neutral-800 border-[#1db954]'
                : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700/80 hover:border-neutral-600'
            }`}
            title="مشاهده داشبورد و پروفایل من"
          >
            <div className="relative">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.displayName}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-neutral-600"
              />
              {currentUser.isVip && (
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full flex items-center justify-center text-black font-black text-[8px]">
                  ★
                </div>
              )}
            </div>

            <div className="hidden sm:block text-right">
              <div className="text-xs font-bold text-white leading-tight truncate max-w-[100px]">
                {currentUser.displayName}
              </div>
              <div className="text-[10px] text-neutral-400 font-mono leading-none">
                {currentUser.role === 'admin' ? 'مالک دی‌جی' : currentUser.isVip ? 'VIP' : 'کاربر'}
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-1.5 py-1.5 px-3.5 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-xs transition-all shadow-md shadow-[#1db954]/20 hover:scale-105 cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>ورود / ثبت‌نام</span>
          </button>
        )}
      </div>
    </header>
  );
};

