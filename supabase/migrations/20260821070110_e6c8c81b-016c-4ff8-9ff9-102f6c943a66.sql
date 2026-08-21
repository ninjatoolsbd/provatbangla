-- 1. Lock down SECURITY DEFINER functions
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.increment_post_view(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.increment_post_view(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- 2. media: no public read of uploader identity
DROP POLICY IF EXISTS "media public read" ON public.media;
CREATE POLICY "media staff read" ON public.media
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'editor'::public.app_role));
REVOKE SELECT ON public.media FROM anon;

-- 3. poll_votes: hide voter_key; expose aggregate counts only
DROP POLICY IF EXISTS "votes public read" ON public.poll_votes;
CREATE POLICY "votes admin read" ON public.poll_votes
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
REVOKE SELECT ON public.poll_votes FROM anon;

CREATE OR REPLACE FUNCTION public.poll_results(_poll_id uuid)
RETURNS TABLE (option_index integer, votes bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT pv.option_index, count(*)::bigint
  FROM public.poll_votes pv
  WHERE pv.poll_id = _poll_id
  GROUP BY pv.option_index
$$;
REVOKE ALL ON FUNCTION public.poll_results(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.poll_results(uuid) TO anon, authenticated, service_role;

-- 4. site_settings: only public-safe keys readable by visitors
DROP POLICY IF EXISTS "settings public read" ON public.site_settings;
CREATE POLICY "settings public safe read" ON public.site_settings
  FOR SELECT TO anon, authenticated
  USING (
    key IN (
      'site_name','site_tagline','site_logo_url','site_favicon_url',
      'contact_email','contact_phone','contact_address',
      'facebook_url','twitter_url','youtube_url','instagram_url','linkedin_url',
      'footer_text','about_short'
    )
  );
CREATE POLICY "settings admin read" ON public.site_settings
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 5. contact_messages: validate submissions
CREATE OR REPLACE FUNCTION public.validate_contact_message()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.name := btrim(NEW.name);
  NEW.message := btrim(NEW.message);
  IF length(NEW.name) < 2 OR length(NEW.name) > 100 THEN
    RAISE EXCEPTION 'Invalid name length';
  END IF;
  IF length(NEW.message) < 5 OR length(NEW.message) > 5000 THEN
    RAISE EXCEPTION 'Invalid message length';
  END IF;
  IF NEW.subject IS NOT NULL AND length(NEW.subject) > 200 THEN
    RAISE EXCEPTION 'Invalid subject length';
  END IF;
  IF NEW.phone IS NOT NULL AND length(NEW.phone) > 30 THEN
    RAISE EXCEPTION 'Invalid phone length';
  END IF;
  IF NEW.email IS NOT NULL AND NEW.email <> '' THEN
    NEW.email := lower(btrim(NEW.email));
    IF length(NEW.email) > 255 OR NEW.email !~ '^[A-Za-z0-9._%%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
      RAISE EXCEPTION 'Invalid email address';
    END IF;
  END IF;
  NEW.is_read := false;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.validate_contact_message() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS validate_contact_message_trg ON public.contact_messages;
CREATE TRIGGER validate_contact_message_trg
  BEFORE INSERT OR UPDATE ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.validate_contact_message();

-- 6. storage.objects: explicit policies for the private news-images bucket
DROP POLICY IF EXISTS "news images staff read" ON storage.objects;
DROP POLICY IF EXISTS "news images staff insert" ON storage.objects;
DROP POLICY IF EXISTS "news images staff update" ON storage.objects;
DROP POLICY IF EXISTS "news images staff delete" ON storage.objects;

CREATE POLICY "news images staff read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'news-images'
    AND (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'editor'::public.app_role))
  );
CREATE POLICY "news images staff insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'news-images'
    AND (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'editor'::public.app_role))
  );
CREATE POLICY "news images staff update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'news-images'
    AND (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'editor'::public.app_role))
  )
  WITH CHECK (
    bucket_id = 'news-images'
    AND (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'editor'::public.app_role))
  );
CREATE POLICY "news images staff delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'news-images'
    AND (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'editor'::public.app_role))
  );