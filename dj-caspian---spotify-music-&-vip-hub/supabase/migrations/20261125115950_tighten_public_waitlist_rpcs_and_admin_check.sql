-- Security hardening for DJ Caspian Supabase.
-- Keep admin authorization callable by signed-in users under their own RLS context,
-- and remove unused legacy waitlist RPCs from the public Data API.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = (SELECT auth.uid())
      AND role = 'admin'
  );
$function$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- These legacy waitlist RPCs are not used by the current DJ Caspian frontend.
-- Keep their underlying table inaccessible through the public Data API.
REVOKE ALL ON FUNCTION public.get_site_waitlist_stats() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_site_waitlist_stats() FROM anon, authenticated;

REVOKE ALL ON FUNCTION public.register_site_waitlist_interest() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.register_site_waitlist_interest() FROM anon, authenticated;
