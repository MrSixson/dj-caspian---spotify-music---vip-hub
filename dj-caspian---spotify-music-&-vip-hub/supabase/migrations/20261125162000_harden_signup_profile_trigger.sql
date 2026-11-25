create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  base_username text;
  final_username text;
begin
  base_username := lower(regexp_replace(
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'username'), ''),
      split_part(coalesce(new.email, ''), '@', 1),
      'user'
    ),
    '[^a-zA-Z0-9_]+', '_', 'g'
  ));
  base_username := trim(both '_' from base_username);
  if base_username = '' then base_username := 'user'; end if;
  base_username := left(base_username, 48);
  final_username := base_username;

  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    final_username,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), '')
  )
  on conflict (username) do nothing;

  if not found then
    final_username := left(base_username, 40) || '_' || replace(new.id::text, '-', '');
    insert into public.profiles (id, username, display_name)
    values (
      new.id,
      final_username,
      coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), '')
    );
  end if;

  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict (user_id) do nothing;

  insert into public.vip_entitlements (user_id, is_active)
  values (new.id, false)
  on conflict (user_id) do nothing;

  return new;
end;
$function$;
