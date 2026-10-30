import { supabase } from './supabase';
import type { UserAccount } from '../types';

type ProfileRow = {
  id: string;
  username: string;
  display_name: string;
  avatar_path: string | null;
};

type RoleRow = { role: 'admin' | 'user' };
type VipRow = { is_active: boolean };

function createDefaultAvatar(name: string): string {
  const initials = name
    .trim()
    .split(/[\\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => Array.from(part)[0]?.toUpperCase() || '')
    .join('') || 'DJ';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#123d31"/>
        <stop offset="100%" stop-color="#050807"/>
      </linearGradient>
    </defs>
    <rect width="160" height="160" rx="32" fill="url(#bg)"/>
    <circle cx="80" cy="80" r="57" fill="none" stroke="#1db954" stroke-opacity=".55" stroke-width="2"/>
    <circle cx="80" cy="80" r="48" fill="#1db954" fill-opacity=".10"/>
    <text x="80" y="94" text-anchor="middle" font-family="Arial,sans-serif" font-size="48" font-weight="800" fill="#eafff0">${initials}</text>
    <circle cx="125" cy="35" r="5" fill="#1db954"/>
  </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const toUserAccount = async (userId: string, email?: string): Promise<UserAccount> => {
  const [{ data: profile, error: profileError }, { data: role }, { data: vip }] =
    await Promise.all([
      supabase.from('profiles').select('id, username, display_name, avatar_path').eq('id', userId).single<ProfileRow>(),
      supabase.from('user_roles').select('role').eq('user_id', userId).maybeSingle<RoleRow>(),
      supabase.from('vip_entitlements').select('is_active').eq('user_id', userId).maybeSingle<VipRow>(),
    ]);

  if (profileError || !profile) {
    throw new Error(profileError?.message || 'پروفایل کاربر پیدا نشد.');
  }

  const avatarUrl = profile.avatar_path
    ? supabase.storage.from('avatars').getPublicUrl(profile.avatar_path).data.publicUrl
    : createDefaultAvatar(profile.display_name || profile.username);

  return {
    id: profile.id,
    username: profile.username,
    displayName: profile.display_name,
    email,
    role: role?.role === 'admin' ? 'admin' : 'user',
    isVip: vip?.is_active === true,
    likedTrackIds: [],
    customPlaylists: [],
    avatarUrl,
    createdAt: new Date().toISOString(),
  };
};

export async function signInWithEmail(email: string, password: string): Promise<UserAccount> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) throw new Error(error?.message || 'ورود انجام نشد.');
  return toUserAccount(data.user.id, data.user.email);
}

export async function signUpWithEmail(input: {
  email: string;
  password: string;
  username: string;
  displayName: string;
}): Promise<{ user: UserAccount | null; emailConfirmationRequired: boolean }> {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        username: input.username.trim(),
        display_name: input.displayName.trim(),
      },
    },
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('ساخت حساب کاربری ناموفق بود.');

  if (!data.session) {
    return { user: null, emailConfirmationRequired: true };
  }

  return {
    user: await toUserAccount(data.user.id, data.user.email),
    emailConfirmationRequired: false,
  };
}

export async function getCurrentSupabaseUser(): Promise<UserAccount | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return toUserAccount(data.user.id, data.user.email);
}

export async function signOutSupabaseUser(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}
