-- 1) has_role: run as the calling user instead of elevated privileges.
-- Users can only read their own role row (existing "read own roles" policy), so this is safe.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = 'public'
AS $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- 2) poll_results: backend-only execution
REVOKE EXECUTE ON FUNCTION public.poll_results(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.poll_results(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.poll_results(uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.poll_results(uuid) TO service_role;

-- 3) Internal automation tables: remove public visibility (admins keep full access via their existing all-operations policy)
DROP POLICY IF EXISTS "auto_items read" ON public.auto_items;
DROP POLICY IF EXISTS "auto_sources read" ON public.auto_sources;

-- 4) Comments: remove public read access (hides commenter emails); public can still submit, admins manage
DROP POLICY IF EXISTS "comments approved public read" ON public.comments;