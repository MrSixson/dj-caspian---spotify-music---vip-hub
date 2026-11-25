import React, { useEffect, useMemo, useState } from 'react';
import { Search, Users, Headphones, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Profile = { id: string; username: string; display_name: string; avatar_path: string | null };
export const ProfilesView: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Profile | null>(null);
  const load = async () => {
    setLoading(true); setError('');
    const { data, error: fetchError } = await supabase.from('public_member_directory').select('id,username,display_name,avatar_path').order('username').limit(100);
    if (fetchError) setError('فهرست اعضا هنوز در دیتابیس آماده نیست. اجرای Migration جدید لازم است.');
    else setProfiles((data || []) as Profile[]);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);
  const filtered = useMemo(() => { const q=query.trim().toLowerCase(); return profiles.filter(p => !q || [p.username,p.display_name].some(v => (v||'').toLowerCase().includes(q))); }, [profiles,query]);
  const avatar = (path: string | null, name: string) => path ? supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl : `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'DJ')}&background=10243a&color=d6b45c&bold=true`;
  return <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-7" dir="rtl">
    <section className="relative overflow-hidden rounded-[2rem] border border-[#d6b45c]/25 bg-gradient-to-br from-[#153451] via-[#091522] to-black p-7 sm:p-10">
      <div className="absolute -left-16 -top-20 w-72 h-72 rounded-full bg-[#d6b45c]/10 blur-3xl" />
      <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-5"><div><div className="text-[10px] tracking-[.35em] font-black text-[#d6b45c]">CASPIAN COMMUNITY</div><h1 className="text-3xl sm:text-5xl font-black text-white mt-3">جامعه کاسپین</h1><p className="text-sm sm:text-base text-slate-300 mt-3 max-w-xl">آدم‌هایی که موسیقی کاسپین را زندگی می‌کنند، اینجا کنار هم‌اند.</p></div><div className="flex items-center gap-3 rounded-2xl bg-black/30 border border-white/10 px-5 py-4"><Users className="text-[#d6b45c]"/><div><strong className="text-2xl text-white">{profiles.length.toLocaleString('fa-IR')}</strong><div className="text-xs text-slate-400">عضو ثبت‌شده</div></div></div></div>
    </section>
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between"><div><h2 className="text-xl font-black text-white">اعضای جامعه</h2><p className="text-xs text-slate-500 mt-1">پروفایل‌های عمومی کاربران</p></div><div className="flex gap-2"><div className="relative flex-1 sm:w-80"><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="جستجوی نام یا آیدی..." className="w-full rounded-xl bg-[#0b1624] border border-white/10 py-3 pr-10 pl-3 text-sm text-white outline-none focus:border-[#d6b45c]/50"/></div><button onClick={()=>void load()} className="rounded-xl border border-white/10 px-3 text-slate-300 hover:text-white" title="بروزرسانی"><RefreshCw className="w-4 h-4"/></button></div></div>
    {loading ? <div className="py-20 text-center text-slate-400">در حال بارگذاری جامعه کاسپین...</div> : error ? <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 text-amber-200 text-sm">{error}</div> : filtered.length ? <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">{filtered.map(p=><article key={p.id} role="button" tabIndex={0} onClick={()=>setSelected(p)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' ')setSelected(p)}} className="group cursor-pointer rounded-2xl border border-white/10 bg-gradient-to-br from-[#11243a]/80 to-[#070d15] p-5 hover:border-[#d6b45c]/40 transition-all"><div className="flex items-center gap-4"><img src={avatar(p.avatar_path,p.display_name||p.username)} alt="" className="w-16 h-16 rounded-2xl object-cover border border-[#d6b45c]/20"/><div className="min-w-0 flex-1"><h3 className="font-black text-white truncate">{p.display_name||p.username}</h3><div className="text-xs text-slate-500 font-mono mt-1" dir="ltr">@{p.username}</div></div></div><div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500"><span className="flex items-center gap-1"><Headphones className="w-3.5 h-3.5"/> عضو جامعه DJ Caspian</span><span className="text-[#d6b45c]">CASPIAN MEMBER</span></div></article>)}</div> : <div className="py-16 text-center text-slate-500">عضوی با این مشخصات پیدا نشد.</div>}
  {selected && <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4" onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null)}}><section role="dialog" aria-modal="true" className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-[#d6b45c]/30 bg-gradient-to-br from-[#153451] via-[#091522] to-black p-7 text-center shadow-2xl"><button onClick={()=>setSelected(null)} className="absolute left-4 top-4 rounded-full bg-white/10 px-3 py-2 text-xs text-slate-300">بستن</button><div className="mx-auto mt-5 w-28 h-28 rounded-[2rem] overflow-hidden border-2 border-[#d6b45c]/50 shadow-[0_0_50px_rgba(214,180,92,.16)]"><img src={avatar(selected.avatar_path,selected.display_name||selected.username)} alt="" className="w-full h-full object-cover"/></div><div className="mt-5 text-[10px] tracking-[.3em] text-[#d6b45c] font-black">DJ CASPIAN MEMBER PROFILE</div><h2 className="mt-2 text-2xl font-black text-white">{selected.display_name||selected.username}</h2><p className="mt-1 text-sm font-mono text-slate-400" dir="ltr">@{selected.username}</p><div className="mt-7 rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-slate-400">عضو جامعه موسیقی DJ Caspian <span className="text-[#d6b45c]">✦</span></div></section></div>}
  </div>;
};
