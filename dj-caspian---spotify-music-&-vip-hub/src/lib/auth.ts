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
    : '';

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
