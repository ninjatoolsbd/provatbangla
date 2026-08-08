-- ============================================================
-- প্রভাতবাংলা — অটো নিউজ কালেকশন (সোর্স সাইট থেকে অটো রিরাইট ও পাবলিশ)
-- ============================================================

-- সোর্স সাইট তালিকা
create table if not exists public.auto_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  site_url text not null,
  category text not null default 'auto',
  per_run int not null default 5,
  enabled boolean not null default true,
  last_run_at timestamptz,
  last_status text,
  created_at timestamptz not null default now()
);

grant select on public.auto_sources to anon;
grant select, insert, update, delete on public.auto_sources to authenticated;
grant all on public.auto_sources to service_role;
alter table public.auto_sources enable row level security;
drop policy if exists "auto_sources read" on public.auto_sources;
create policy "auto_sources read" on public.auto_sources
  for select to anon, authenticated using (true);
drop policy if exists "auto_sources admin write" on public.auto_sources;
create policy "auto_sources admin write" on public.auto_sources
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- প্রতিটি সোর্স আর্টিকেলের রেকর্ড (ডুপ্লিকেট আটকাতে)
create table if not exists public.auto_items (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.auto_sources(id) on delete set null,
  source_url text not null unique,
  source_title text,
  post_id uuid,
  status text not null default 'pending',
  message text,
  created_at timestamptz not null default now()
);

create index if not exists auto_items_created_idx on public.auto_items (created_at desc);

grant select on public.auto_items to anon;
grant select, insert, update, delete on public.auto_items to authenticated;
grant all on public.auto_items to service_role;
alter table public.auto_items enable row level security;
drop policy if exists "auto_items read" on public.auto_items;
create policy "auto_items read" on public.auto_items
  for select to anon, authenticated using (true);
drop policy if exists "auto_items admin write" on public.auto_items;
create policy "auto_items admin write" on public.auto_items
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- ডিফল্ট সোর্স
insert into public.auto_sources (name, site_url, category, per_run)
select 'দৈনিক আমাদের সময়', 'https://dainikamadershomoy.com', 'auto', 5
where not exists (select 1 from public.auto_sources where site_url = 'https://dainikamadershomoy.com');

insert into public.auto_sources (name, site_url, category, per_run)
select 'বণিক বার্তা', 'https://bonikbarta.com', 'auto', 5
where not exists (select 1 from public.auto_sources where site_url = 'https://bonikbarta.com');

-- অটোমেশন সেটিংস
insert into public.site_settings (key, value) values
  ('auto_enabled', 'true'),
  ('auto_mode', 'draft'),
  ('auto_credit', 'true'),
  ('auto_image_ai', 'true'),
  ('watermark_logo_url', ''),
  ('auto_cron_token', replace(gen_random_uuid()::text, '-', ''))
on conflict (key) do nothing;
