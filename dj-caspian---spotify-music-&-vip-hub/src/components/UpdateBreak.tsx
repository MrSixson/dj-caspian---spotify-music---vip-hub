import React, { useEffect, useState } from "react";

export function UpdateBreak({ endsAt }: { endsAt: number }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const remaining = Math.max(0, Math.floor((endsAt - now) / 1000));
  const values = [
    { label: "روز", value: Math.floor(remaining / 86400) },
    { label: "ساعت", value: Math.floor((remaining % 86400) / 3600) },
    { label: "دقیقه", value: Math.floor((remaining % 3600) / 60) },
    { label: "ثانیه", value: remaining % 60 },
  ];
  return (
    <main dir="rtl" className="min-h-screen flex items-center justify-center bg-[#05080e] px-5 py-12 text-white">
      <section className="w-full max-w-4xl rounded-[2rem] border border-white/10 bg-[#0b1220] p-8 text-center shadow-2xl sm:p-16">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl border border-[#d6ad61]/30 bg-[#12345a] text-3xl font-black text-[#e7c47f]">C.</div>
        <p className="mb-4 text-xs font-bold tracking-[.34em] text-[#d6ad61]">DJ CASPIAN • NEXT ERA</p>
        <h1 className="text-3xl font-black sm:text-5xl">فصل جدیدی در راه است</h1>
        <p className="mt-4 text-lg font-bold text-[#8bbce8]">SEASON 2 UPDATE</p>
        <p className="mx-auto mt-6 max-w-2xl leading-8 text-slate-300">کاسپین برای یک ارتقای اساسی موقتاً آفلاین شده است. ظاهر تازه، تجربه بهتر پخش موسیقی و امکانات جدید در راه‌اند.</p>
        <div className="mx-auto mt-10 grid max-w-2xl grid-cols-4 gap-2 sm:gap-4">
          {values.map((unit) => <div key={unit.label} className="rounded-2xl border border-white/10 bg-white/5 px-2 py-5"><div className="font-mono text-3xl font-black tabular-nums sm:text-5xl">{String(unit.value).padStart(2, "0")}</div><div className="mt-2 text-xs text-slate-400">{unit.label}</div></div>)}
        </div>
        <div className="mt-9 rounded-full border border-[#d6ad61]/20 bg-[#d6ad61]/10 px-5 py-3 text-sm text-[#e8d3a8]">پایان وقفه: چهارشنبه ۴ آذر ۱۴۰۵، ساعت ۱۳:۰۴ به وقت تهران</div>
        <p className="mt-10 text-xs tracking-widest text-slate-500">DJ CASPIAN • THE NEXT ERA</p>
      </section>
    </main>
  );
}
