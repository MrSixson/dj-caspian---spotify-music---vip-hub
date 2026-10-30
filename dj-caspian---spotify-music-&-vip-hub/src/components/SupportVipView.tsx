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
      if (file.size > 8 * 1024 * 1024) {
        onShowToast('حجم فایل نباید بیشتر از ۸ مگابایت باشد', 'error');
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
        const extension = blob.type.includes('png') ? 'png' : 'jpg';
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1db954]/20 border border-[#1db954]/40 text-[#1db954] text-xs font-semibold">
              <Crown className="w-4 h-4 fill-[#1db954]" />
              <span>پشتیبانی مالی مستقیم و دریافت عضویت VIP</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              حمایت از <span className="text-[#1db954]">DJ Caspian</span> & اشتراک دانلود
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
        <div className="bg-[#181818] border border-neutral-800 rounded-2xl p-5 hover:border-[#1db954]/40 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-[#1db954]/10 border border-[#1db954]/30 flex items-center justify-center text-[#1db954] mb-3">
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

      {/* Step 1: Payment Methods Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#1db954] text-black font-black flex items-center justify-center text-sm">
              ۱
            </div>
            <h2 className="text-xl font-bold text-white">انتخاب روش پرداخت و واریز حمایت مالی</h2>
          </div>
          <span className="text-xs text-neutral-400">کارت به کارت یا تتر (USDT)</span>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 p-1.5 bg-[#181818] rounded-2xl border border-neutral-800 max-w-md">
          <button
            type="button"
            onClick={() => {
              setActiveTab('card');
              setSelectedMethod('card');
            }}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'card'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>کارت به کارت (3 میلیون تومان)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('crypto');
              setSelectedMethod('crypto');
            }}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'crypto'
                ? 'bg-gradient-to-r from-[#1db954] to-emerald-500 text-black shadow-lg shadow-[#1db954]/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>ارز دیجیتال تتر (10 USDT)</span>
          </button>
        </div>

        {/* TAB 1: CARD TO CARD DETAILS */}
        {activeTab === 'card' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-[#161616] border border-neutral-800 rounded-3xl p-6 sm:p-8 animate-in fade-in duration-200">
            {/* Visual Bank Card */}
            <div className="relative aspect-[1.58/1] rounded-2xl p-6 bg-gradient-to-tr from-[#1a1c24] via-[#2a2f40] to-[#14151b] border border-neutral-600/50 shadow-2xl overflow-hidden flex flex-col justify-between text-white group">
              <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between z-10">
                <span className="text-xs font-bold tracking-widest text-amber-300 uppercase">
                  {DJ_CASPIAN_INFO.payment.card.bankName}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/10 text-neutral-300">
                  شبکه شتاب
                </span>
              </div>

              {/* Chip Visual */}
              <div className="w-11 h-8 rounded-md bg-gradient-to-r from-amber-200 to-yellow-400 border border-yellow-500/50 flex items-center justify-center my-auto">
                <div className="w-7 h-5 border border-yellow-700/40 rounded-[2px]" />
              </div>

              <div className="space-y-3 z-10">
                <div className="text-center font-mono text-xl sm:text-2xl font-bold tracking-[0.18em] text-amber-200 drop-shadow">
                  {DJ_CASPIAN_INFO.payment.card.cardNumber}
                </div>

                <div className="flex items-center justify-between text-xs text-neutral-300">
                  <div>
                    <div className="text-[10px] text-neutral-400">صاحب کارت:</div>
                    <div className="font-bold text-white">{DJ_CASPIAN_INFO.payment.card.accountHolder}</div>
                  </div>
                  <div className="text-left font-mono">
                    <div className="text-[10px] text-neutral-400">مبلغ واریزی:</div>
                    <div className="font-bold text-amber-300">{DJ_CASPIAN_INFO.payment.tomanDisplay}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Copy Inputs */}
            <div className="space-y-4">
              <div>
                <label className="text-xs text-neutral-400 block mb-1.5 font-medium">شماره کارت بانکی (۱۶ رقمی):</label>
                <div className="flex items-center gap-2 bg-[#202020] border border-neutral-700 rounded-xl p-2.5">
                  <span className="font-mono text-base font-bold text-amber-300 tracking-wider flex-1 text-center" dir="ltr">
                    {DJ_CASPIAN_INFO.payment.card.cardNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(DJ_CASPIAN_INFO.payment.card.cardNumber.replace(/-/g, ''), 'card-num', 'شماره کارت')}
                    className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 text-xs font-semibold"
                  >
                    {copiedKey === 'card-num' ? <Check className="w-4 h-4 text-[#1db954]" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedKey === 'card-num' ? 'کپی شد' : 'کپی کارت'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-neutral-400 block mb-1.5 font-medium">شماره شبا (IBAN):</label>
                <div className="flex items-center gap-2 bg-[#202020] border border-neutral-700 rounded-xl p-2.5">
                  <span className="font-mono text-xs sm:text-sm text-neutral-300 flex-1 truncate" dir="ltr">
                    {DJ_CASPIAN_INFO.payment.card.shabaNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(DJ_CASPIAN_INFO.payment.card.shabaNumber, 'shaba-num', 'شماره شبا')}
                    className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 text-xs font-semibold"
                  >
                    {copiedKey === 'shaba-num' ? <Check className="w-4 h-4 text-[#1db954]" /> : <Copy className="w-4 h-4" />}
                    <span>کپی شبا</span>
                  </button>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 text-xs text-amber-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <span>💡 نکته مهم:</span>
                </div>
                <p className="leading-relaxed text-neutral-300">
                  پس از انجام واریز 3 میلیون تومان از طریق همراه بانک یا خودپرداز، رسید پرداختی را ذخیره کرده و در فرم مرحله ۲ (پایین صفحه) ارسال نمایید.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CRYPTO TETHER USDT DETAILS */}
        {activeTab === 'crypto' && (
          <div className="bg-[#161616] border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
            {/* Network Selector */}
            <div className="space-y-2">
              <label className="text-xs text-neutral-400 font-medium">شبکه انتقال تتر (Network) را انتخاب کنید:</label>
              <div className="flex flex-wrap gap-2.5">
                {(['TRC-20', 'BEP-20', 'TON'] as const).map((net) => (
                  <button
                    key={net}
                    type="button"
                    onClick={() => setCryptoNetwork(net)}
                    className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                      cryptoNetwork === net
                        ? 'bg-[#1db954]/20 border-[#1db954] text-[#1db954] shadow-md'
                        : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {net} {net === 'TRC-20' ? '(پیشنهادی با کارمزد پایین TRON)' : net === 'BEP-20' ? '(BNB Chain)' : '(Telegram TON)'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* QR Code Preview */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white text-black shadow-xl">
                <div className="w-44 h-44 relative flex items-center justify-center p-2 border-2 border-black/10 rounded-xl bg-white">
                  {/* Stylized QR Code Visual */}
                  <svg className="w-full h-full text-black" viewBox="0 0 100 100" fill="currentColor">
                    <rect x="5" y="5" width="25" height="25" rx="3" />
                    <rect x="9" y="9" width="17" height="17" fill="white" />
                    <rect x="13" y="13" width="9" height="9" />
                    
                    <rect x="70" y="5" width="25" height="25" rx="3" />
                    <rect x="74" y="9" width="17" height="17" fill="white" />
                    <rect x="78" y="13" width="9" height="9" />

                    <rect x="5" y="70" width="25" height="25" rx="3" />
                    <rect x="9" y="74" width="17" height="17" fill="white" />
                    <rect x="13" y="78" width="9" height="9" />

                    {/* QR Matrix Points */}
                    <rect x="35" y="10" width="8" height="8" />
                    <rect x="50" y="15" width="12" height="6" />
                    <rect x="38" y="25" width="6" height="12" />
                    <rect x="10" y="38" width="15" height="6" />
                    <rect x="30" y="40" width="10" height="10" />
                    <rect x="45" y="35" width="10" height="10" />
                    <rect x="60" y="40" width="8" height="8" />
                    <rect x="75" y="38" width="16" height="6" />
                    <rect x="40" y="55" width="20" height="6" />
                    <rect x="65" y="55" width="8" height="15" />
                    <rect x="40" y="68" width="12" height="12" />
                    <rect x="80" y="65" width="12" height="10" />
                    <rect x="60" y="80" width="15" height="12" />
                    <rect x="35" y="85" width="15" height="8" />
                  </svg>
                </div>
                <span className="text-[11px] font-bold mt-2 text-neutral-800">اسکن آدرس در کیف پول (Tether USDT)</span>
              </div>

              {/* Wallet Info */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-neutral-400 mb-1.5 font-medium">
                    <span>آدرس کیف پول تتر ({cryptoNetwork}):</span>
                    <span className="text-emerald-400 font-bold">مبلغ: ۱۰ USDT</span>
                  </div>
                  <div className="bg-[#202020] border border-neutral-700 rounded-xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <span className="font-mono text-xs sm:text-sm text-emerald-400 break-all select-all flex-1" dir="ltr">
                      {getCryptoAddress()}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(getCryptoAddress(), 'crypto-addr', `آدرس ${cryptoNetwork}`)}
                      className="py-2 px-3 rounded-lg bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-xs transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {copiedKey === 'crypto-addr' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedKey === 'crypto-addr' ? 'کپی شد' : 'کپی آدرس'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-neutral-300 space-y-1.5">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>راهنمای انتقال تتر:</span>
                  </div>
                  <p className="leading-relaxed">
                    دقیقاً <strong className="text-white">۱۰ واحد USDT</strong> به آدرس بالا انتقال دهید و سپس هش تراکنش (TxID یا Hash) را در فرم مرحله ۲ ثبت نمایید.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Ticket Submission Form */}
      <div className="space-y-4 pt-4 border-t border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-amber-500 text-black font-black flex items-center justify-center text-sm">
            ۲
          </div>
          <h2 className="text-xl font-bold text-white">فرم ارسال فیش و ثبت مدرک پرداخت</h2>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed">
          پس از انجام واریز، فرم زیر را پر کرده و عکس فیش یا کد پیگیری را ارسال کنید. دی‌جی کاسپین فیش شما را در پنل مدیریت بررسی کرده و اشتراک VIP را برایتان فعال می‌کند.
        </p>

        {submittedTicketId ? (
          <div className="bg-gradient-to-b from-[#183424] to-[#122419] border border-[#1db954]/50 rounded-3xl p-6 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#1db954]/20 border border-[#1db954] flex items-center justify-center mx-auto text-[#1db954]">
              <Check className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-white">فیش شما با موفقیت به مدیریت ارسال شد!</h3>
              <p className="text-neutral-300 text-sm">
                کد پیگیری ثبت شده: <strong className="font-mono text-[#1db954] text-lg">{submittedTicketId}</strong>
              </p>
            </div>

            <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
              رسید پرداختی شما مستقیماً در پنل مدیریت اختصاصی DJ Caspian قرار گرفت. پس از بررسی و تایید، دسترسی دانلود VIP شما به‌صورت خودکار فعال خواهد شد.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSubmittedTicketId(null);
                  setTxHash('');
                  setReceiptImage(null);
                  setNotes('');
                }}
                className="py-2.5 px-6 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-sm transition-all cursor-pointer shadow-lg shadow-[#1db954]/20"
              >
                ثبت فیش دیگر
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitTicket} className="bg-[#181818] border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-neutral-300 block mb-1.5 font-medium">نام و نام خانوادگی:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: کامران سهرابی"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-[#242424] border border-neutral-700 focus:border-[#1db954] focus:outline-none rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-500"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-300 block mb-1.5 font-medium">شماره تماس یا آیدی تلگرام / ایمیل:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: 09121234567 یا @djfan"
                  value={userContact}
                  onChange={(e) => setUserContact(e.target.value)}
                  className="w-full bg-[#242424] border border-neutral-700 focus:border-[#1db954] focus:outline-none rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-neutral-300 block mb-1.5 font-medium">روش حمایتی که پرداخت کردید:</label>
                <select
                  value={selectedMethod}
                  onChange={(e) => {
                    const m = e.target.value as 'card' | 'crypto';
                    setSelectedMethod(m);
                    setSelectedAmount(m === 'card' ? '3,۰۰۰,۰۰۰ تومان' : '10 USDT');
                  }}
                  className="w-full bg-[#242424] border border-neutral-700 focus:border-[#1db954] focus:outline-none rounded-xl px-4 py-2.5 text-sm text-white"
                >
                  <option value="card">کارت به کارت ({DJ_CASPIAN_INFO.payment.tomanDisplay})</option>
                  <option value="crypto">ارز دیجیتال تتر (10 USDT)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-neutral-300 block mb-1.5 font-medium">
                  {selectedMethod === 'card' ? 'کد پیگیری یا شماره ارجاع تراکنش:' : 'هش تراکنش (TxID / Hash):'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={selectedMethod === 'card' ? 'مثال: ۹۸۴۵۲۱۰۳۷۸۴۹' : 'مثال: 0x8f72c918a90218...'}
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  className="w-full bg-[#242424] border border-neutral-700 focus:border-[#1db954] focus:outline-none rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-500 font-mono text-left"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Receipt Image Upload */}
            <div>
              <label className="text-xs text-neutral-300 block mb-1.5 font-medium">
                تصویر فیش یا اسکرین‌شات واریزی (اختیاری ولی تایید را بسیار سریع‌تر می‌کند):
              </label>
              
              <div className="border-2 border-dashed border-neutral-700 hover:border-[#1db954] rounded-2xl p-4 text-center bg-[#202020] transition-colors">
                {receiptImage ? (
                  <div className="flex flex-col items-center gap-3">
                    <img 
                      src={receiptImage} 
                      alt="فیش واریزی" 
                      className="max-h-48 rounded-lg border border-neutral-700 object-contain shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => setReceiptImage(null)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      حذف و انتخاب عکس دیگر
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 cursor-pointer py-4">
                    <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-neutral-300">
                      برای بارگذاری عکس فیش اینجا کلیک کنید یا عکس را بکشید
                    </span>
                    <span className="text-[10px] text-neutral-500">پشتیبانی از JPG, PNG تا حداکثر ۸ مگابایت</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs text-neutral-300 block mb-1.5 font-medium">پیام یا یادداشت شما برای دی‌جی کاسپین (اختیاری):</label>
              <textarea
                rows={2}
                placeholder="مثلاً: واریز از بانک سامان به نام کامران انجام شد، سپاس از موزیک‌های قوی‌تون..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#242424] border border-neutral-700 focus:border-[#1db954] focus:outline-none rounded-xl px-4 py-2 text-sm text-white placeholder-neutral-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-full bg-[#1db954] hover:bg-[#1ed760] disabled:bg-neutral-700 text-black font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#1db954]/20 hover:scale-[1.01]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>در حال ثبت تیکت...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>ارسال تیکت مدرک پرداخت به DJ Caspian</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
