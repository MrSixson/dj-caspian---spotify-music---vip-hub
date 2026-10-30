import React, { useState } from 'react';
import { 
  X, LogIn, UserPlus, Shield, Crown, User, Lock, 
  Mail, Sparkles, CheckCircle2, AlertCircle, ArrowLeft, Disc3
} from 'lucide-react';
import { UserAccount } from '../types';
import { signInWithEmail, signUpWithEmail } from '../lib/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: UserAccount) => void;
  onRegister: (newUser: UserAccount) => void;
  users: UserAccount[];
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  users,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Login Form
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register Form
  const [regDisplayName, setRegDisplayName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regError, setRegError] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      const email = loginUsername.trim();
      if (!email.includes('@')) {
        setLoginError('ورود با نام کاربری در حال آماده‌سازی است؛ فعلاً ایمیل ثبت‌شده را وارد کنید.');
        return;
      }
      const authenticatedUser = await signInWithEmail(email, loginPassword);
      onLogin(authenticatedUser);
      onClose();
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'ورود انجام نشد. اطلاعات حساب را بررسی کنید.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (regPassword !== regConfirmPassword) {
      setRegError('رمز عبور و تکرار آن یکسان نیستند.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setRegError('برای ساخت حساب، ایمیل معتبر الزامی است.');
      return;
    }
    if (regPassword.length < 8) {
      setRegError('رمز عبور باید حداقل ۸ کاراکتر باشد.');
      return;
    }

    try {
      const result = await signUpWithEmail({
        email: regEmail.trim(),
        password: regPassword,
        username: regUsername.trim(),
        displayName: regDisplayName.trim() || regUsername.trim(),
      });

      if (result.emailConfirmationRequired || !result.user) {
        setRegError('حساب ساخته شد. برای فعال‌سازی، لینک تأیید ارسال‌شده به ایمیلتان را باز کنید؛ سپس وارد شوید.');
        return;
      }

      onRegister(result.user);
      onLogin(result.user);
      onClose();
    } catch (error) {
      setRegError(error instanceof Error ? error.message : 'ثبت‌نام انجام نشد.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 select-none" dir="rtl">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#181818] via-[#141414] to-[#0d0d0d] border border-neutral-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#1db954]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-neutral-400 hover:text-white bg-neutral-800/60 hover:bg-neutral-800 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-1 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#1db954] text-black flex items-center justify-center mx-auto shadow-lg shadow-[#1db954]/30 mb-2">
            <Disc3 className="w-7 h-7 animate-[spin_8s_linear_infinite]" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            DJ Caspian Records
          </h2>
          <p className="text-xs text-neutral-400">
            سیستم ورود و عضویت کاربران پلتفرم استریم و مدیریت
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex p-1 bg-neutral-900 rounded-2xl border border-neutral-800 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setLoginError('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-[#1db954] text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>ورود به حساب</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('register');
              setRegError('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-[#1db954] text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>ثبت‌نام کاربر جدید</span>
          </button>
        </div>

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-neutral-300 block mb-1 font-medium">نام کاربری یا ایمیل:</label>
              <div className="relative">
                <User className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  required
                  placeholder="مثال: AminJodaie یا ایمیل"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full bg-[#202020] border border-neutral-700 focus:border-[#1db954] focus:outline-none rounded-xl py-2.5 pr-10 pl-4 text-xs sm:text-sm text-white placeholder-neutral-500 font-mono text-right"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-neutral-300 block mb-1 font-medium">رمز عبور:</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="password"
                  required
                  placeholder="رمز عبور شما"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-[#202020] border border-neutral-700 focus:border-[#1db954] focus:outline-none rounded-xl py-2.5 pr-10 pl-4 text-xs sm:text-sm text-white placeholder-neutral-500 font-mono text-left"
                  dir="ltr"
                />
              </div>
            </div>

            {loginError && (
              <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-6 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#1db954]/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <LogIn className="w-4 h-4" />
              <span>ورود به حساب کاربری</span>
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-neutral-300 block mb-1 font-medium">نام نمایشی (فارسی یا انگلیسی):</label>
              <input
                type="text"
                required
                placeholder="مثال: آرین تهرانی"
                value={regDisplayName}
                onChange={(e) => setRegDisplayName(e.target.value)}
                className="w-full bg-[#202020] border border-neutral-700 focus:border-[#1db954] focus:outline-none rounded-xl py-2 px-3 text-xs sm:text-sm text-white"
              />
            </div>

            <div>
              <label className="text-xs text-neutral-300 block mb-1 font-medium">نام کاربری اختصاصی (Username):</label>
              <input
                type="text"
                required
                placeholder="مثال: ArianClub"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                className="w-full bg-[#202020] border border-neutral-700 focus:border-[#1db954] focus:outline-none rounded-xl py-2 px-3 text-xs sm:text-sm text-white font-mono text-left"
                dir="ltr"
              />
            </div>

            <div>
              <label className="text-xs text-neutral-300 block mb-1 font-medium">ایمیل (برای تأیید حساب الزامی):</label>
              <input
                type="email"
                required
                placeholder="email@example.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full bg-[#202020] border border-neutral-700 focus:border-[#1db954] focus:outline-none rounded-xl py-2 px-3 text-xs sm:text-sm text-white font-mono text-left"
                dir="ltr"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-neutral-300 block mb-1 font-medium">رمز عبور:</label>
                <input
                  type="password"
                  required
                  placeholder="حداقل ۸ کاراکتر"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full bg-[#202020] border border-neutral-700 focus:border-[#1db954] focus:outline-none rounded-xl py-2 px-3 text-xs sm:text-sm text-white font-mono"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-300 block mb-1 font-medium">تکرار رمز:</label>
                <input
                  type="password"
                  required
                  placeholder="تکرار رمز"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  className="w-full bg-[#202020] border border-neutral-700 focus:border-[#1db954] focus:outline-none rounded-xl py-2 px-3 text-xs sm:text-sm text-white font-mono"
                  dir="ltr"
                />
              </div>
            </div>

            {regError && (
              <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-6 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#1db954]/20 hover:scale-[1.02] active:scale-[0.98] mt-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>ساخت حساب کاربری و ورود</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
