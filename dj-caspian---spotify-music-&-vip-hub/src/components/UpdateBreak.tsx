import React, { useEffect, useMemo, useState } from "react";

const TEHRAN_END_LABEL = "چهارشنبه ۴ آذر ۱۴۰۵، ساعت ۱۳:۰۴ به وقت تهران";

function splitTime(totalSeconds: number) {
  return [
    { label: "روز", value: Math.floor(totalSeconds / 86400) },
    { label: "ساعت", value: Math.floor((totalSeconds % 86400) / 3600) },
    { label: "دقیقه", value: Math.floor((totalSeconds % 3600) / 60) },
    { label: "ثانیه", value: totalSeconds % 60 },
  ];
}

export function UpdateBreak({ endsAt }: { endsAt: number }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const remaining = Math.max(0, Math.floor((endsAt - now) / 1000));
  const values = useMemo(() => splitTime(remaining), [remaining]);
  const progress = Math.min(100, Math.max(0, ((72 * 3600 - remaining) / (72 * 3600)) * 100));

  return (
    <main dir="rtl" className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#050912] px-4 py-10 text-white sm:px-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-sky-500/15 blur-[110px]" />
        <div className="absolute -bottom-48 -left-36 h-[32rem] w-[32rem] rounded-full bg-amber-400/10 blur-[130px]" />
        <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: "linear-gradient(rgba(148,163,184,.22) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.22) 1px, transparent 1px)", backgroundSize: "54px 54px", maskImage: "radial-gradient(ellipse at center, black 15%, transparent 78%)" }} />
      </div>

      <section className="relative w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#091321]/90 shadow-[0_30px_120px_rgba(0,0,0,.65)] backdrop-blur-2xl sm:rounded-[2.5rem]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-[#e7bd69] to-transparent" />
        <div className="relative px-5 py-10 text-center sm:px-12 sm:py-14 lg:px-20">
          <img src="https://irkdzjizhwxbmnnfyqsx.supabase.co/storage/v1/object/public/brand-assets/caspian-official-logo.png" alt="DJ Caspian Official Logo" className="mx-auto mb-7 h-24 w-24 object-contain drop-shadow-[0_0_28px_rgba(214,180,92,.24)]" loading="eager" />
          <div className="mx-auto mb-8 flex w-fit items-center gap-3 rounded-full border border-sky-300/20 bg-sky-300/[0.07] px-5 py-2 text-[10px] font-extrabold tracking-[.28em] text-sky-200 sm:text-xs" dir="ltr">
            <span className="h-2 w-2 animate-pulse rounded-full bg-sky-300 shadow-[0_0_16px_rgba(125,211,252,.9)]" />
            DJ CASPIAN <span className="text-amber-300">/</span> NEXT ERA
          </div>

          <p className="mb-4 text-xs font-black tracking-[.35em] text-[#e8c47d]" dir="ltr">THE COUNTDOWN TO A NEW CHAPTER</p>
          <h1 className="text-3xl font-black leading-tight sm:text-5xl lg:text-6xl">کاسپین در حال پوست‌اندازی است</h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-8 text-slate-300 sm:text-base">
            داریم تجربه‌ای تازه برای شنیدن موسیقی می‌سازیم؛ با طراحی جدید، اجرای روان‌تر و امکانات بیشتر.
            <span className="mt-1 block font-bold text-sky-200">Season 2 در راه است. این وقفه، شروع یک فصل تازه است.</span>
          </p>

          <div className="mx-auto mt-10 max-w-3xl">
            <div className="mb-4 flex items-center justify-between text-[10px] font-bold text-slate-400 sm:text-xs">
              <span>آماده‌سازی فصل دوم</span>
              <span className="font-mono text-amber-200" dir="ltr">{progress.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-l from-sky-300 via-sky-500 to-amber-300 shadow-[0_0_18px_rgba(56,189,248,.45)] transition-[width] duration-700" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="mx-auto mt-9 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4" aria-label="شمارش معکوس">
            {values.map((unit) => (
              <div key={unit.label} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.09] to-white/[0.025] px-3 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,.06)] sm:rounded-3xl sm:py-7">
                <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-sky-200/50 to-transparent" />
                <div className="font-mono text-4xl font-black tabular-nums tracking-tight text-white drop-shadow-[0_0_18px_rgba(125,211,252,.18)] sm:text-6xl" dir="ltr">{String(unit.value).padStart(2, "0")}</div>
                <div className="mt-2 text-xs font-bold tracking-widest text-slate-400">{unit.label}</div>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-8 flex max-w-3xl flex-col items-center justify-between gap-3 rounded-2xl border border-amber-300/20 bg-amber-200/[0.06] px-5 py-4 sm:flex-row">
            <span className="text-xs font-bold text-amber-100">زمان پایان وقفه</span>
            <span className="text-xs font-extrabold text-amber-200 sm:text-sm">{TEHRAN_END_LABEL}</span>
          </div>

          <div className="mt-10 flex flex-col items-center gap-2">
            <span className="text-[10px] font-black tracking-[.35em] text-slate-500" dir="ltr">DJ CASPIAN • SEASON 02</span>
            <span className="text-[10px] text-slate-600">ممنون که برای شروع فصل بعدی کنار ما هستید.</span>
          </div>
        </div>
      </section>
    </main>
  );
}
