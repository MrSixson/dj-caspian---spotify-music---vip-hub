-- DJ Caspian Season 2 additive schema proposal.
-- This file is a draft for an isolated Supabase development branch.
-- It has NOT been applied to the connected production database.
-- Existing auth, catalog, likes, VIP, ticket and admin tables are not modified.

create table if not exists public.user_playlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 100),
  description text not null default '' check (char_length(description) <= 1000),
  cover_path text,
  visibility text not null default 'private' check (visibility in ('private','public')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.user_playlist_tracks (
  playlist_id uuid not null references public.user_playlists(id) on delete cascade,
  position integer not null check (position >= 0),
  track_id uuid not null references public.tracks(id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (playlist_id, position)
);
create table if not exists public.listening_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  track_id uuid not null references public.tracks(id) on delete cascade,
  played_at timestamptz not null default now(),
  listened_seconds integer not null default 0 check (listened_seconds >= 0),
  source text not null default 'web' check (source in ('web','radio','playlist','party','ai_dj'))
);
create index if not exists listening_history_user_played_idx on public.listening_history(user_id, played_at desc);
create table if not exists public.artist_follows (
  user_id uuid not null references auth.users(id) on delete cascade,
  artist_name text not null check (char_length(trim(artist_name)) between 1 and 160),
  created_at timestamptz not null default now(),
  primary key (user_id, artist_name)
);
create table if not exists public.album_saves (
  user_id uuid not null references auth.users(id) on delete cascade,
  album_name text not null,
  artist_name text not null default '',
  created_at timestamptz not null default now(),
  primary key (user_id, album_name, artist_name)
);
create table if not exists public.user_follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  followed_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followed_id),
  check (follower_id <> followed_id)
);
create table if not exists public.user_playback_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  autoplay boolean not null default true,
  normalize_volume boolean not null default true,
  crossfade_ms integer not null default 0 check (crossfade_ms between 0 and 12000),
  preferred_quality text not null default 'auto' check (preferred_quality in ('auto','normal','high','lossless')),
  excluded_track_ids uuid[] not null default '{}',
  updated_at timestamptz not null default now()
);
create table if not exists public.listening_rooms (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Caspian Party' check (char_length(title) between 1 and 80),
  is_public boolean not null default false,
  current_track_id uuid references public.tracks(id) on delete set null,
  position_seconds numeric(10,2) not null default 0 check (position_seconds >= 0),
  is_playing boolean not null default false,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create table if not exists public.listening_room_members (
  room_id uuid not null references public.listening_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);
create table if not exists public.listening_room_queue (
  room_id uuid not null references public.listening_rooms(id) on delete cascade,
  position integer not null check (position >= 0),
  track_id uuid not null references public.tracks(id) on delete cascade,
  added_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (room_id, position)
);
create table if not exists public.user_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 2000),
  track_id uuid references public.tracks(id) on delete set null,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  check (sender_id <> recipient_id)
);

alter table public.user_playlists enable row level security;
alter table public.user_playlist_tracks enable row level security;
alter table public.listening_history enable row level security;
alter table public.artist_follows enable row level security;
alter table public.album_saves enable row level security;
alter table public.user_follows enable row level security;
alter table public.user_playback_preferences enable row level security;
alter table public.listening_rooms enable row level security;
alter table public.listening_room_members enable row level security;
alter table public.listening_room_queue enable row level security;
alter table public.user_messages enable row level security;

