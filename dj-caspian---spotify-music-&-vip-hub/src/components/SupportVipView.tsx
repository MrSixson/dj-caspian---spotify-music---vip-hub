import React, { useState } from 'react';
import { 
  CreditCard, Coins, Check, Copy, Upload, Send, Sparkles, 
  Crown, ShieldCheck, Clock, FileText, ExternalLink, QrCode
} from 'lucide-react';
import { DJ_CASPIAN_INFO } from '../data/initialData';
import { VipTicket } from '../types';
import confetti from 'canvas-confetti';
import { supabase } from '../lib/supabase';

interface SupportVipViewProps {
  onAddTicket: (ticket: VipTicket) => Promise<VipTicket>;
  onShowToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  isUserVip: boolean;
  userId: string | null;
}

export const SupportVipView: React.FC<SupportVipViewProps> = ({
  onAddTicket,
  onShowToast,
  isUserVip,
  userId,
}) => {
  const [activeTab, setActiveTab] = useState<'card' | 'crypto'>('card');
  const [cryptoNetwork, setCryptoNetwork] = useState<'TRC-20' | 'BEP-20' | 'TON'>('TRC-20');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Ticket Form States
  const [userName, setUserName] = useState('');
  const [userContact, setUserContact] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'crypto'>('card');
  const [selectedAmount, setSelectedAmount] = useState('5,000,000 Toman');
  const [txHash, setTxHash] = useState('');
  const [notes, setNotes] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    onShowToast(`${label} کپی شد!`, 'success');
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        onShowToast('فقط تصویر JPG، PNG یا WEBP قابل قبول است.', 'error');
        e.target.value = '';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        onShowToast('حجم رسید نباید بیشتر از ۵ مگابایت باشد.', 'error');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
        onShowToast('تصویر رسید با موفقیت انتخاب شد', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      onShowToast('برای ثبت درخواست VIP ابتدا وارد حساب کاربری شوید.', 'error');
      return;
    }
    if (!userName.trim()) {
      onShowToast('لطفاً نام خود را وارد کنید', 'error');
      return;
    }
    if (!userContact.trim()) {
      onShowToast('لطفاً شماره تماس، آیدی یا ایمیل خود را وارد کنید', 'error');
      return;
    }
    if (!txHash.trim()) {
      onShowToast('لطفاً کد پیگیری یا شماره تراکنش را وارد کنید', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      let receiptPath: string | undefined;
      if (receiptImage) {
        const response = await fetch(receiptImage);
        const blob = await response.blob();
        const extension = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg';
        receiptPath = userId + '/' + crypto.randomUUID() + '.' + extension;
        const { error: uploadError } = await supabase.storage.from('receipts').upload(receiptPath, blob, { contentType: blob.type || 'image/jpeg', upsert: false });
        if (uploadError) throw new Error('آپلود رسید ناموفق بود: ' + uploadError.message);
      }
      const newTicket: VipTicket = { id: '', userId, userName: userName.trim(), userContact: userContact.trim(), method: selectedMethod, amount: selectedMethod === 'crypto' ? '10 USDT' : '3,000,000 Toman', cryptoNetwork: selectedMethod === 'crypto' ? cryptoNetwork : undefined, txHashOrReceiptNo: txHash.trim(), receiptPath, notes: notes.trim() || undefined, status: 'pending', createdAt: new Date().toISOString() };
      const created = await onAddTicket(newTicket);
      setSubmittedTicketId(created.id);
      try { confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } }); } catch { /* ignore */ }
      onShowToast('تیکت شما با شناسه ' + created.id + ' ثبت شد', 'success');
    } catch (error) {
      onShowToast(error instanceof Error ? error.message : 'ثبت تیکت ناموفق بود.', 'error');
    } finally { setIsSubmitting(false); }
  };

  const getCryptoAddress = () => {
    if (cryptoNetwork === 'TRC-20') return DJ_CASPIAN_INFO.payment.crypto.trc20Address;
    if (cryptoNetwork === 'BEP-20') return DJ_CASPIAN_INFO.payment.crypto.bep20Address;
    return DJ_CASPIAN_INFO.payment.crypto.tonAddress;
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300" dir="rtl">
      {/* Top Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#121212] via-[#1a2e20] to-[#0f1f14] border border-[#2a4533] p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="space-y-3 text-center md:text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d6b45c]/20 border border-[#d6b45c]/40 text-[#d6b45c] text-xs font-semibold">
              <Crown className="w-4 h-4 fill-[#d6b45c]" />
              <span>پشتیبانی مالی مستقیم و دریافت عضویت VIP</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              حمایت از <span className="text-[#d6b45c]">DJ Caspian</span> & اشتراک دانلود
            </h1>
            <p className="text-neutral-300 text-sm sm:text-base max-w-xl leading-relaxed">
              با حمایت مالی به ارزش <strong className="text-emerald-400 font-bold">۱۰ تتر (USDT)</strong> یا <strong className="text-amber-400 font-bold">{DJ_CASPIAN_INFO.payment.tomanDisplay}</strong>، اشتراک VIP دائمی شما فعال شده و تمامی ترک‌ها با کیفیت اورجینال ۳۲۰kbps و FLAC قابل دانلود خواهند شد.
            </p>
          </div>

          <div className="shrink-0 bg-[#141414]/90 p-5 rounded-2xl border border-neutral-700/60 shadow-xl text-center min-w-[220px]">
            <div className="text-xs text-neutral-400 mb-1">وضعیت اشتراک شما:</div>
            {isUserVip ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-sm">
                <Crown className="w-5 h-5 fill-amber-400" />
                <span>اشتراک VIP فعال است</span>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-neutral-300 font-semibold text-sm">کاربر عادی (استریم رایگان)</div>
                <div className="text-[11px] text-amber-400">دانلود قفل است 🔒</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* VIP Benefits Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#181818] border border-neutral-800 rounded-2xl p-5 hover:border-[#d6b45c]/40 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-[#d6b45c]/10 border border-[#d6b45c]/30 flex items-center justify-center text-[#d6b45c] mb-3">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-white font-bold text-base mb-1">دانلود ۳۲۰kbps و FLAC</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            دانلود فایل اصلی تمام آهنگ‌ها، ریمیکس‌ها و پادکست‌های دی‌جی کاسپین بدون هیچ واترمارک و محدودیت.
          </p>
        </div>

        <div className="bg-[#181818] border border-neutral-800 rounded-2xl p-5 hover:border-amber-500/40 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
            <Crown className="w-5 h-5" />
          </div>
          <h3 className="text-white font-bold text-base mb-1">اکستندد و سِت‌های اختصاصی</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            دسترسی به نسخه‌های Club Extended، سِت‌های طولانی فستیوال و پادکست‌های رادیویی با کیفیت مستر شده.
          </p>
        </div>

        <div className="bg-[#181818] border border-neutral-800 rounded-2xl p-5 hover:border-cyan-500/40 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-white font-bold text-base mb-1">تایید سریع و مادام‌العمر</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            تنها یک بار حمایت مالی انجام دهید و با ارسال تیکت فیش، اشتراک VIP شما توسط DJ Caspian فعال می‌شود.
          </p>
        </div>
      </div>

      {/* Donito support links and live overlay previews */}
      <section className="space-y-5" aria-labelledby="donito-support-title">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-2 text-[#d6b45c] text-xs font-bold tracking-wide">
              <Sparkles className="w-4 h-4" /> DONITO • COMMUNITY SUPPORT
            </div>
            <h2 id="donito-support-title" className="text-2xl font-black text-white mt-2">ابزارهای حمایت زنده</h2>
            <p className="text-sm text-neutral-400 mt-1">ابزارهای دونیتو و حمایت مستقیم از DJ CASPIAN، در یک بخش یکپارچه.</p>
          </div>
          <a href="https://donito.me/dj_caspian" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 bg-gradient-to-r from-[#d6b45c] to-[#f0d88a] text-[#111] font-black text-sm shadow-lg shadow-[#d6b45c]/10 hover:brightness-110">
            <Coins className="w-4 h-4" /> حمایت مالی / Donate <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[
            { title: 'بیشترین حمایت‌ها در ۲۴ ساعت گذشته', description: 'نمایش برچسب حامیان برتر در بازه ۲۴ ساعته؛ مناسب نمایش رویدادهای اخیر حمایت.', url: 'https://donito.me/overlays/6V8EJKK9XPGAPS6KAP655NZWG7SEWRVGEV6EW9E4YD9KYE5JABVE48NJBZP', tag: 'TOP SUPPORTERS' },
            { title: 'هدف حمایت مالی', description: 'نمایش میزان پیشرفت هدف مالی و حمایت‌های ثبت‌شده.', url: 'https://donito.me/overlays/R76X5BBJ9K6JEFPRBVPNN6Y76538P9WAKDWRK55HRP68BYZ7JY6EF6RKX9J', tag: 'DONATION GOAL' },
            { title: 'آخرین حمایت‌ها', description: 'فهرست عمودی آخرین حمایت‌های ثبت‌شده برای نمایش فعالیت‌های تازه.', url: 'https://donito.me/overlays/APYZKBBVAREW74RXYPRGGZ8WZ7FJZXR78BAJ5Z6CBGY55JKVG6BKFW5NJXX', tag: 'LATEST DONATIONS' },
          ].map((tool) => (
            <article key={tool.url} className="rounded-2xl border border-[#d6b45c]/20 bg-[#0b1421]/85 overflow-hidden">
              <div className="p-4 flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] tracking-widest text-[#d6b45c] font-black">{tool.tag}</span>
                  <h3 className="text-white font-bold mt-1">{tool.title}</h3>
                  <p className="text-xs text-neutral-400 mt-1 leading-6">{tool.description}</p>
                </div>
                <Sparkles className="w-5 h-5 text-[#d6b45c] shrink-0" />
              </div>
              <div className="mx-4 mb-3 rounded-xl overflow-hidden border border-white/10 bg-[#05080e]">
                <iframe title={tool.title} src={tool.url} loading="lazy" referrerPolicy="strict-origin-when-cross-origin"
                  className="w-full h-40 border-0" />
              </div>
              <div className="px-4 pb-4 flex flex-wrap gap-2">
                <a href={tool.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#173657] hover:bg-[#214b75] text-white text-xs font-bold px-3 py-2">
                  مشاهده ابزار <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button type="button" onClick={() => copyToClipboard(tool.url, tool.tag, 'لینک ابزار')}
                  className="inline-flex items-center gap-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-200 text-xs font-bold px-3 py-2">
                  {copiedKey === tool.tag ? <Check className="w-3.5 h-3.5 text-[#d6b45c]" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === tool.tag ? 'کپی شد' : 'کپی لینک ابزار'}
                </button>
              </div>
            </article>
          ))}
        </div>
        <p className="text-[11px] text-neutral-500 leading-6">
          پیش‌نمایش‌ها از صفحه‌های رسمی Donito بارگذاری می‌شوند. اگر سیاست امنیتی یا تنظیمات خود Donito نمایش داخل سایت را محدود کند، دکمه «مشاهده ابزار» همچنان لینک اصلی را باز می‌کند.
        </p>
      </section>

      {/* Single official donation method */}
      <section className="rounded-3xl border border-[#d6b45c]/30 bg-gradient-to-br from-[#101a29] to-[#080d15] p-6 sm:p-8 text-center space-y-4">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-[#d6b45c]/15 border border-[#d6b45c]/30 flex items-center justify-center">
          <Coins className="w-7 h-7 text-[#d6b45c]" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white">تنها روش حمایت مالی</h2>
        <p className="text-sm text-neutral-300 leading-7 max-w-2xl mx-auto">
          برای حمایت از DJ CASPIAN فقط از درگاه رسمی Donito استفاده کنید. پرداخت کارت‌به‌کارت، شماره کارت، شبا و واریز مستقیم رمزارزی از سایت حذف شده‌اند.
        </p>
        <a href="https://donito.me/dj_caspian" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 bg-gradient-to-r from-[#d6b45c] to-[#f0d88a] text-[#111] font-black text-sm shadow-lg shadow-[#d6b45c]/10 hover:brightness-110">
          <Coins className="w-4 h-4" /> ورود به صفحه رسمی حمایت در Donito <ExternalLink className="w-4 h-4" />
        </a>
        <p className="text-[11px] text-neutral-500">پس از پرداخت، اطلاعات حمایت از طریق Donito ثبت می‌شود.</p>
      </section>
    </div>
  );
};
