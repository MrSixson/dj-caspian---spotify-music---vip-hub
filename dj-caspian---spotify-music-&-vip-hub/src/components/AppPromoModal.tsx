import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Download, X } from 'lucide-react';

const DISMISS_KEY = 'dj-caspian-app-promo-dismissed-v2';
const POSTER_URL = 'https://d2ol7oe51mr4n9.cloudfront.net/user_3LbkVgD4rFgZqph5aiV2BP334Pg/fb790385-60c4-4d98-8e19-36b55dc1febd.jpg';
const APK_URL = 'https://github.com/MrSixson/dj-caspian---spotify-music---vip-hub/releases/download/android-v1.0.0-beta.1/app-debug.apk';

export function AppPromoModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem(DISMISS_KEY) === '1') return;
    const timer = window.setTimeout(() => setIsOpen(true), 450);
    return () => window.clearTimeout(timer);
  }, []);

  const dismiss = () => {
    window.localStorage.setItem(DISMISS_KEY, '1');
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismiss();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  if (Capacitor.isNativePlatform() || !isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[160] flex items-center justify-center bg-black/80 p-3 backdrop-blur-md sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) dismiss();
      }}
    >
      <section
        dir="rtl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-promo-title"
        className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-[#d6b45c]/45 bg-[#080d16] shadow-[0_24px_100px_rgba(0,0,0,0.7)] sm:rounded-3xl"
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="بستن اعلان تبلیغاتی"
          className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/70 text-white shadow-lg transition hover:border-[#e4c477] hover:bg-[#d6b45c] hover:text-black"
        >
          <X size={20} />
        </button>

        <div className="relative">
          <img
            src={POSTER_URL}
            alt="پوستر تبلیغاتی اپلیکیشن DJ Caspian"
            className="block max-h-[72vh] w-full object-contain"
            loading="eager"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#080d16] via-[#080d16]/75 to-transparent" />
        </div>

        <div className="relative -mt-5 space-y-3 px-4 pb-5 pt-1 text-center sm:px-8 sm:pb-7">
          <p className="text-[10px] font-extrabold tracking-[0.28em] text-[#e4c477]">DJ CASPIAN • OFFICIAL ANDROID APP</p>
          <h2 id="app-promo-title" className="text-lg font-black text-white sm:text-2xl">موسیقی کاسپین، همیشه همراه تو 🎧</h2>
          <p className="mx-auto max-w-xl text-xs leading-6 text-slate-300 sm:text-sm">
            نسخه اندروید DJ Caspian را مستقیم دانلود و روی گوشی نصب کن.
          </p>
          <div className="flex flex-col-reverse items-center justify-center gap-2 pt-1 sm:flex-row">
            <button
              type="button"
              onClick={dismiss}
              className="w-full rounded-xl border border-white/15 px-5 py-3 text-xs font-bold text-slate-300 transition hover:bg-white/5 sm:w-auto"
            >
              ادامه بازدید از سایت
            </button>
            <a
              href={APK_URL}
              onClick={dismiss}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f0d58e] to-[#b9954b] px-6 py-3 text-xs font-black text-[#111827] shadow-lg shadow-black/30 transition hover:brightness-110 sm:w-auto"
            >
              <Download size={16} />
              دانلود مستقیم برنامه اندروید
            </a>
          </div>
          <p className="text-[10px] text-slate-500">فایل نصب APK • نسخه آزمایشی اندروید</p>
        </div>
      </section>
    </div>
  );
}
