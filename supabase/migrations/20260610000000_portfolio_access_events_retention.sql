-- Move portfolio_access_events retention off the request path: the app used
-- to issue a DELETE before every insert. A daily pg_cron job replaces it.

create extension if not exists pg_cron with schema extensions;

-- Idempotent: drop an existing schedule with the same name before recreating.
do $$
begin
  perform cron.unschedule('purge-portfolio-access-events');
exception
  when others then null; -- job did not exist yet
end;
$$;

select cron.schedule(
  'purge-portfolio-access-events',
  '0 3 * * *',
  $$delete from public.portfolio_access_events where created_at < now() - interval '180 days'$$
);
