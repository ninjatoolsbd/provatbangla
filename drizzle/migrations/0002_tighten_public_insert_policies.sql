DROP POLICY IF EXISTS "votes public insert" ON public.poll_votes;
CREATE POLICY "votes public insert" ON public.poll_votes FOR INSERT TO anon, authenticated
WITH CHECK (
  option_index >= 0
  AND length(voter_key) BETWEEN 8 AND 200
  AND EXISTS (SELECT 1 FROM public.polls p WHERE p.id = poll_id AND p.is_active AND option_index < jsonb_array_length(p.options))
);

DROP POLICY IF EXISTS "subs public insert" ON public.subscribers;
CREATE POLICY "subs public insert" ON public.subscribers FOR INSERT TO anon, authenticated
WITH CHECK (
  is_active = true
  AND length(email) <= 255
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
);

DROP POLICY IF EXISTS "contact public insert" ON public.contact_messages;
CREATE POLICY "contact public insert" ON public.contact_messages FOR INSERT TO anon, authenticated
WITH CHECK (
  is_read = false
  AND length(name) BETWEEN 1 AND 200
  AND length(message) BETWEEN 1 AND 5000
  AND (email IS NULL OR length(email) <= 255)
  AND (phone IS NULL OR length(phone) <= 50)
  AND (subject IS NULL OR length(subject) <= 300)
);