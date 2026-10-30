import { Track, VipTicket, Playlist, UserAccount } from '../types';

export const DJ_CASPIAN_INFO = {
  name: 'DJ Caspian',
  persianName: 'دی‌جی کاسپین',
  tagline: 'آهنگساز، دی‌جی و پرودیوسر موسیقی الکترونیک، کلوپ و ریمیکس‌های اختصاصی',
  bio: 'دی‌جی کاسپین، پیشگام سبک تلفیقی پرشین کلاب، تکنو ملودیک و دیپ هاوس مدرن در خاورمیانه و فستیوال‌های بین‌المللی. تمامی ریمیکس‌ها و سِت‌های رادیویی به صورت انحصاری در این پلتفرم استریم می‌شوند.',
  monthlyListeners: '۱۸۴,۳۵۰ شنونده ماهانه',
  followers: '۸۹,۲۰۰ دنبال‌کننده',
  avatarUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
  bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1600&auto=format&fit=crop&q=80',
  
  // Payment Details for Support & VIP
  payment: {
    tetherPriceUsdt: 10,
    tomanPrice: 3000000,
    tomanDisplay: '3,۰۰۰,۰۰۰ تومان',
    card: {
      bankName: 'بانک ملی ایران',
      cardNumber: '6037-9973-4794-5942',
      accountHolder: 'محمدامین جدایی (DJ Caspian)',
      shabaNumber: '***************',
    },
    crypto: {
      trc20Address: 'TXosfmykDjy7p4CqHXqnWvi37P3Y1RMYvg',
      bep20Address: '0xe31d786cfEb6d3649Fedfc160d523D387E129639',
      tonAddress: 'Soon',
    }
  },

  // Social Channels & Communities (🌊 Caspian Community)
  socials: {
    communityName: '🌊 Caspian Community',
    serverIp: {
      title: '💎 IP SV (MTA Server)',
      address: 'Soon ...',
      status: 'به زودی...'
    },
    teamspeak: {
      title: '💎 IP TS (تیم اسپیک رسمی)',
      serverAddress: 'Caspianrp.ts77.ir',
      link: 'ts3server://Caspianrp.ts77.ir',
      description: 'ارتباط صوتی با کیفیت بالا و پینگ پایین کاسپین کامیونیتی: Caspianrp.ts77.ir'
    },
    discord: {
      title: '🔹️ دیسکورد رسمی Caspian',
      id: 'discord.gg/Yv7yqcbyfF',
      link: 'https://discord.gg/Yv7yqcbyfF',
      description: 'سرور رسمی دیسکورد کاسپین برای چت، ایونت‌ها و ارتباط با اعضای کامیونیتی'
    },
    instagram: {
      title: '🔹️ اینستاگرام رسمی Caspian RP',
      id: '@caspianrp_mta',
      link: 'https://instagram.com/caspianrp_mta',
      description: 'اخبار، تیزرها، کلیپ‌های جذاب و هایلایت‌های سرور رول‌پلی کاسپین'
    },
    telegram: {
      title: '🔹️ کانال تلگرام رسمی Caspian RolePlay',
      id: '@CaspianRolePlayMTA',
      handle: 't.me/CaspianRolePlayMTA',
      link: 'https://t.me/CaspianRolePlayMTA',
      description: 'کانال رسمی تلگرام جهت اخبار فوری، پچ‌نوت‌ها، چالش‌ها و دانلودها'
    },
    website: {
      title: '🔹️ وب‌سایت رسمی Caspian',
      url: 'Soon...',
      link: '#',
      description: 'پرتال رسمی و جامع کاسپین کامیونیتی (در حال آماده‌سازی و راه‌اندازی)'
    }
  }
};

export const INITIAL_TRACKS: Track[] = [];

export const INITIAL_PLAYLISTS: Playlist[] = [];


export const INITIAL_TICKETS: VipTicket[] = [
];

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'user-admin-caspian',
    username: 'AminJodaie',
    password: 'Amin12120000',
    displayName: 'DJ Caspian (امین جدایی)',
    email: 'aminjodaie314@gmail.com',
    role: 'admin',
    isVip: true,
    vipSince: '2025-01-01',
    likedTrackIds: ['caspian-01', 'caspian-03', 'caspian-04', 'caspian-02'],
    customPlaylists: [],
    avatarUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
    createdAt: '2025-01-01 00:00',
    downloadCount: 48,
  },
];
