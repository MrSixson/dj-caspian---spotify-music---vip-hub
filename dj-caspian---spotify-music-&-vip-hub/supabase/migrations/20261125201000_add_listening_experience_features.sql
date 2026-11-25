create table if not exists public.listening_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  track_id uuid not null references public.tracks(id) on delete cascade,
  listened_seconds integer not null default 0 check (listened_seconds >= 0),
  completed boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists listening_history_user_created_idx on public.listening_history(user_id, created_at desc);
alter table public.listening_history enable row level security;
drop policy if exists "Users read own listening history" on public.listening_history;
create policy "Users read own listening history" on public.listening_history for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "Users add own listening history" on public.listening_history;
create policy "Users add own listening history" on public.listening_history for insert to authenticated with check (user_id = (select auth.uid()));

create table if not exists public.listening_rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 60),
  host_user_id uuid not null references auth.users(id) on delete cascade,
  track_id uuid references public.tracks(id) on delete set null,
  position_seconds numeric not null default 0,
  is_playing boolean not null default false,
  is_public boolean not null default true,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists listening_rooms_created_idx on public.listening_rooms(created_at desc);
alter table public.listening_rooms enable row level security;
drop policy if exists "Authenticated users view public listening rooms" on public.listening_rooms;
create policy "Authenticated users view public listening rooms" on public.listening_rooms for select to authenticated using (is_public or host_user_id = (select auth.uid()));
drop policy if exists "Users create own listening rooms" on public.listening_rooms;
create policy "Users create own listening rooms" on public.listening_rooms for insert to authenticated with check (host_user_id = (select auth.uid()));
drop policy if exists "Hosts update own listening rooms" on public.listening_rooms;
create policy "Hosts update own listening rooms" on public.listening_rooms for update to authenticated using (host_user_id = (select auth.uid())) with check (host_user_id = (select auth.uid()));
drop policy if exists "Hosts delete own listening rooms" on public.listening_rooms;
create policy "Hosts delete own listening rooms" on public.listening_rooms for delete to authenticated using (host_user_id = (select auth.uid()));

create table if not exists public.listening_room_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.listening_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  username text not null,
  message text not null check (char_length(message) between 1 and 500),
  created_at timestamptz not null default now()
);
create index if not exists listening_room_messages_room_created_idx on public.listening_room_messages(room_id, created_at desc);
alter table public.listening_room_messages enable row level security;
drop policy if exists "Members read room messages" on public.listening_room_messages;
create policy "Members read room messages" on public.listening_room_messages for select to authenticated using (
  exists (select 1 from public.listening_rooms r where r.id = room_id and (r.is_public or r.host_user_id = (select auth.uid())))
);
drop policy if exists "Users send room messages" on public.listening_room_messages;
create policy "Users send room messages" on public.listening_room_messages for insert to authenticated with check (
  user_id = (select auth.uid()) and exists (select 1 from public.listening_rooms r where r.id = room_id and r.is_public)
);

do $$
begin
  alter publication supabase_realtime add table public.listening_rooms;
exception when duplicate_object then null;
when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.listening_room_messages;
exception when duplicate_object then null;
when undefined_object then null;
end $$;
