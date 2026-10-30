import { createClient } from '@supabase/supabase-js';

// These are public browser credentials. Never place a Supabase service-role key here.
const supabaseUrl = 'https://irkdzjizhwxbmnnfyqsx.supabase.co';
const supabasePublishableKey = 'sb_publishable_VoBs1G1u4_Rl8GxVc2HKfw_ADAyAxa3';

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
