-- Rollback: remove the scheduled retention job. (Re-adding the request-path
-- DELETE would be an app change, not a database change.)

do $$
begin
  perform cron.unschedule('purge-portfolio-access-events');
exception
  when others then null;
end;
$$;
