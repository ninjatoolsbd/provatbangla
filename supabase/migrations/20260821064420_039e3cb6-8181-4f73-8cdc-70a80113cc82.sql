-- ============================================================
-- প্রভাতবাংলা — পূর্ণাঙ্গ পত্রিকা CMS স্কিমা (v2)
-- ============================================================

-- posts এ অতিরিক্ত কলাম
alter table public.posts add column if not exists is_featured boolean not null default false;
alter table public.posts add column if not exists is_breaking boolean not null default false;
alter table public.posts add column if not exists tags text[] not null default '{}';
alter table public.posts add column if not exists view_count integer not null default 0;

-- ---------- categories ----------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.categories to anon;
grant select, insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
drop policy if exists "categories public read" on public.categories;
create policy "categories public read" on public.categories for select to anon, authenticated using (true);
drop policy if exists "categories admin write" on public.categories;
create policy "categories admin write" on public.categories for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

insert into public.categories (slug, name, sort_order) values
  ('jatiyo','জাতীয়',1),('rajniti','রাজনীতি',2),('sarabangla','সারাবাংলা',3),
  ('antorjatik','আন্তর্জাতিক',4),('khela','খেলা',5),('binodon','বিনোদন',6),
  ('arthonity','অর্থনীতি',7),('prajukti','প্রযুক্তি',8),('shikkha','শিক্ষা',9),
  ('sasthyo','স্বাস্থ্য',10),('apradh','অপরাধ',11),('motamot','মতামত',12)
on conflict (slug) do nothing;

-- ---------- breaking news ----------
create table if not exists public.breaking_news (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  link text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.breaking_news to anon;
grant select, insert, update, delete on public.breaking_news to authenticated;
grant all on public.breaking_news to service_role;
alter table public.breaking_news enable row level security;
drop policy if exists "breaking public read" on public.breaking_news;
create policy "breaking public read" on public.breaking_news for select to anon, authenticated using (is_active);
drop policy if exists "breaking admin write" on public.breaking_news;
create policy "breaking admin write" on public.breaking_news for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ---------- e-paper editions ----------
create table if not exists public.epaper_editions (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'প্রভাতবাংলা',
  edition_date date not null default current_date,
  cover_url text,
  pdf_url text,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.epaper_editions to anon;
grant select, insert, update, delete on public.epaper_editions to authenticated;
grant all on public.epaper_editions to service_role;
alter table public.epaper_editions enable row level security;
drop policy if exists "epaper public read" on public.epaper_editions;
create policy "epaper public read" on public.epaper_editions for select to anon, authenticated using (is_published);
drop policy if exists "epaper admin write" on public.epaper_editions;
create policy "epaper admin write" on public.epaper_editions for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ---------- ads ----------
create table if not exists public.ads (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  placement text not null default 'header',
  image_url text,
  link_url text,
  html text,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);
grant select on public.ads to anon;
grant select, insert, update, delete on public.ads to authenticated;
grant all on public.ads to service_role;
alter table public.ads enable row level security;
drop policy if exists "ads public read" on public.ads;
create policy "ads public read" on public.ads for select to anon, authenticated using (is_active);
drop policy if exists "ads admin write" on public.ads;
create policy "ads admin write" on public.ads for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ---------- polls ----------
create table if not exists public.polls (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  options jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.polls to anon;
grant select, insert, update, delete on public.polls to authenticated;
grant all on public.polls to service_role;
alter table public.polls enable row level security;
drop policy if exists "polls public read" on public.polls;
create policy "polls public read" on public.polls for select to anon, authenticated using (true);
drop policy if exists "polls admin write" on public.polls;
create policy "polls admin write" on public.polls for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table if not exists public.poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  option_index integer not null,
  voter_key text not null,
  created_at timestamptz not null default now(),
  unique (poll_id, voter_key)
);
grant select, insert on public.poll_votes to anon;
grant select, insert on public.poll_votes to authenticated;
grant all on public.poll_votes to service_role;
alter table public.poll_votes enable row level security;
drop policy if exists "votes public read" on public.poll_votes;
create policy "votes public read" on public.poll_votes for select to anon, authenticated using (true);
drop policy if exists "votes public insert" on public.poll_votes;
create policy "votes public insert" on public.poll_votes for insert to anon, authenticated with check (true);

-- ---------- comments ----------
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade,
  name text not null default 'পাঠক',
  email text,
  body text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
create index if not exists comments_post_idx on public.comments (post_id, status);
grant select, insert on public.comments to anon;
grant select, insert, update, delete on public.comments to authenticated;
grant all on public.comments to service_role;
alter table public.comments enable row level security;
drop policy if exists "comments approved public read" on public.comments;
create policy "comments approved public read" on public.comments for select to anon, authenticated using (status = 'approved');
drop policy if exists "comments public insert" on public.comments;
create policy "comments public insert" on public.comments for insert to anon, authenticated with check (status = 'pending');
drop policy if exists "comments admin all" on public.comments;
create policy "comments admin all" on public.comments for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ---------- contact messages ----------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  subject text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
grant insert on public.contact_messages to anon;
grant select, insert, update, delete on public.contact_messages to authenticated;
grant all on public.contact_messages to service_role;
alter table public.contact_messages enable row level security;
drop policy if exists "contact public insert" on public.contact_messages;
create policy "contact public insert" on public.contact_messages for insert to anon, authenticated with check (true);
drop policy if exists "contact admin read" on public.contact_messages;
create policy "contact admin read" on public.contact_messages for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ---------- newsletter subscribers ----------
create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
grant insert on public.subscribers to anon;
grant select, insert, update, delete on public.subscribers to authenticated;
grant all on public.subscribers to service_role;
alter table public.subscribers enable row level security;
drop policy if exists "subs public insert" on public.subscribers;
create policy "subs public insert" on public.subscribers for insert to anon, authenticated with check (true);
drop policy if exists "subs admin all" on public.subscribers;
create policy "subs admin all" on public.subscribers for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ---------- media library ----------
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  file_name text,
  mime_type text,
  size_bytes integer,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
grant select on public.media to anon;
grant select, insert, update, delete on public.media to authenticated;
grant all on public.media to service_role;
alter table public.media enable row level security;
drop policy if exists "media public read" on public.media;
create policy "media public read" on public.media for select to anon, authenticated using (true);
drop policy if exists "media staff write" on public.media;
create policy "media staff write" on public.media for all to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'))
  with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'));

-- ---------- site settings ----------
create table if not exists public.site_settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);
grant select on public.site_settings to anon;
grant select, insert, update, delete on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
drop policy if exists "settings public read" on public.site_settings;
create policy "settings public read" on public.site_settings for select to anon, authenticated using (true);
drop policy if exists "settings admin write" on public.site_settings;
create policy "settings admin write" on public.site_settings for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

insert into public.site_settings (key, value) values
  ('site_name','প্রভাতবাংলা'),
  ('tagline','সময়ের সাথে সত্যের পথে'),
  ('contact_email','news@provatbangla.com'),
  ('contact_phone','+৮৮০ ১৭০০-০০০০০০'),
  ('address','ঢাকা, বাংলাদেশ'),
  ('facebook',''),('youtube',''),('twitter','')
on conflict (key) do nothing;

-- ---------- view counter ----------
create or replace function public.increment_post_view(_post_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.posts set view_count = view_count + 1 where id = _post_id;
$$;
grant execute on function public.increment_post_view(uuid) to anon, authenticated;