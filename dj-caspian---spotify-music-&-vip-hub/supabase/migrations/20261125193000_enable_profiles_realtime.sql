-- Stream public profile changes so the community directory refreshes automatically.
alter publication supabase_realtime add table public.profiles;
