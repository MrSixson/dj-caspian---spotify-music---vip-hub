import { Track, VipTicket, Playlist, UserAccount } from '../types';

export const DJ_CASPIAN_INFO = {
  name: 'DJ Caspian',
  persianName: 'دی‌جی کاسپین',
  tagline: 'پلتفرم رسمی موسیقی، ریمیکس‌ها و ارتباط با جامعه شنوندگان DJ CASPIAN',
  bio: 'DJ CASPIAN فضایی برای شنیدن و دنبال‌کردن موسیقی‌ها، ریمیکس‌ها و مجموعه‌های منتشرشده است. این صفحه مسیرهای رسمی ارتباطی و اطلاعات پروژه را یک‌جا در اختیار مخاطبان قرار می‌دهد.',
  avatarUrl: `${import.meta.env.BASE_URL}dj-caspian-profile.jpg`,
  bannerUrl: `${import.meta.env.BASE_URL}dj-caspian-profile.jpg`,
  socials: {
    communityName: 'Caspian Community',
    serverIp: {
      title: 'سرور بازی Caspian MTA',
      address: '',
      status: 'آدرس در انتظار اعلام رسمی',
    },
    teamspeak: {
      title: 'TeamSpeak رسمی Caspian',
      serverAddress: 'Caspian.mta.ir',
      link: 'ts3server://Caspian.mta.ir',
      description: 'اتاق‌های گفت‌وگو و ارتباط صوتی اعضای کامیونیتی کاسپین.',
    },
    discord: {
      title: 'Discord رسمی Caspian',
      id: 'discord.gg/nevmNy93pN',
      link: 'https://discord.gg/nevmNy93pN',
      description: 'محل ارتباط اعضا، اطلاع‌رسانی و هماهنگی‌های کامیونیتی.',
    },
    instagram: {
      title: 'Instagram رسمی Caspian RP',
      id: '@caspinrp_mta',
      link: 'https://instagram.com/caspinrp_mta',
      description: 'اخبار، اطلاعیه‌ها و محتوای تصویری مربوط به Caspian RolePlay.',
    },
    telegram: {
      title: 'Telegram رسمی Caspian RolePlay',
      id: '@CaspianRolePlayMTA',
      handle: 't.me/CaspianRolePlayMTA',
      link: 'https://t.me/CaspianRolePlayMTA',
      description: 'کانال اطلاع‌رسانی و انتشار خبرها و به‌روزرسانی‌های کاسپین.',
    },
    website: {
      title: 'وب‌سایت رسمی DJ CASPIAN',
      url: 'mrsixson.github.io/dj-caspian---spotify-music---vip-hub/',
      link: 'https://mrsixson.github.io/dj-caspian---spotify-music---vip-hub/',
      description: 'مرکز رسمی پخش موسیقی، کتابخانه، پلی‌لیست‌ها و حساب کاربری DJ CASPIAN.',
    },
  },
};

export const INITIAL_TRACKS: Track[] = [];
export const INITIAL_PLAYLISTS: Playlist[] = [];
export const INITIAL_TICKETS: VipTicket[] = [];
export const INITIAL_USERS: UserAccount[] = [];
