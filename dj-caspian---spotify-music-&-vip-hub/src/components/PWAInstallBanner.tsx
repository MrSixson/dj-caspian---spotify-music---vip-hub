import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Download, Smartphone, X, Share, PlusSquare } from 'lucide-react';

const APK_URL = 'https://github.com/MrSixson/dj-caspian---spotify-music---vip-hub/releases/download/android-v1.0.0-beta.1/app-debug.apk';
const DISMISS_KEY = 'dj-caspian-pwa-promo-dismissed';

export function PWAInstallBanner() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showInstallHelp, setShowInstallHelp] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) ||
      (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    setIsIOS(ios);
    setIsStandalone(standalone);
    setIsDismissed(window.localStorage.getItem(DISMISS_KEY) === '1');
  }, []);

  const dismiss = () => {
    setIsDismissed(true);
    window.localStorage.setItem(DISMISS_KEY, '1');
  };

  if (Capacitor.isNativePlatform() || isStandalone || isDismissed) return null;

  return (
    <>
      <section id="pwa-install-banner" className="relative mx-4 mt-4 overflow-hidden rounded-2xl border border-[#b9954b]/35 bg-gradient-to-l from-[#17263a] via-[#0d1828] to-[#090e17] p-4 shadow-[0_16px_50px_rgba(0,0,0,0.28)] sm:mx-6 sm:mt-6 sm:p-5" dir="rtl" aria-label="دانلود اپلیکیشن DJ Caspian">
        <button type="button" onClick={dismiss} aria-label="بستن معرفی اپلیکیشن" className="absolute left-3 top-3 rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white">
          <X size={17} />
        </button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="flex min-w-0 items-start gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-[#d8b66a]/45 bg-[#d8b66a]/10 text-[#e1c27a]">
              <Smartphone size={25} />
            </div>
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold tracking-[0.2em] text-[#e1c27a]">DJ CASPIAN APP</span>
                <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-bold text-emerald-300">نسخه اندروید</span>
              </div>
              <h2 className="text-base font-black text-white sm:text-lg">اپلیکیشن مستقل DJ Caspian</h2>
              <p className="mt-1 max-w-2xl text-xs leading-6 text-slate-300 sm:text-sm">
                فایل APK را مستقیم دانلود کن و برنامه را مثل سایر اپلیکیشن‌های گوشی نصب کن.
              </p>
            </div>
          </div>
          {isIOS ? (
            <button type="button" onClick={() => setShowInstallHelp(true)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#e5c77e] to-[#b9954b] px-5 py-3 text-xs font-black text-[#101827] shadow-lg shadow-black/20 transition hover:brightness-110">
              <Smartphone size={16} /> راهنمای آیفون
            </button>
          ) : (
            <a href={APK_URL} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#e5c77e] to-[#b9954b] px-5 py-3 text-xs font-black text-[#101827] shadow-lg shadow-black/20 transition hover:brightness-110">
              <Download size={16} /> دانلود مستقیم APK
            </a>
          )}
        </div>
        {showInstallHelp && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 p-3 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-labelledby="install-help-title" onClick={() => setShowInstallHelp(false)}>
            <div className="w-full max-w-sm rounded-2xl border border-[#d8b66a]/30 bg-[#0c1728] p-5 text-right shadow-2xl" dir="rtl" onClick={(event) => event.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between">
                <h3 id="install-help-title" className="text-lg font-black text-white">نصب روی آیفون</h3>
                <button type="button" onClick={() => setShowInstallHelp(false)} className="rounded-full p-2 text-slate-400 hover:bg-white/10" aria-label="بستن"><X size={18} /></button>
              </div>
              <ol className="space-y-4 text-sm leading-7 text-slate-200">
                <li className="flex gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/5 text-[#e1c27a]"><Share size={17} /></span><span>در مرورگر Safari، دکمه Share را بزن.</span></li>
                <li className="flex gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/5 text-[#e1c27a]"><PlusSquare size={17} /></span><span>گزینه Add to Home Screen را انتخاب کن.</span></li>
                <li className="flex gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/5 text-[#e1c27a]"><Download size={17} /></span><span>روی Add بزن تا نسخه وب به صفحه اصلی اضافه شود.</span></li>
              </ol>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
