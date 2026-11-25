import React, { useState } from 'react';
import {
  ArrowUpRight, Check, Copy, Crown, Disc3, ExternalLink, Gamepad2,
  Globe, Headphones, Instagram, MessageCircle, Music2, Send, ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { DJ_CASPIAN_INFO } from '../data/initialData';

interface AboutViewProps {
  onNavigateToSupport: () => void;
  onShowToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  isUserVip: boolean;
}

const SITE_URL = 'https://mrsixson.github.io/dj-caspian---spotify-music---vip-hub/';

export const AboutView: React.FC<AboutViewProps> = ({
  onNavigateToSupport,
  onShowToast,
  isUserVip,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const { socials } = DJ_CASPIAN_INFO;

  const copyValue = async (value: string, key: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      onShowToast(`${label} کپی شد.`, 'success');
      window.setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      onShowToast('امکان کپی خودکار در این مرورگر وجود ندارد.', 'error');
    }
  };

  const channels = [
    {
      key: 'instagram',
      title: socials.instagram.title,
      handle: socials.instagram.id,
      description: socials.instagram.description,
      href: socials.instagram.link,
      label: 'مشاهده اینستاگرام',
      Icon: Instagram,
      accent: 'border-pink-500/25 hover:border-pink-400/60',
      iconStyle: 'bg-pink-500/10 text-pink-300',
      buttonStyle: 'bg-gradient-to-r from-pink-600 to-purple-600 hover:brightness-110',
    },
    {
      key: 'discord',
      title: socials.discord.title,
      handle: socials.discord.id,
      description: socials.discord.description,
      href: socials.discord.link,
      label: 'ورود به دیسکورد',
      Icon: MessageCircle,
      accent: 'border-indigo-500/25 hover:border-indigo-400/60',
      iconStyle: 'bg-indigo-500/10 text-indigo-300',
      buttonStyle: 'bg-indigo-600 hover:bg-indigo-500',
    },
    {
      key: 'telegram',
      title: socials.telegram.title,
      handle: socials.telegram.handle,
      description: socials.telegram.description,
      href: socials.telegram.link,
      label: 'ورود به تلگرام',
      Icon: Send,
      accent: 'border-sky-500/25 hover:border-sky-400/60',
      iconStyle: 'bg-sky-500/10 text-sky-300',
      buttonStyle: 'bg-sky-600 hover:bg-sky-500',
    },
    {
      key: 'teamspeak',
      title: socials.teamspeak.title,
      handle: socials.teamspeak.serverAddress,
      description: socials.teamspeak.description,
      href: socials.teamspeak.link,
      label: 'اتصال با TeamSpeak',
      Icon: Headphones,
      accent: 'border-blue-500/25 hover:border-blue-400/60',
      iconStyle: 'bg-blue-500/10 text-blue-300',
      buttonStyle: 'bg-blue-600 hover:bg-blue-500',
    },
  ];

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-4 sm:p-8 animate-in fade-in duration-300" dir="rtl">
      <section className="relative overflow-hidden rounded-3xl border border-[#d6b45c]/25 bg-gradient-to-br from-[#13243a] via-[#0b1421] to-[#070b12] p-6 sm:p-10 shadow-2xl">
        <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[#d6b45c]/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d6b45c]/30 bg-[#d6b45c]/10 px-3 py-1 text-xs font-bold text-[#e6c978]">
              <Sparkles className="h-4 w-4" /> درباره و راه‌های ارتباطی رسمی
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
              DJ <span className="text-[#d6b45c]">CASPIAN</span>
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-neutral-300 sm:text-base">
              {DJ_CASPIAN_INFO.bio}
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <a href={SITE_URL} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#d6b45c] px-5 py-3 text-sm font-black text-[#101010] hover:brightness-110">
                <Globe className="h-4 w-4" /> وب‌سایت رسمی <ExternalLink className="h-4 w-4" />
              </a>
              <button type="button" onClick={onNavigateToSupport}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">
                <Crown className="h-4 w-4 text-[#d6b45c]" /> حمایت از DJ CASPIAN
              </button>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-white/10 bg-black/25 p-4">
            <img src={DJ_CASPIAN_INFO.avatarUrl} alt="DJ Caspian" className="h-20 w-20 rounded-2xl border border-[#d6b45c]/40 object-cover sm:h-24 sm:w-24" />
            <div>
              <div className="font-black text-white">دی‌جی کاسپین</div>
              <div className="mt-1 text-xs text-neutral-400">موسیقی و جامعه شنوندگان</div>
              <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold">
                {isUserVip ? <><Crown className="h-4 w-4 text-[#d6b45c]" /><span className="text-[#e6c978]">عضویت VIP فعال</span></> : <><ShieldCheck className="h-4 w-4 text-neutral-400" /><span className="text-neutral-300">خوش آمدید</span></>}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-white/10 bg-[#101722] p-5 sm:p-6">
          <div className="mb-3 flex items-center gap-2 text-white">
            <Disc3 className="h-5 w-5 text-[#d6b45c]" />
            <h2 className="text-lg font-black">درباره پروژه</h2>
          </div>
          <p className="text-sm leading-7 text-neutral-300">
            این وب‌سایت مرکز دسترسی به آثار منتشرشده DJ CASPIAN است؛ جایی برای جست‌وجو و شنیدن موسیقی، ساخت و مدیریت پلی‌لیست‌ها، نگهداری علاقه‌مندی‌ها و استفاده از امکانات حساب کاربری. محتوای تازه از طریق همین پلتفرم معرفی و در دسترس قرار می‌گیرد.
          </p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-[#101722] p-5 sm:p-6">
          <div className="mb-3 flex items-center gap-2 text-white">
            <Music2 className="h-5 w-5 text-[#d6b45c]" />
            <h2 className="text-lg font-black">موسیقی و تجربه شنیدن</h2>
          </div>
          <p className="text-sm leading-7 text-neutral-300">
            تمرکز این مجموعه بر ریمیکس‌ها، موسیقی الکترونیک، فضای کلاب و مجموعه‌های منتخب است. کیفیت و اطلاعات هر قطعه بر اساس فایل و مشخصات واقعی همان اثر نمایش داده می‌شود؛ نه آمار تزئینی و ادعاهای بی‌منبع.
          </p>
        </article>
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-black tracking-widest text-[#d6b45c]">OFFICIAL CHANNELS</div>
            <h2 className="mt-2 text-2xl font-black text-white">شبکه‌های رسمی DJ CASPIAN</h2>
            <p className="mt-1 text-sm text-neutral-400">برای دنبال‌کردن خبرها، محتوا و ارتباط با جامعه شنوندگان.</p>
          </div>
          <span className="text-xs text-neutral-500">لینک‌ها در پنجره جدید باز می‌شوند.</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {channels.map(({ key, title, handle, description, href, label, Icon, accent, iconStyle, buttonStyle }) => (
            <article key={key} className={`flex flex-col justify-between rounded-2xl border bg-[#0e1622] p-5 transition-colors ${accent}`}>
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconStyle}`}><Icon className="h-5 w-5" /></div>
                  <button type="button" onClick={() => copyValue(key === 'teamspeak' ? handle : href, key, 'آدرس')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs font-bold text-neutral-300 hover:bg-white/10">
                    {copiedKey === key ? <Check className="h-3.5 w-3.5 text-[#d6b45c]" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedKey === key ? 'کپی شد' : 'کپی لینک'}
                  </button>
                </div>
                <h3 className="mt-4 font-black text-white">{title}</h3>
                <div className="mt-1 break-all font-mono text-xs text-neutral-400" dir="ltr">{handle}</div>
                <p className="mt-3 text-sm leading-6 text-neutral-400">{description}</p>
              </div>
              <a href={href} target={key === 'teamspeak' ? undefined : '_blank'} rel={key === 'teamspeak' ? undefined : 'noopener noreferrer'}
                className={`mt-5 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black text-white ${buttonStyle}`}>
                {label} <ArrowUpRight className="h-4 w-4" />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <div className="text-xs font-black tracking-widest text-[#d6b45c]">CASPIAN ROLEPLAY</div>
          <h2 className="mt-2 text-2xl font-black text-white">کامیونیتی و سرور Caspian</h2>
          <p className="mt-1 text-sm leading-6 text-neutral-400">شبکه‌های مربوط به جامعه رول‌پلی کاسپین از کانال‌های موسیقی DJ CASPIAN جدا نگه داشته شده‌اند.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-blue-500/25 bg-gradient-to-br from-[#10213a] to-[#0b111b] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300"><Headphones className="h-5 w-5" /></div>
              <div><h3 className="font-black text-white">TeamSpeak Caspian</h3><p className="mt-1 font-mono text-sm text-blue-300" dir="ltr">{socials.teamspeak.serverAddress}</p></div>
            </div>
            <p className="mt-3 text-xs leading-6 text-neutral-400">برای اتصال، TeamSpeak را نصب داشته باش و از دکمه زیر استفاده کن.</p>
            <a href={socials.teamspeak.link} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-black text-white hover:bg-blue-500">اتصال به سرور صوتی <ArrowUpRight className="h-4 w-4" /></a>
          </article>
          <article className="rounded-2xl border border-[#d6b45c]/25 bg-gradient-to-br from-[#211c10] to-[#0d1118] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#d6b45c]/10 text-[#d6b45c]"><Gamepad2 className="h-5 w-5" /></div>
              <div><h3 className="font-black text-white">سرور بازی MTA</h3><p className="mt-1 text-sm text-neutral-300">{socials.serverIp.status}</p></div>
            </div>
            <p className="mt-3 text-xs leading-6 text-neutral-400">آدرس اتصال سرور بازی در اطلاعات فعلی تأیید نشده؛ برای جلوگیری از نمایش IP اشتباه، فعلاً آدرس ساختگی درج نشده است.</p>
            <div className="mt-4 rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-center text-xs text-neutral-400">IP سرور: در انتظار تأیید</div>
          </article>
        </div>
      </section>

      <section className="rounded-2xl border border-[#d6b45c]/20 bg-[#101722] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-white"><Globe className="h-5 w-5 text-[#d6b45c]" /><h2 className="font-black">وب‌سایت رسمی DJ CASPIAN</h2></div>
            <p className="mt-2 break-all font-mono text-xs text-neutral-400" dir="ltr">{SITE_URL}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => copyValue(SITE_URL, 'site', 'آدرس سایت')} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/10">
              {copiedKey === 'site' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} کپی آدرس
            </button>
            <a href={SITE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-[#d6b45c] px-4 py-2.5 text-xs font-black text-black hover:brightness-110">
              باز کردن سایت <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};
