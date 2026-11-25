-- Public member directory exposes only non-sensitive profile fields.
-- Email addresses, auth metadata and private settings are never exposed.
create or replace view public.public_member_directory
with (security_barrier = true)
as
select
  p.id,
  p.username,
  p.display_name,
  p.avatar_path,
  coalesce(v.is_active, false) as is_vip,
  coalesce(r.role, 'user') as role
from public.profiles p
left join public.vip_entitlements v on v.user_id = p.id
left join public.user_roles r on r.user_id = p.id;

grant select on public.public_member_directory to anon, authenticated;
