alter table public.epaper_editions add column if not exists post_ids uuid[] not null default '{}';
alter table public.epaper_editions add column if not exists week_start date;
alter table public.epaper_editions add column if not exists week_end date;