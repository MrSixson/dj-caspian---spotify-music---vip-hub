-- DJ Caspian: track integrity migration
-- Adds file-level duplicate detection and a server-side admin deletion RPC.
-- Applying this migration does not delete any existing track or Storage object.

alter table public.tracks
  add column if not exists audio_sha256 text;

create unique index if not exists tracks_audio_sha256_unique
  on public.tracks (audio_sha256)
  where audio_sha256 is not null;

create or replace function public.admin_delete_track(p_track_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_track public.tracks%rowtype;
begin
  if auth.uid() is null or not exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role = 'admin'
  ) then
    raise exception 'Only authenticated admins can delete tracks.'
      using errcode = '42501';
  end if;

  select *
    into v_track
    from public.tracks
    where id = p_track_id
    for update;

  if not found then
    raise exception 'Track not found.'
      using errcode = 'P0002';
  end if;

  delete from public.user_likes where track_id = p_track_id;
  delete from public.playlist_tracks where track_id = p_track_id;
  delete from public.tracks where id = p_track_id;

  return jsonb_build_object(
    'audio_path', v_track.audio_path,
    'cover_path', v_track.cover_path
  );
end;
$$;

revoke all on function public.admin_delete_track(uuid) from public;
grant execute on function public.admin_delete_track(uuid) to authenticated;
