-- ============================================================
-- প্রভাতবাংলা — core schema
-- ============================================================

-- 1) Roles enum
do $$ begin
  create type public.app_role as enum ('admin', 'editor', 'user');
exception when duplicate_object then null; end $$;

-- 2) profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles
  for select to authenticated using (auth.uid() = id);
drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles
  for update to authenticated using (auth.uid() = id);

-- 3) user_roles
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

drop policy if exists "read own roles" on public.user_roles;
create policy "read own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- 4) posts
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique,
  kicker text,
  excerpt text not null default '',
  content text not null default '',
  image_url text,
  category text not null default 'jatiyo',
  seo_title text,
  seo_description text,
  status text not null default 'draft',
  author_id uuid references auth.users(id) on delete set null,
  author_name text not null default 'প্রভাতবাংলা ডেস্ক',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists posts_status_published_idx
  on public.posts (status, published_at desc);
create index if not exists posts_category_idx on public.posts (category);

grant select on public.posts to anon;
grant select, insert, update, delete on public.posts to authenticated;
grant all on public.posts to service_role;
alter table public.posts enable row level security;

drop policy if exists "published posts are public" on public.posts;
create policy "published posts are public" on public.posts
  for select to anon, authenticated using (status = 'published');

drop policy if exists "admins read all posts" on public.posts;
create policy "admins read all posts" on public.posts
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "admins insert posts" on public.posts;
create policy "admins insert posts" on public.posts
  for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "admins update posts" on public.posts;
create policy "admins update posts" on public.posts
  for update to authenticated using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "admins delete posts" on public.posts;
create policy "admins delete posts" on public.posts
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- 5) post_versions (AI রিরাইটের একাধিক ভার্সন)
create table if not exists public.post_versions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade,
  label text not null default 'v1',
  title text not null default '',
  excerpt text not null default '',
  content text not null default '',
  seo_title text,
  seo_description text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.post_versions to authenticated;
grant all on public.post_versions to service_role;
alter table public.post_versions enable row level security;

drop policy if exists "admins manage versions" on public.post_versions;
create policy "admins manage versions" on public.post_versions
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- 6) updated_at trigger
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists posts_touch_updated_at on public.posts;
create trigger posts_touch_updated_at
  before update on public.posts
  for each row execute function public.touch_updated_at();

-- 7) নতুন ইউজার → profile; প্রথম ইউজার → admin, বাকিরা user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, split_part(coalesce(new.email, ''), '@', 1))
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (
    new.id,
    case when (select count(*) from public.user_roles where role = 'admin') = 0
      then 'admin'::public.app_role
      else 'user'::public.app_role
    end
  )
  on conflict (user_id, role) do nothing;

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();