-- Publish only the non-sensitive profile fields needed by the community directory.
-- RLS remains enabled and the view executes with the caller's privileges.
drop view if exists public.public_member_directory;
create view public.public_member_directory
with (security_invoker = true)
as
select p.id, p.username, p.display_name, p.avatar_path
from public.profiles p;

grant select (id, username, display_name, avatar_path)
  on public.profiles to anon, authenticated;
grant select on public.public_member_directory to anon, authenticated;

drop policy if exists "Public profiles are visible in community directory" on public.profiles;
create policy "Public profiles are visible in community directory"
  on public.profiles
  for select
  to anon, authenticated
  using (true);
