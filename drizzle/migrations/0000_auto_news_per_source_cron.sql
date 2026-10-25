DO $$
DECLARE j text;
BEGIN
  FOR j IN SELECT jobname FROM cron.job WHERE jobname LIKE 'auto-news-daily-10am%' LOOP
    PERFORM cron.unschedule(j);
  END LOOP;
END $$;

DO $$
DECLARE i int; m int;
BEGIN
  FOR i IN 1..5 LOOP
    m := (i - 1) * 6;
    PERFORM cron.schedule(
      'auto-news-daily-10am-' || i,
      m || ' 4 * * *',
      $cmd$
      SELECT net.http_get(
        url := 'https://provatbanglanews.com/api/public/cron-sync?limit=1&source=' || s.id
               || '&token=' || (SELECT value FROM public.site_settings WHERE key = 'auto_cron_token'),
        timeout_milliseconds := 300000
      )
      FROM public.auto_sources s
      WHERE s.enabled = true;
      $cmd$
    );
  END LOOP;
END $$;