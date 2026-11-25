drop policy if exists "Profiles are readable" on public.profiles;
drop policy if exists "Public profiles are visible in community directory" on public.profiles;

create policy "Users read own profile and admins read directory"
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or exists (
    select 1
    from public.user_roles ur
    where ur.user_id = (select auth.uid())
      and ur.role = 'admin'
  )
);

create or replace view public.public_member_directory
with (security_invoker = true)
as
select id, username, display_name, avatar_path
from public.profiles;
