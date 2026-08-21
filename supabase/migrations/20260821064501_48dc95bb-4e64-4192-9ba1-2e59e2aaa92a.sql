-- ============================================================
-- প্রভাতবাংলা — অথর (editor) সাপোর্ট
-- ============================================================

-- অথর নিজের নিউজ পড়তে পারবে (ড্রাফট সহ)
drop policy if exists "authors read own posts" on public.posts;
create policy "authors read own posts" on public.posts
  for select to authenticated using (auth.uid() = author_id);

-- অথর নিজের নামে নিউজ তৈরি করতে পারবে
drop policy if exists "authors insert own posts" on public.posts;
create policy "authors insert own posts" on public.posts
  for insert to authenticated
  with check (public.has_role(auth.uid(), 'editor') and auth.uid() = author_id);

-- অথর শুধু নিজের নিউজ এডিট করতে পারবে
drop policy if exists "authors update own posts" on public.posts;
create policy "authors update own posts" on public.posts
  for update to authenticated
  using (public.has_role(auth.uid(), 'editor') and auth.uid() = author_id)
  with check (auth.uid() = author_id);

-- অথর নিজের নিউজ মুছতে পারবে
drop policy if exists "authors delete own posts" on public.posts;
create policy "authors delete own posts" on public.posts
  for delete to authenticated
  using (public.has_role(auth.uid(), 'editor') and auth.uid() = author_id);