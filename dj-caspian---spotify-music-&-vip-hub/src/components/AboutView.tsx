import React, { useState } from 'react';
import { 
  Sparkles, CheckCircle2, Heart, Crown, Shield, 
  ExternalLink, Copy, Check, MessageSquare, Send, 
  Globe, Radio, Headphones, Disc3, Mic2, Music, 
  Sliders, Award, Users, ArrowLeft, ArrowUpRight
} from 'lucide-react';
import { DJ_CASPIAN_INFO } from '../data/initialData';

interface AboutViewProps {
  onNavigateToSupport: () => void;
  onShowToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  isUserVip: boolean;
}

export const AboutView: React.FC<AboutViewProps> = ({
  onNavigateToSupport,
  onShowToast,
  isUserVip,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    onShowToast(`${label} کپی شد!`, 'success');
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  return (
    <div className="p-4 sm:p-8 space-y-10 animate-in fade-in duration-300 max-w-6xl mx-auto" dir="rtl">
      
      {/* ============================================================== */}
      {/* 1. بخش اول: توضیحات کامل درباره دی‌جی کاسپین (ABOUT & BIO) */}
      {/* ============================================================== */}
      <section className="space-y-6">
        {/* Hero Card */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#183a27] via-[#122419] to-[#121212] border border-[#234b35]/50 shadow-2xl">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay filter blur-[1px]"
            style={{ backgroundImage: `url(${DJ_CASPIAN_INFO.bannerUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-black/40" />

          <div className="relative z-10 p-6 sm:p-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-right">
              <div className="relative group shrink-0">
                <img
                  src={DJ_CASPIAN_INFO.avatarUrl}
                  alt={DJ_CASPIAN_INFO.name}
                  className="w-36 h-36 sm:w-44 sm:h-44 rounded-full object-cover border-4 border-[#1db954] shadow-2xl"
                />
                <div className="absolute bottom-2 right-2 bg-[#1db954] text-black p-1.5 rounded-full shadow-lg">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-[#1db954]/40 text-[#1db954] text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>آرتیست و پرودیوسر موسیقی الکترونیک</span>
                </div>

                <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
                  {DJ_CASPIAN_INFO.name}
                </h1>
                <p className="text-sm font-medium text-emerald-400">
                  {DJ_CASPIAN_INFO.persianName} (محمدامین جدایی)
                </p>

                <p className="text-xs sm:text-sm text-neutral-300 max-w-xl leading-relaxed">
                  {DJ_CASPIAN_INFO.tagline}
                </p>

                <div className="flex items-center justify-center sm:justify-start gap-4 text-xs font-semibold text-neutral-300 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Headphones className="w-3.5 h-3.5 text-[#1db954]" />
                    {DJ_CASPIAN_INFO.monthlyListeners}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#1db954]" />
                    {DJ_CASPIAN_INFO.followers}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onNavigateToSupport}
              className="py-3 px-6 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold text-xs sm:text-sm flex items-center gap-2 transition-all hover:scale-105 shadow-xl shadow-amber-500/20 cursor-pointer shrink-0"
            >
              <Crown className="w-4 h-4 fill-black" />
              <span>حمایت مالی و عضویت VIP</span>
            </button>
          </div>
        </div>

        {/* Detailed Story & Vision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-[#181818] border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-lg border-b border-neutral-800 pb-3">
              <Disc3 className="w-5 h-5 text-[#1db954]" />
              <h2>داستان و بیوگرافی دی‌جی کاسپین</h2>
            </div>

            <p className="text-sm text-neutral-300 leading-relaxed text-justify">
              دی‌جی کاسپین (محمدامین جدایی)، آهنگساز، دی‌جی و پرودیوسر سبک‌های پیشرفته الکترونیک، کلاب و تکنو ملودیک است. فعالیت او با الهام از امواج خروشان دریای کاسپین و تلفیق ملودی‌های اصیل با بیس‌لاین‌های مدرن کلاب‌های بین‌المللی آغاز شد و توانست امضای صوتی منحصر‌به‌فردی در مارکت موسیقی الکترونیک ایجاد نماید.
            </p>

            <p className="text-sm text-neutral-300 leading-relaxed text-justify">
              تمامی ریمیکس‌ها، قطعات اورجینال، پادکست‌ها و سِت‌های رادیویی دی‌جی کاسپین با مسترینگ اختصاصی فستیوالی و در استاندارد استودیویی با بیت‌ریت ۳۲۰kbps تولید می‌شوند. این وب‌سایت به عنوان پلتفرم مرکزی و اختصاصی جهت برقراری ارتباط مستقیم با شنوندگان و ارائه نسخه‌های اصلی طراحی گردیده است.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
              <div className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-center">
                <Sliders className="w-5 h-5 text-[#1db954] mx-auto mb-1" />
                <div className="font-bold text-xs text-white">۳۲۰ kbps Lossless</div>
                <div className="text-[10px] text-neutral-500">کیفیت استودیویی</div>
              </div>
              <div className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-center">
                <Radio className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <div className="font-bold text-xs text-white">ریمیکس‌های کلوپ</div>
                <div className="text-[10px] text-neutral-500">سِت‌های اختصاصی</div>
              </div>
              <div className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-center">
                <Award className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
                <div className="font-bold text-xs text-white">تایید رسمی اسپاتیفای</div>
                <div className="text-[10px] text-neutral-500">Verified Artist</div>
              </div>
              <div className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-center">
                <Users className="w-5 h-5 text-rose-400 mx-auto mb-1" />
                <div className="font-bold text-xs text-white">کاسپین تیم</div>
                <div className="text-[10px] text-neutral-500">جامعه هواداران</div>
              </div>
            </div>
          </div>

          {/* Music Styles Card */}
          <div className="bg-[#181818] border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-white font-bold text-lg border-b border-neutral-800 pb-3">
                <Music className="w-5 h-5 text-[#1db954]" />
                <h3>سبک‌های موسیقی</h3>
              </div>

              <div className="space-y-3 mt-4">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
                  <span className="text-xs font-bold text-white">Persian Club Remixes</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#1db954]">۱۲۴ - ۱۲۸ BPM</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
                  <span className="text-xs font-bold text-white">Melodic Techno</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">۱۲۶ - ۱۳۰ BPM</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
                  <span className="text-xs font-bold text-white">Deep House & Vocal</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">۱۲۰ - ۱۲۴ BPM</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
                  <span className="text-xs font-bold text-white">Tech House & Bass</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">۱۲۸ - ۱۳۲ BPM</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 text-xs text-neutral-300 leading-relaxed text-center">
              تمامی قطعات بدون تگ تبلیغاتی و در دو نسخه رادیویی و Extended کلاب منتشر می‌شوند.
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. بخش دوم: حمایت مالی و VIP (SUPPORT & VIP CARD) */}
      {/* ============================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Crown className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">حمایت مالی از آرتیست و دریافت اشتراک VIP</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                با حمایت مالی، دسترسی مادام‌العمر یا دوره‌ای به دانلود تمام ترک‌ها با بالاترین کیفیت برایتان باز خواهد شد.
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToSupport}
            className="hidden sm:flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold transition-colors cursor-pointer"
          >
            <span>مشاهده صفحه کامل حمایت و ثبت فیش</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card to Card Box */}
          <div className="bg-gradient-to-br from-[#1c1810] via-[#161616] to-[#121212] border border-amber-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                  💳
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">روش اول: کارت به کارت</h3>
                  <span className="text-[11px] text-neutral-400">بانک ملی ایران</span>
                </div>
              </div>
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {DJ_CASPIAN_INFO.payment.tomanDisplay}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
                <span className="text-neutral-400">شماره کارت:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-white text-sm font-bold" dir="ltr">
                    {DJ_CASPIAN_INFO.payment.card.cardNumber}
                  </span>
                  <button
                    onClick={() => copyToClipboard(DJ_CASPIAN_INFO.payment.card.cardNumber, 'card', 'شماره کارت')}
                    className="p-1 text-neutral-400 hover:text-white cursor-pointer"
                    title="کپی شماره کارت"
                  >
                    {copiedKey === 'card' ? <Check className="w-4 h-4 text-[#1db954]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
                <span className="text-neutral-400">به نام:</span>
                <span className="font-bold text-white">{DJ_CASPIAN_INFO.payment.card.accountHolder}</span>
              </div>
            </div>

            <button
              onClick={onNavigateToSupport}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <span>ارسال عکس فیش و فعال‌سازی VIP</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Crypto USDT Box */}
          <div className="bg-gradient-to-br from-[#101c18] via-[#161616] to-[#121212] border border-emerald-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-[#1db954]">
                  ₮
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">روش دوم: ارز دیجیتال تتر (USDT)</h3>
                  <span className="text-[11px] text-neutral-400">شبکه‌های TRC20 و BEP20</span>
                </div>
              </div>
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-500/20 text-[#1db954] border border-emerald-500/40 font-mono">
                {DJ_CASPIAN_INFO.payment.tetherPriceUsdt} USDT
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between text-neutral-400 text-[11px]">
                  <span>آدرس تتر شبکه TRC-20 (ترون):</span>
                  <button
                    onClick={() => copyToClipboard(DJ_CASPIAN_INFO.payment.crypto.trc20Address, 'trc20', 'آدرس تتر TRC20')}
                    className="text-[#1db954] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'trc20' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>کپی آدرس</span>
                  </button>
                </div>
                <div className="font-mono text-white text-[11px] break-all" dir="ltr">
                  {DJ_CASPIAN_INFO.payment.crypto.trc20Address}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between text-neutral-400 text-[11px]">
                  <span>آدرس تتر شبکه BEP-20 (اسمارت چین):</span>
                  <button
                    onClick={() => copyToClipboard(DJ_CASPIAN_INFO.payment.crypto.bep20Address, 'bep20', 'آدرس تتر BEP20')}
                    className="text-[#1db954] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'bep20' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>کپی آدرس</span>
                  </button>
                </div>
                <div className="font-mono text-white text-[11px] break-all" dir="ltr">
                  {DJ_CASPIAN_INFO.payment.crypto.bep20Address}
                </div>
              </div>
            </div>

            <button
              onClick={onNavigateToSupport}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#1db954]/20"
            >
              <span>ثبت کد رهگیری تراکنش (TxID)</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. بخش سوم: شبکه‌های مجازی، دیسکورد، تیم‌اسپیک و سرور (CASPIAN COMMUNITY) */}
      {/* ============================================================== */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-3xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-[#181818] border border-blue-500/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 text-2xl shadow-inner">
              🌊
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">🌊 Caspian Community</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                  Official Community
                </span>
              </div>
              <p className="text-xs text-neutral-300 mt-1">
                پل‌های ارتباطی رسمی، سرور صوتی تیم‌اسپیک، دیسکورد و اطلاعات اتصال سرور کاسپین
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">سرور بازی:</span>
            <span className="px-3 py-1 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
              <span>💎 IP SV:</span>
              <span>{DJ_CASPIAN_INFO.socials.serverIp.address}</span>
            </span>
          </div>
        </div>

        {/* Server Connection Info: IP TS & IP SV */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 💎 IP TS */}
          <div className="bg-[#181818] border border-blue-500/30 rounded-2xl p-4 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white">💎 IP TS (تیم اسپیک)</span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-blue-500/20 text-blue-300 font-semibold">آنلاین</span>
                </div>
                <div className="font-mono text-xs text-blue-400 font-bold mt-0.5" dir="ltr">
                  {DJ_CASPIAN_INFO.socials.teamspeak.serverAddress}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => copyToClipboard(DJ_CASPIAN_INFO.socials.teamspeak.serverAddress, 'ts-top', 'آدرس تیم‌اسپیک')}
                className="py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedKey === 'ts-top' ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                <span>کپی IP</span>
              </button>
              <a
                href={DJ_CASPIAN_INFO.socials.teamspeak.link}
                className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                title="اتصال با TeamSpeak"
              >
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* 💎 IP SV */}
          <div className="bg-[#181818] border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                🎮
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white">💎 IP SV (سرور ام‌تی‌ای)</span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-semibold">
                    {DJ_CASPIAN_INFO.socials.serverIp.status}
                  </span>
                </div>
                <div className="font-mono text-xs text-amber-300 font-bold mt-0.5" dir="ltr">
                  IP SV: {DJ_CASPIAN_INFO.socials.serverIp.address}
                </div>
              </div>
            </div>

            <div className="text-xs text-neutral-400 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 font-mono">
              Soon ...
            </div>
          </div>
        </div>

        {/* 4 Community Channels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* 1. کانال تلگرام رسمی */}
          <div className="group bg-[#181818] hover:bg-[#202020] border border-sky-500/20 hover:border-sky-500/50 rounded-3xl p-6 transition-all space-y-4 flex flex-col justify-between shadow-xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30 group-hover:scale-110 transition-transform">
                  <Send className="w-6 h-6 rotate-45 mr-1" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/30">
                  🔹️ Telegram
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                  {DJ_CASPIAN_INFO.socials.telegram.title}
                </h3>
                <div className="font-mono text-xs text-sky-400 mt-0.5" dir="ltr">
                  {DJ_CASPIAN_INFO.socials.telegram.handle}
                </div>
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed">
                {DJ_CASPIAN_INFO.socials.telegram.description}
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <a
                href={DJ_CASPIAN_INFO.socials.telegram.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>ورود به تلگرام</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
              <button
                onClick={() => copyToClipboard(DJ_CASPIAN_INFO.socials.telegram.link, 'tg', 'لینک تلگرام')}
                className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                title="کپی لینک تلگرام"
              >
                {copiedKey === 'tg' ? <Check className="w-4 h-4 text-[#1db954]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 2. اینستاگرام رسمی */}
          <div className="group bg-[#181818] hover:bg-[#202020] border border-pink-500/20 hover:border-pink-500/50 rounded-3xl p-6 transition-all space-y-4 flex flex-col justify-between shadow-xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-pink-500/20 to-purple-500/20 text-pink-400 flex items-center justify-center border border-pink-500/30 group-hover:scale-110 transition-transform">
                  <div className="w-6 h-6 rounded-lg border-2 border-pink-400 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full border-2 border-pink-400" />
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/30">
                  🔹️ Instagram
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white group-hover:text-pink-300 transition-colors">
                  {DJ_CASPIAN_INFO.socials.instagram.title}
                </h3>
                <div className="font-mono text-xs text-pink-400 mt-0.5" dir="ltr">
                  {DJ_CASPIAN_INFO.socials.instagram.id}
                </div>
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed">
                {DJ_CASPIAN_INFO.socials.instagram.description}
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <a
                href={DJ_CASPIAN_INFO.socials.instagram.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>مشاهده اینستاگرام</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
              <button
                onClick={() => copyToClipboard(DJ_CASPIAN_INFO.socials.instagram.link, 'insta', 'لینک اینستاگرام')}
                className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                title="کپی لینک اینستاگرام"
              >
                {copiedKey === 'insta' ? <Check className="w-4 h-4 text-[#1db954]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 3. دیسکورد رسمی */}
          <div className="group bg-[#181818] hover:bg-[#202020] border border-indigo-500/20 hover:border-indigo-500/50 rounded-3xl p-6 transition-all space-y-4 flex flex-col justify-between shadow-xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                  🔹️ Discord
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {DJ_CASPIAN_INFO.socials.discord.title}
                </h3>
                <div className="font-mono text-xs text-indigo-400 mt-0.5" dir="ltr">
                  {DJ_CASPIAN_INFO.socials.discord.id}
                </div>
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed">
                {DJ_CASPIAN_INFO.socials.discord.description}
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <a
                href={DJ_CASPIAN_INFO.socials.discord.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>ورود به سرور دیسکورد</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
              <button
                onClick={() => copyToClipboard(DJ_CASPIAN_INFO.socials.discord.link, 'discord', 'لینک دیسکورد')}
                className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                title="کپی لینک دیسکورد"
              >
                {copiedKey === 'discord' ? <Check className="w-4 h-4 text-[#1db954]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 4. سرور تیم‌اسپیک */}
          <div className="group bg-[#181818] hover:bg-[#202020] border border-blue-500/20 hover:border-blue-500/50 rounded-3xl p-6 transition-all space-y-4 flex flex-col justify-between shadow-xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 group-hover:scale-110 transition-transform">
                  <Headphones className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30">
                  💎 IP TS
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                  {DJ_CASPIAN_INFO.socials.teamspeak.title}
                </h3>
                <div className="font-mono text-xs text-blue-400 mt-0.5 font-bold" dir="ltr">
                  IP TS: {DJ_CASPIAN_INFO.socials.teamspeak.serverAddress}
                </div>
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed">
                {DJ_CASPIAN_INFO.socials.teamspeak.description}
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(DJ_CASPIAN_INFO.socials.teamspeak.serverAddress, 'ts', 'آدرس سرور تیم‌اسپیک')}
                className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedKey === 'ts' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>کپی IP تیم‌اسپیک</span>
              </button>
              <a
                href={DJ_CASPIAN_INFO.socials.teamspeak.link}
                className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                title="اتصال مستقیم با نرم‌افزار تیم‌اسپیک"
              >
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* 5. وب‌سایت رسمی کاسپین */}
          <div className="group bg-[#181818] hover:bg-[#202020] border border-[#1db954]/20 hover:border-[#1db954]/50 rounded-3xl p-6 transition-all space-y-4 flex flex-col justify-between shadow-xl md:col-span-2 lg:col-span-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#1db954]/20 text-[#1db954] flex items-center justify-center border border-[#1db954]/30 group-hover:scale-110 transition-transform">
                  <Globe className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1db954]/10 text-[#1db954] border border-[#1db954]/30">
                  🔹️ Website
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white group-hover:text-[#1db954] transition-colors">
                  {DJ_CASPIAN_INFO.socials.website.title}
                </h3>
                <div className="font-mono text-xs text-[#1db954] mt-0.5" dir="ltr">
                  Website: {DJ_CASPIAN_INFO.socials.website.url}
                </div>
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed">
                {DJ_CASPIAN_INFO.socials.website.description}
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <div className="flex-1 py-2.5 px-4 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-400 text-xs text-center font-bold">
                وب‌سایت اختصاصی به زودی راه‌اندازی خواهد شد (Soon...)
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
