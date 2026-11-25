import React, { useEffect, useState } from 'react';
import { Download, Send, Smartphone, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

type GitHubReleaseAsset = { name: string; browser_download_url: string };
type GitHubRelease = { tag_name: string; draft: boolean; assets: GitHubReleaseAsset[] };

type Release = {
  id: string;
  version_name: string;
  version_code: number;
  release_notes: string;
  apk_url: string;
  is_mandatory: boolean;
  is_published: boolean;
  published_at: string | null;
};

export const AppReleaseManager: React.FC<{ userId: string; onShowToast: (text: string, type?: 'success' | 'error' | 'info') => void }> = ({ userId, onShowToast }) => {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [versionName, setVersionName] = useState('');
  const [versionCode, setVersionCode] = useState(0);
  const [apkUrl, setApkUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [mandatory, setMandatory] = useState(false);
  const [publishNow, setPublishNow] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('app_releases').select('*').order('version_code', { ascending: false }).limit(20);
    if (error) onShowToast('دریافت نسخه‌های برنامه ناموفق بود: ' + error.message, 'error');
    else setReleases((data || []) as Release[]);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  // Pre-fill the exact APK/version produced by the latest successful Android workflow.
  useEffect(() => {
    let active = true;
    const loadLatestBuild = async () => {
      try {
        const response = await fetch('https://api.github.com/repos/MrSixson/dj-caspian---spotify-music---vip-hub/releases?per_page=10', {
          headers: { Accept: 'application/vnd.github+json' },
        });
        if (!response.ok) throw new Error(`GitHub release lookup failed: ${response.status}`);
        const releases = await response.json() as GitHubRelease[];
        const latest = releases.find((item) => !item.draft && /^android-v\\d+\\.\\d+\\.\\d+$/.test(item.tag_name)
          && item.assets.some((asset) => asset.name === 'DJ-Caspian.apk'));
        if (!active || !latest) return;
        const version = latest.tag_name.replace(/^android-v/, '');
        const code = Number(version.split('.').at(-1));
        const apk = latest.assets.find((asset) => asset.name === 'DJ-Caspian.apk');
        if (!apk || !Number.isSafeInteger(code) || code < 1) return;
        setVersionName(version);
        setVersionCode(code);
        setApkUrl(apk.browser_download_url);
      } catch (error) {
        console.warn('[DJ Caspian] Could not prefill latest Android build:', error);
      }
    };
    void loadLatestBuild();
    return () => { active = false; };
  }, []);

  const publish = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!versionName.trim() || !Number.isInteger(versionCode) || versionCode < 1 || !/^https:\/\//i.test(apkUrl.trim())) {
      onShowToast('شماره نسخه، کد نسخه و لینک HTTPS معتبر الزامی است.', 'error');
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('app_releases').insert({
      version_name: versionName.trim(),
      version_code: versionCode,
      release_notes: notes.trim(),
      apk_url: apkUrl.trim(),
      is_mandatory: mandatory,
      is_published: publishNow,
      published_at: publishNow ? new Date().toISOString() : null,
      created_by: userId,
    });
    setSaving(false);
    if (error) { onShowToast('ثبت نسخه ناموفق بود: ' + error.message, 'error'); return; }
    onShowToast(publishNow ? 'نسخه جدید منتشر شد و برای برنامه‌های آنلاین قابل مشاهده است.' : 'نسخه به‌صورت پیش‌نویس ذخیره شد.', 'success');
    if (publishNow) {
      void supabase.functions.invoke('send-push-notification', {
        body: {
          title: '📲 به‌روزرسانی DJ Caspian',
          body: `نسخه ${versionName.trim()} منتشر شد. برای دریافت نسخه جدید وارد برنامه شو.`,
          url: '/',
        },
      }).then(({ error, data }) => {
        if (error) {
          onShowToast('نسخه منتشر شد، اما اعلان ارسال نشد: ' + error.message, 'error');
        } else if (data?.sent === 0) {
          onShowToast('نسخه منتشر شد، اما هنوز هیچ دستگاهی برای دریافت اعلان ثبت نشده است.', 'info');
        } else {
          onShowToast(`اعلان به ${data?.sent ?? 0} دستگاه ارسال شد.`, 'success');
        }
      });
    }
    setVersionName(''); setVersionCode(0); setApkUrl(''); setNotes(''); setMandatory(false);
    await load();
  };

  const togglePublish = async (release: Release) => {
    const next = !release.is_published;
    const { error } = await supabase.from('app_releases').update({ is_published: next, published_at: next ? new Date().toISOString() : null }).eq('id', release.id);
    if (error) onShowToast('تغییر وضعیت انتشار ناموفق بود: ' + error.message, 'error');
    else { onShowToast(next ? 'نسخه منتشر شد.' : 'نسخه از انتشار خارج شد.', 'success'); await load(); }
  };

  return <section className="space-y-5">
    <div className="rounded-2xl border border-[#d6b45c]/30 bg-[#181818] p-5 space-y-2">
      <div className="flex items-center gap-2 text-white font-bold"><Smartphone className="w-5 h-5 text-[#d6b45c]" /> مدیریت انتشار نسخه اندروید</div>
      <p className="text-xs text-neutral-400 leading-6">آخرین APK ساخته‌شده به‌همراه نام نسخه، کد نسخه و لینک دانلود به‌صورت خودکار از GitHub دریافت می‌شود. توضیحات را وارد کن و اگر می‌خواهی کاربران تا نصب نسخه جدید نتوانند از برنامه استفاده کنند، «آپدیت ضروری» را فعال کن. اعلان پوش برای دستگاه‌هایی ارسال می‌شود که توکن ثبت کرده‌اند و اتصال Firebase سمت سرور کامل باشد.</p>
    </div>
    <form onSubmit={publish} className="rounded-2xl border border-neutral-800 bg-[#181818] p-5 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="text-xs text-neutral-300 space-y-1">نام نسخه<input value={versionName} onChange={e=>setVersionName(e.target.value)} required placeholder="از آخرین APK دریافت می‌شود" className="w-full rounded-xl bg-[#242424] border border-neutral-700 p-3 text-white" /></label>
        <label className="text-xs text-neutral-300 space-y-1">کد نسخه (باید با APK یکسان باشد)<input type="number" min="1" value={versionCode} onChange={e=>setVersionCode(Number(e.target.value))} required className="w-full rounded-xl bg-[#242424] border border-neutral-700 p-3 text-white" /></label>
      </div>
      <label className="block text-xs text-neutral-300 space-y-1">لینک مستقیم APK<input type="url" value={apkUrl} onChange={e=>setApkUrl(e.target.value)} required placeholder="https://github.com/.../DJ-Caspian.apk" className="w-full rounded-xl bg-[#242424] border border-neutral-700 p-3 text-white text-left" dir="ltr" /></label>
      <label className="block text-xs text-neutral-300 space-y-1">توضیحات تغییرات<textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3} placeholder="قابلیت‌های جدید و رفع اشکال‌ها..." className="w-full rounded-xl bg-[#242424] border border-neutral-700 p-3 text-white" /></label>
      <div className="flex flex-wrap gap-4 text-xs text-neutral-300">
        <label className="flex items-center gap-2"><input type="checkbox" checked={mandatory} onChange={e=>setMandatory(e.target.checked)} /> آپدیت ضروری</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={publishNow} onChange={e=>setPublishNow(e.target.checked)} /> انتشار فوری</label>
      </div>
      <button disabled={saving} className="rounded-xl bg-[#d6b45c] text-black font-bold px-5 py-3 text-sm disabled:opacity-50 flex items-center gap-2"><Send className="w-4 h-4" />{saving ? 'در حال ثبت...' : 'ثبت نسخه برنامه'}</button>
    </form>
    <div className="flex items-center justify-between"><h3 className="text-white font-bold">نسخه‌های ثبت‌شده</h3><button onClick={()=>void load()} className="text-neutral-400 text-xs flex items-center gap-1"><RefreshCw className="w-3.5 h-3.5" /> تازه‌سازی</button></div>
    {loading ? <p className="text-neutral-500 text-sm">در حال دریافت...</p> : releases.length === 0 ? <p className="text-neutral-500 text-sm">هنوز نسخه‌ای ثبت نشده است.</p> : releases.map(release=><div key={release.id} className="rounded-xl border border-neutral-800 bg-[#181818] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div><div className="text-white font-bold">نسخه {release.version_name} <span className="text-xs text-neutral-500">#{release.version_code}</span></div><p className="text-xs text-neutral-400 mt-1">{release.release_notes || 'بدون توضیحات'}</p><p className="text-[11px] text-neutral-500 mt-1">{release.is_published ? 'منتشرشده' : 'پیش‌نویس'} · {release.is_mandatory ? 'ضروری' : 'اختیاری'}</p></div>
      <div className="flex gap-2"><a href={release.apk_url} target="_blank" rel="noreferrer" className="text-xs text-[#d6b45c] flex items-center gap-1"><Download className="w-4 h-4" /> APK</a><button onClick={()=>void togglePublish(release)} className="rounded-lg bg-neutral-800 px-3 py-2 text-xs text-white">{release.is_published ? 'لغو انتشار' : 'انتشار'}</button></div>
    </div>)}
  </section>;
};
