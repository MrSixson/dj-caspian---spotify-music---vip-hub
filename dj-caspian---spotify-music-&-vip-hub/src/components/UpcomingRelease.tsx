import React, { useEffect, useState } from 'react';
import { CalendarClock, BellRing } from 'lucide-react';

type Release = { enabled?: boolean; title?: string; description?: string; coverUrl?: string; releaseAt?: string; label?: string };

export const UpcomingRelease: React.FC = () => {
  const [release, setRelease] = useState<Release | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    let active = true;
    fetch(`${import.meta.env.BASE_URL}upcoming-release.json?ts=${Date.now()}`, { cache: 'no-store' })
      .then((r) => { if (!r.ok) throw new Error('Release schedule unavailable'); return r.json(); })
      .then((data: Release) => { if (active) setRelease(data); })
      .catch((e) => console.warn('Upcoming release unavailable:', e));
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  if (!release?.enabled || !release.releaseAt) return null;
  const target = new Date(release.releaseAt).getTime();
  if (!Number.isFinite(target) || target <= now) return null;
  const remaining = Math.max(0, Math.floor((target - now) / 1000));
  const units = [
    { label: 'روز', value: Math.floor(remaining / 86400) },
    { label: 'ساعت', value: Math.floor((remaining % 86400) / 3600) },
    { label: 'دقیقه', value: Math.floor((remaining % 3600) / 60) },
    { label: 'ثانیه', value: remaining % 60 },
  ];

  return <section dir="rtl" className="relative overflow-hidden rounded-3xl border border-[#d6b45c]/30 bg-gradient-to-l from-[#182b43] via-[#101722] to-[#17130c] p-5 sm:p-7 mb-8 shadow-xl">
    <div className="absolute -left-16 -top-20 h-56 w-56 rounded-full bg-[#d6b45c]/10 blur-3xl" />
    <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-[#d6b45c]/15 p-3 text-[#e7c875]"><CalendarClock className="w-6 h-6"/></div>
        <div><div className="text-[10px] tracking-[.24em] font-black text-[#e7c875]">NEXT DROP • CASPIAN PREMIERE</div>
          <h2 className="mt-2 text-xl sm:text-2xl font-black text-white">{release.title || 'انتشار جدید کاسپین'}</h2>
          <p className="mt-1 text-sm text-slate-300">{release.description || 'برای شنیدن انتشار بعدی آماده شو.'}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {units.map((unit) => <div key={unit.label} className="min-w-[64px] rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-center">
          <strong className="block text-2xl font-black tabular-nums text-[#f0d88a]">{String(unit.value).padStart(2,'0')}</strong>
          <span className="text-[10px] text-slate-400">{unit.label}</span>
        </div>)}
        <div className="flex items-center gap-1 text-[10px] text-[#e7c875]"><BellRing className="w-3.5 h-3.5"/> {release.label || 'منتظر انتشار باش'}</div>
      </div>
    </div>
  </section>;
};
