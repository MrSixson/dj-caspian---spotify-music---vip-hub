import React, { useEffect, useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { supabase } from '../lib/supabase';

type PublishedRelease = {
  id: string;
  version_name: string;
  version_code: number;
  release_notes: string;
  apk_url: string;
  is_mandatory: boolean;
};

// Current public Android build: v1.0.0-beta.1
const INSTALLED_VERSION_CODE = 1;

export const AppUpdatePrompt: React.FC = () => {
  const [release, setRelease] = useState<PublishedRelease | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let active = true;
    const check = async () => {
      const { data, error } = await supabase.from('app_releases')
        .select('id,version_name,version_code,release_notes,apk_url,is_mandatory')
        .eq('is_published', true)
        .order('version_code', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!active || error || !data) return;
      if (Number(data.version_code) > INSTALLED_VERSION_CODE) setRelease(data as PublishedRelease);
    };
    void check();
    const channel = supabase.channel('app-release-announcements')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_releases' }, () => { void check(); })
      .subscribe();
    return () => { active = false; void supabase.removeChannel(channel); };
  }, []);

  if (!release || (dismissed && !release.is_mandatory)) return null;
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" dir="rtl">
    <div className="w-full max-w-md rounded-3xl border border-[#d6b45c]/40 bg-[#101722] p-6 shadow-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#d6b45c]"><Smartphone className="w-6 h-6" /><span className="font-black">DJ CASPIAN UPDATE</span></div>
        {!release.is_mandatory && <button onClick={()=>setDismissed(true)} aria-label="بستن" className="text-neutral-400"><X className="w-5 h-5" /></button>}
      </div>
      <h2 className="text-xl font-black text-white">نسخه {release.version_name} منتشر شد</h2>
      <p className="text-sm text-neutral-300 whitespace-pre-line leading-7">{release.release_notes || 'نسخه جدید DJ Caspian آماده نصب است.'}</p>
      {release.is_mandatory && <p className="text-xs text-amber-300">این به‌روزرسانی ضروری اعلام شده است.</p>}
      <a href={release.apk_url} target="_blank" rel="noreferrer" className="w-full rounded-xl bg-[#d6b45c] py-3 text-center font-black text-black flex items-center justify-center gap-2"><Download className="w-4 h-4" /> دریافت نسخه جدید APK</a>
    </div>
  </div>;
};
