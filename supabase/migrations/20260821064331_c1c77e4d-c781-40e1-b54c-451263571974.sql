-- Set search_path on trigger function
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin new.updated_at = now(); return new; end $$;

-- Restrict has_role: needed by authenticated users for admin checks, never public
revoke execute on function public.has_role(uuid, public.app_role) from public;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;

-- Restrict handle_new_user: only the auth trigger needs this
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from authenticated;