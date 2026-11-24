import React, { useState } from 'react';
import { Coins, Check, Copy, Sparkles, Crown, ShieldCheck, ExternalLink, HeartHandshake, ClipboardCheck } from 'lucide-react';
import { VipTicket } from '../types';

interface SupportVipViewProps {
  onAddTicket: (ticket: VipTicket) => Promise<VipTicket>;
  onShowToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  isUserVip: boolean;
  userId: string | null;
}

const DONATE_URL = 'https://donito.me/dj_caspian';

const DONITO_TOOLS = [
  { title: 'بیشترین حمایت‌ها در ۲۴ ساعت گذشته', description: 'نمایش حامیان برتر روز و میزان مشارکت جامعه.', url: 'https://donito.me/overlays/6V8EJKK9XPGAPS6KAP655NZWG7SEWRVGEV6EW9E4YD9KYE5JABVE48NJBZP', tag: 'TOP SUPPORTERS' },
  { title: 'هدف حمایت مالی', description: 'نمایش پیشرفت هدف مالی و نزدیک‌شدن به آن.', url: 'https://donito.me/overlays/R76X5BBJ9K6JEFPRBVPNN6Y76538P9WAKDWRK55HRP68BYZ7JY6EF6RKX9J', tag: 'DONATION GOAL' },
  { title: 'آخرین حمایت‌ها', description: 'نمایش حمایت‌های تازه ثبت‌شده به‌صورت فهرست عمودی.', url: 'https://donito.me/overlays/APYZKBBVAREW74RXYPRGGZ8WZ7FJZXR78BAJ5Z6CBGY55JKVG6BKFW5NJXX', tag: 'LATEST DONATIONS' },
];

