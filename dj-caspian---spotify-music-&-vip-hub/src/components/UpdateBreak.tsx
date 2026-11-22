import { useEffect, useState } from 'react';

const END_AT = new Date('2026-11-25T13:04:00+03:30').getTime();

function getRemaining() {
  const distance = Math.max(0, END_AT - Date.now());
  return {
    days: Math.floor(distance / 86400000),
    hours: Math.floor((distance % 86400000) / 3600000),
    minutes: Math.floor((distance % 3600000) / 60000),
    seconds: Math.floor((distance % 60000) / 1000),
    finished: distance <= 0,
  };
}

export default function UpdateBreak() {
  const [remaining, setRemaining] = useState(getRemaining);

  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(getRemaining()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const parts = [
    ['روز', remaining.days],
    ['ساعت', remaining.hours],
    ['دقیقه', remaining.minutes],
    ['ثانیه', remaining.seconds],
  ];

  return (
    <main dir="rtl" lang="fa" className="min-h-screen bg-[#080b09] text-white flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-3xl text-center">
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#1db954]/40 bg-[#1db954]/10 text-3xl text-[#1ed760]">♫</div>
        <p className="mb-4 text-xs font-bold tracking-[0.35em] text-[#1ed760]">DJ CASPIAN · SEASON 2</p>
        <h1 className="mb-5 text-3xl font-black leading-tight sm:text-5xl">وقفه به‌روزرسانی</h1>
        <p className="mx-auto mb-10 max-w-xl text-sm leading-8 text-neutral-400 sm:text-base">
          در حال آماده‌سازی تجربه‌ای تازه از DJ Caspian هستیم؛ با طراحی جدید، تجربه‌ی بهتر پخش موسیقی و امکانات بیشتر.
          نسخه‌ی فعلی موقتاً در دسترس نیست. به‌زودی برمی‌گردیم.
        </p>
        <section aria-label="شمارش معکوس پایان وقفه به‌روزرسانی" className="mb-8 grid grid-cols-4 gap-2 sm:gap-4">
          {parts.map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] px-2 py-5 sm:py-7">
              <div className="text-2xl font-extrabold tabular-nums text-[#1ed760] sm:text-4xl">{String(value).padStart(2, '0')}</div>
              <div className="mt-2 text-xs text-neutral-400">{label}</div>
            </div>
          ))}
        </section>
        <p className="text-xs text-neutral-500">
          {remaining.finished ? 'زمان اعلام‌شده به پایان رسیده است؛ منتظر اطلاعیه‌ی بعدی باشید.' : 'پایان زمان‌بندی: چهارشنبه ۴ آذر ۱۴۰۵، ساعت ۱۳:۰۴ به وقت تهران'}
        </p>
        <div className="mt-10 text-[10px] font-semibold tracking-[0.3em] text-neutral-600">A NEW ERA OF MUSIC IS COMING</div>
      </div>
    </main>
  );
}
