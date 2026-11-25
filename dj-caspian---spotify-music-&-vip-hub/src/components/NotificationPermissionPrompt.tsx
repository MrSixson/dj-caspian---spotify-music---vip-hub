import { useEffect, useState } from 'react';
import { Bell, BellRing, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

const SNOOZE_KEY = 'dj-caspian-notification-prompt-snooze-until';
const SNOOZE_DAYS = 7;

type NotificationPermissionState = NotificationPermission | 'unsupported';

function readPermission(): NotificationPermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

async function showSiteNotification(title: string, body: string, url = '/') {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const target = new URL(url, window.location.origin);
  if (target.origin !== window.location.origin) target.pathname = '/';
  try {
    const registration = await navigator.serviceWorker?.ready;
    if (registration?.showNotification) {
      await registration.showNotification(title, {
        body,
        icon: new URL('favicon.ico', import.meta.env.BASE_URL).toString(),
        badge: new URL('favicon.ico', import.meta.env.BASE_URL).toString(),
        tag: 'dj-caspian-' + title.slice(0, 40),
        data: { url: target.pathname + target.search },
      });
    } else {
      const notification = new Notification(title, { body, icon: new URL('favicon.ico', import.meta.env.BASE_URL).toString() });
      notification.onclick = () => {
        window.focus();
        window.location.assign(target.toString());
      };
    }
  } catch (error) {
    console.warn('[DJ Caspian] Could not display browser notification:', error);
  }
}

export function NotificationPermissionPrompt() {
  const [permission, setPermission] = useState<NotificationPermissionState>(readPermission);
  const [visible, setVisible] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (permission !== 'default' || !window.isSecureContext) return;
    const snoozedUntil = Number(localStorage.getItem(SNOOZE_KEY) || 0);
    if (Date.now() >= snoozedUntil) setVisible(true);
  }, [permission]);

  useEffect(() => {
    if (permission !== 'granted') return;
    const channel = supabase.channel('dj-caspian-browser-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tracks' }, (payload) => {
        const track = payload.new as { title?: string; artist?: string };
        void showSiteNotification(
          '🎵 آهنگ جدید در DJ Caspian',
          [track.title, track.artist].filter(Boolean).join(' • ') || 'یک آهنگ تازه منتشر شد.'
        );
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_releases' }, (payload) => {
        const release = payload.new as { is_published?: boolean; version_name?: string; release_notes?: string; is_mandatory?: boolean };
        if (!release.is_published) return;
        void showSiteNotification(
          release.is_mandatory ? '🔔 به‌روزرسانی ضروری DJ Caspian' : '✨ نسخه جدید DJ Caspian',
          release.release_notes || ('نسخه ' + (release.version_name || 'جدید') + ' منتشر شد.')
        );
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [permission]);

  const enableNotifications = async () => {
    if (!('Notification' in window)) {
      setPermission('unsupported');
      setVisible(false);
      return;
    }
    setRequesting(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      setVisible(false);
      if (result === 'granted') {
        await showSiteNotification('اعلان‌های DJ Caspian فعال شد 💙', 'از این به بعد از آهنگ‌ها و به‌روزرسانی‌های جدید باخبر می‌شوی.');
      }
    } finally {
      setRequesting(false);
    }
  };

  const remindLater = () => {
    localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000));
    setVisible(false);
  };

  if (!visible || permission !== 'default' || !window.isSecureContext) return null;

  return (
    <div className="fixed z-[90] top-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-[min(420px,calc(100vw-2rem))]" dir="rtl">
      <div className="relative overflow-hidden rounded-2xl border border-[#d6b45c]/35 bg-[#11151d]/95 p-4 text-white shadow-2xl shadow-black/50 backdrop-blur-xl">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-[#d6b45c] to-transparent" />
        <button type="button" onClick={remindLater} aria-label="بستن اعلان" className="absolute left-3 top-3 rounded-full p-1.5 text-neutral-400 transition hover:bg-white/10 hover:text-white">
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#d6b45c]/25 bg-[#d6b45c]/10 text-[#e5c66f]">
            <BellRing className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 pl-5">
            <div className="font-bold text-sm">از اتفاق‌های تازه باخبر شو!</div>
            <p className="mt-1 text-xs leading-6 text-neutral-300">
              اجازه اعلان‌های DJ Caspian را فعال کن تا انتشار آهنگ‌های جدید و به‌روزرسانی‌ها را از دست ندهی.
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <button type="button" onClick={() => void enableNotifications()} disabled={requesting} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#d6b45c] px-4 py-2.5 text-xs font-extrabold text-black transition hover:bg-[#e7c975] disabled:opacity-60">
            <Bell className="h-4 w-4" />
            {requesting ? 'در حال اتصال...' : 'اجازه دادن'}
          </button>
          <button type="button" onClick={remindLater} className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-neutral-300 transition hover:bg-white/5 hover:text-white">
            فعلاً نه
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-neutral-500">هر زمان بخواهی می‌توانی دسترسی اعلان‌ها را از تنظیمات مرورگر تغییر بدهی.</p>
      </div>
    </div>
  );
}
