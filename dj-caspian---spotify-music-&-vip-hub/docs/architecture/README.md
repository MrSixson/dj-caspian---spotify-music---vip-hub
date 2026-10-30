# نقشه معماری DJ Caspian

## وضعیت فعلی

پروژه یک SPA استاتیک با React، TypeScript و Vite است؛ Next.js یا بک‌اند Express فعال در مسیر اجرای فعلی تأیید نشده است. GitHub Actions از پوشه پروژه build می‌گیرد و خروجی Vite را در GitHub Pages منتشر می‌کند.

### چیدمان فعلی کد

- `src/App.tsx`: هماهنگ‌کننده اصلی UI و state؛ در حال حاضر مسئولیت‌های زیادی دارد.
- `src/components/`: اجزای صفحه و پنل‌ها.
- `src/lib/auth.ts`: منطق احراز هویت فعلی.
- `src/lib/catalog.ts`: دریافت کاتالوگ، ساخت URL فایل‌ها و آپلود آهنگ.
- `src/lib/supabase.ts`: ساخت Supabase client.
- `src/utils/audioEngine.ts`: موتور پخش.
- `src/data/initialData.ts`: داده‌های اولیه/نمونه.
- `src/types/index.ts`: مدل‌های TypeScript.
- `src/index.css`: استایل سراسری.

## ساختار مقصد

ساختار زیر مقصد تدریجی است؛ پوشه‌های تازه ایجادشده فعلاً فقط محل‌های رزروشده‌اند و هیچ کد اجرایی به آن‌ها منتقل نشده است.

```text
src/
├── app/                 # راه‌اندازی برنامه، providers و routing
├── components/
│   ├── layout/          # اجزای پوسته و چیدمان
│   ├── shared/          # اجزای مشترک
│   └── ui/              # اجزای پایه رابط کاربری
├── features/
│   ├── auth/            # ورود، ثبت‌نام و نشست
│   ├── music/           # کاتالوگ و عملیات آهنگ
│   ├── player/          # پخش و کنترل صدا
│   ├── playlists/       # پلی‌لیست‌ها
│   ├── admin/            # مدیریت و مجوزهای مدیر
│   ├── vip/              # اشتراک و درخواست VIP
│   └── profile/          # پروفایل و تنظیمات کاربر
├── services/
│   └── supabase/         # client و adapterهای زیرساخت
├── hooks/               # هوک‌های مشترک
├── config/              # پیکربندی قابل اشتراک
├── data/                # داده‌های نمونه و seed
├── lib/                 # سازگاری موقت تا پایان مهاجرت
├── types/               # مدل‌های دامنه
├── utils/               # توابع خالص و ابزارها
└── styles/              # استایل‌های سازمان‌دهی‌شده
```

## ترتیب مهاجرت

1. تثبیت تنظیمات ریشه، مستندات و ignore rules.
2. انتقال تدریجی منطق Supabase به services و افزودن typeهای دقیق.
3. انتقال قابلیت‌ها به featureهای مستقل، با حفظ API و ظاهر موجود.
4. جدا کردن state و orchestration از App.tsx.
5. تست build و lint پس از هر مرحله.
6. اصلاح workflow و انتشار فقط پس از تأیید build.

## محدودیت‌های مهم

- مسیر فعلی پوشه پروژه و مقدار `base` در Vite با GitHub Pages هماهنگ هستند؛ تغییرشان نیازمند اصلاح هم‌زمان workflow و تست URL assetها است.
- `index.html.before-maintenance.bak.txt` نسخه پشتیبان است و نباید حذف یا به‌صورت خودکار جایگزین صفحه تعمیرات شود.
- پاک‌سازی وابستگی‌ها تا زمان بررسی تمام importها و lockfile انجام نمی‌شود.
- هیچ داده‌ای در Supabase در این مرحله تغییر نمی‌کند.
