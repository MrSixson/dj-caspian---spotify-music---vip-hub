import React from 'react';
import { Crown, Sparkles, Download, ArrowLeft, ShieldCheck, X } from 'lucide-react';
import { DJ_CASPIAN_INFO } from '../data/initialData';

interface VipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToSupport: () => void;
  trackTitle?: string;
}

export const VipModal: React.FC<VipModalProps> = ({ isOpen, onClose, onGoToSupport, trackTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-gradient-to-b from-[#1e1e1e] to-[#121212] border border-[#2a2a2a] rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden"
        dir="rtl"
      >
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#d6b45c]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-neutral-400 hover:text-white bg-neutral-800/60 hover:bg-neutral-800 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/20 mb-4 animate-bounce duration-1000">
            <Crown className="w-9 h-9 text-black fill-black" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>اشتراک ویژه VIP دی‌جی کاسپین</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            دانلود فقط مخصوص اعضای VIP است!
          </h2>

          {trackTitle && (
            <p className="text-xs text-neutral-400 mb-4 bg-neutral-900/80 px-3 py-1.5 rounded-lg border border-neutral-800 flex items-center gap-2">
              <Download className="w-3.5 h-3.5 text-[#d6b45c]" />
              <span>قطعه انتخابی: <strong className="text-white">{trackTitle}</strong></span>
            </p>
          )}

          <p className="text-neutral-300 text-sm leading-relaxed mb-6">
            گوش دادن آنلاین به تمام قطعات و ریمیکس‌های دی‌جی کاسپین کاملاً رایگان است. اما برای <span className="text-[#d6b45c] font-bold">دانلود فایل‌های اصلی و باکیفیت استودیویی (۳۲۰kbps و FLAC)</span> نیاز به فعال‌سازی اشتراک VIP دارید.
          </p>
        </div>

        {/* Official support route */}
        <div className="bg-[#181818] border border-[#d6b45c]/25 rounded-xl p-4 mb-6 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-bold text-white">روش رسمی حمایت مالی</span>
            <span className="rounded-full bg-[#d6b45c]/10 px-3 py-1 text-xs font-bold text-[#e6c978]">DONITO</span>
          </div>
          <p className="text-sm leading-6 text-neutral-300">
            تمام حمایت‌های مالی فقط از طریق درگاه رسمی Donito انجام می‌شوند. هیچ شماره کارت، شبا یا آدرس کیف پولی در این سایت ارائه نمی‌شود.
          </p>
          <div className="flex items-start gap-2 border-t border-neutral-800 pt-3 text-xs leading-6 text-neutral-400">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#d6b45c]" />
            <span>پرداخت Donito به‌تنهایی به معنی فعال‌شدن خودکار VIP نیست؛ فعال‌سازی خودکار تا زمان اتصال و تأیید رویداد پرداخت تضمین نمی‌شود.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => {
              onClose();
              onGoToSupport();
            }}
            className="w-full sm:flex-1 py-3 px-5 rounded-full bg-[#d6b45c] hover:bg-[#f0d88a] text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#d6b45c]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>ورود به صفحه پرداخت و ارسال تیکت</span>
            <ArrowLeft className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto py-3 px-5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white font-medium text-sm transition-colors cursor-pointer"
          >
            فعلاً فقط گوش می‌دهم
          </button>
        </div>
      </div>
    </div>
  );
};