create policy "s2 playlist owner or public read" on public.user_playlists for select to anon, authenticated using (visibility='public' or user_id=(select auth.uid()));
create policy "s2 playlist owner insert" on public.user_playlists for insert to authenticated with check (user_id=(select auth.uid()));
create policy "s2 playlist owner update" on public.user_playlists for update to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
create policy "s2 playlist owner delete" on public.user_playlists for delete to authenticated using (user_id=(select auth.uid()));
create policy "s2 playlist tracks scoped read" on public.user_playlist_tracks for select to anon, authenticated using (exists(select 1 from public.user_playlists p where p.id=playlist_id and (p.visibility='public' or p.user_id=(select auth.uid()))));
create policy "s2 playlist owner manages tracks" on public.user_playlist_tracks for all to authenticated using (exists(select 1 from public.user_playlists p where p.id=playlist_id and p.user_id=(select auth.uid()))) with check (exists(select 1 from public.user_playlists p where p.id=playlist_id and p.user_id=(select auth.uid())));
create policy "s2 history own rows" on public.listening_history for all to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
create policy "s2 artist follows own rows" on public.artist_follows for all to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
create policy "s2 album saves own rows" on public.album_saves for all to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
create policy "s2 follows own rows" on public.user_follows for all to authenticated using (follower_id=(select auth.uid())) with check (follower_id=(select auth.uid()));
create policy "s2 playback prefs own rows" on public.user_playback_preferences for all to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
create policy "s2 room member or public read" on public.listening_rooms for select to authenticated using (is_public or host_id=(select auth.uid()) or exists(select 1 from public.listening_room_members m where m.room_id=id and m.user_id=(select auth.uid())));
create policy "s2 room host create" on public.listening_rooms for insert to authenticated with check (host_id=(select auth.uid()));
create policy "s2 room host update" on public.listening_rooms for update to authenticated using (host_id=(select auth.uid())) with check (host_id=(select auth.uid()));
create policy "s2 room host delete" on public.listening_rooms for delete to authenticated using (host_id=(select auth.uid()));
create policy "s2 room members read membership" on public.listening_room_members for select to authenticated using (user_id=(select auth.uid()) or exists(select 1 from public.listening_rooms r where r.id=room_id and r.host_id=(select auth.uid())));
create policy "s2 users join public rooms" on public.listening_room_members for insert to authenticated with check (user_id=(select auth.uid()) and exists(select 1 from public.listening_rooms r where r.id=room_id and r.is_public=true));
create policy "s2 users leave or host removes" on public.listening_room_members for delete to authenticated using (user_id=(select auth.uid()) or exists(select 1 from public.listening_rooms r where r.id=room_id and r.host_id=(select auth.uid())));
create policy "s2 room members read queue" on public.listening_room_queue for select to authenticated using (exists(select 1 from public.listening_room_members m where m.room_id=room_id and m.user_id=(select auth.uid())) or exists(select 1 from public.listening_rooms r where r.id=room_id and r.host_id=(select auth.uid())));
create policy "s2 room members add queue" on public.listening_room_queue for insert to authenticated with check (added_by=(select auth.uid()) and (exists(select 1 from public.listening_room_members m where m.room_id=room_id and m.user_id=(select auth.uid())) or exists(select 1 from public.listening_rooms r where r.id=room_id and r.host_id=(select auth.uid()))));
create policy "s2 room host updates queue" on public.listening_room_queue for update to authenticated using (exists(select 1 from public.listening_rooms r where r.id=room_id and r.host_id=(select auth.uid()))) with check (exists(select 1 from public.listening_rooms r where r.id=room_id and r.host_id=(select auth.uid())));
create policy "s2 room host deletes queue" on public.listening_room_queue for delete to authenticated using (exists(select 1 from public.listening_rooms r where r.id=room_id and r.host_id=(select auth.uid())));
create policy "s2 message participants read" on public.user_messages for select to authenticated using (sender_id=(select auth.uid()) or recipient_id=(select auth.uid()));
create policy "s2 sender sends own message" on public.user_messages for insert to authenticated with check (sender_id=(select auth.uid()));
create policy "s2 recipient marks read" on public.user_messages for update to authenticated using (recipient_id=(select auth.uid())) with check (recipient_id=(select auth.uid()));

grant select on public.user_playlists, public.user_playlist_tracks to anon;
grant select, insert, update, delete on public.user_playlists, public.user_playlist_tracks to authenticated;
grant select, insert, delete on public.listening_history, public.artist_follows, public.album_saves, public.user_follows to authenticated;
grant select, insert, update on public.user_playback_preferences to authenticated;
grant select, insert, update, delete on public.listening_rooms, public.listening_room_members, public.listening_room_queue to authenticated;
grant select, insert on public.user_messages to authenticated;
grant update (read_at) on public.user_messages to authenticated;
