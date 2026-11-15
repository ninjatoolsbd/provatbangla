DROP POLICY IF EXISTS "comments public insert" ON public.comments;
CREATE POLICY "comments public insert" ON public.comments FOR INSERT TO anon, authenticated
WITH CHECK (
  status = 'pending'
  AND post_id IS NOT NULL
  AND length(name) BETWEEN 1 AND 200
  AND length(body) BETWEEN 1 AND 5000
  AND (email IS NULL OR length(email) <= 255)
  AND EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND p.status = 'published')
);