export const SupportVipView: React.FC<SupportVipViewProps> = ({ onShowToast, isUserVip }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyLink = async (url: string, key: string, label: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedKey(key);
      onShowToast(`${label} کپی شد.`, 'success');
      window.setTimeout(() => setCopiedKey(null), 2200);
    } catch {
      onShowToast('کپی خودکار در این مرورگر در دسترس نیست؛ لینک را با دکمه مشاهده باز کنید.', 'error');
    }
  };

  return (
    <main className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300" dir="rtl">
      <section className="relative overflow-hidden rounded-3xl border border-[#d6b45c]/25 bg-gradient-to-br from-[#101b2a] via-[#10151e] to-[#090d13] p-6 sm:p-10 shadow-2xl">
        <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-[#d6b45c]/10 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#d6b45c]/30 bg-[#d6b45c]/10 px-3 py-1 text-xs font-bold text-[#e6c978]">
              <HeartHandshake className="h-4 w-4" /> حمایت رسمی از DJ CASPIAN
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">حمایت از <span className="text-[#d6b45c]">DJ CASPIAN</span></h1>
            <p className="text-sm sm:text-base leading-7 text-neutral-300">
              اگر موسیقی‌ها و فعالیت‌های DJ CASPIAN برات ارزشمند بوده، از طریق درگاه رسمی Donito حمایت کن. تمام پرداخت‌های این بخش فقط از همین مسیر انجام می‌شوند.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <a href={DONATE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d6b45c] to-[#f0d88a] px-6 py-3 font-black text-sm text-[#111] shadow-lg shadow-[#d6b45c]/10 hover:brightness-110">
                <Coins className="h-4 w-4" /> حمایت مالی در Donito <ExternalLink className="h-4 w-4" />
              </a>
              <button type="button" onClick={() => copyLink(DONATE_URL, 'donate', 'لینک حمایت')} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">
                {copiedKey === 'donate' ? <Check className="h-4 w-4 text-[#d6b45c]" /> : <Copy className="h-4 w-4" />}
                {copiedKey === 'donate' ? 'لینک کپی شد' : 'کپی لینک دونیت'}
              </button>
            </div>
          </div>
          <div className="min-w-[210px] rounded-2xl border border-white/10 bg-black/30 p-5 text-center">
            <div className="mb-2 text-xs text-neutral-400">وضعیت حساب شما</div>
            {isUserVip ? <div className="inline-flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-sm font-bold text-amber-300"><Crown className="h-5 w-5" /> VIP فعال</div> : <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-neutral-200"><ShieldCheck className="h-5 w-5" /> حساب عادی</div>}
            <p className="mt-3 text-[11px] leading-5 text-neutral-500">وضعیت VIP حساب از اطلاعات حساب کاربری خوانده می‌شود.</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-black text-white">چطور حمایت کنم؟</h2>
          <p className="mt-1 text-sm text-neutral-400">سه قدم کوتاه؛ بدون فرم پرداخت دستی و بدون ارسال اطلاعات بانکی در سایت.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { n: '۰۱', title: 'ورود به Donito', body: 'روی دکمه حمایت مالی بزن تا صفحه رسمی DJ CASPIAN باز شود.' },
            { n: '۰۲', title: 'ثبت حمایت', body: 'مبلغ و اطلاعات موردنیاز را فقط در صفحه امن Donito وارد و پرداخت را تکمیل کن.' },
            { n: '۰۳', title: 'پیگیری حمایت', body: 'رسید و وضعیت پرداخت را در Donito نگه دار. ثبت حمایت در سایت فقط پس از اتصال و تأیید رویداد پرداخت ممکن است.' },
          ].map(step => <article key={step.n} className="rounded-2xl border border-white/10 bg-[#101722] p-5">
            <span className="text-xs font-black tracking-widest text-[#d6b45c]">{step.n}</span>
            <h3 className="mt-2 font-bold text-white">{step.title}</h3>
            <p className="mt-2 text-xs leading-6 text-neutral-400">{step.body}</p>
          </article>)}
        </div>
      </section>

      <section className="space-y-5" aria-labelledby="donito-tools-title">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wide text-[#d6b45c]"><Sparkles className="h-4 w-4" /> DONITO • LIVE WIDGETS</div>
          <h2 id="donito-tools-title" className="mt-2 text-2xl font-black text-white">ابزارهای حمایت زنده</h2>
          <p className="mt-1 text-sm text-neutral-400">پیش‌نمایش ابزارها، همراه با لینک مستقیم و امکان کپی هر آدرس.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {DONITO_TOOLS.map(tool => <article key={tool.url} className="overflow-hidden rounded-2xl border border-[#d6b45c]/20 bg-[#0b1421]/85">
            <div className="flex items-start justify-between gap-3 p-4">
              <div><span className="text-[10px] font-black tracking-widest text-[#d6b45c]">{tool.tag}</span><h3 className="mt-1 font-bold text-white">{tool.title}</h3><p className="mt-1 text-xs leading-6 text-neutral-400">{tool.description}</p></div>
              <Sparkles className="h-5 w-5 shrink-0 text-[#d6b45c]" />
            </div>
            <div className="mx-4 mb-3 overflow-hidden rounded-xl border border-white/10 bg-[#05080e]">
              <iframe title={tool.title} src={tool.url} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" className="h-44 w-full border-0" />
            </div>
            <div className="flex flex-wrap gap-2 px-4 pb-4">
              <a href={tool.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-[#173657] px-3 py-2 text-xs font-bold text-white hover:bg-[#214b75]">باز کردن ابزار <ExternalLink className="h-3.5 w-3.5" /></a>
              <button type="button" onClick={() => copyLink(tool.url, tool.tag, 'لینک ابزار')} className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs font-bold text-neutral-200 hover:bg-white/10">
                {copiedKey === tool.tag ? <Check className="h-3.5 w-3.5 text-[#d6b45c]" /> : <Copy className="h-3.5 w-3.5" />}{copiedKey === tool.tag ? 'کپی شد' : 'کپی لینک'}
              </button>
            </div>
          </article>)}
        </div>
        <p className="text-[11px] leading-6 text-neutral-500">اگر Donito اجازه نمایش درون‌صفحه‌ای ندهد، ابزار را با دکمه «باز کردن ابزار» در صفحه اصلی خودش ببین.</p>
      </section>

      <section className="rounded-2xl border border-[#d6b45c]/20 bg-[#101722] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <ClipboardCheck className="mt-1 h-5 w-5 shrink-0 text-[#d6b45c]" />
          <div>
            <h2 className="font-bold text-white">نکات مهم درباره پرداخت</h2>
            <ul className="mt-2 space-y-2 text-xs leading-6 text-neutral-400">
              <li>• تنها روش حمایت مالی این سایت، لینک رسمی Donito است.</li>
              <li>• هیچ شماره کارت، شماره شبا یا آدرس کیف پولی در این صفحه دریافت نمی‌شود.</li>
              <li>• اطلاعات پرداخت را فقط در صفحه رسمی Donito وارد کن.</li>
              <li>• تا زمانی که اتصال تأییدشده Donito به حساب کاربری فعال نشده، پرداخت را معادل فعال‌شدن خودکار VIP در نظر نگیر.</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
};
