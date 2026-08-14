-- Supabase Auth may write raw_user_meta_data again after auth.users is inserted.
-- Keep the profile avatar authoritative whenever that metadata is inserted or
-- updated, including during the initial account-creation transaction.

create or replace function public.ensure_auth_user_avatar_metadata()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  profile_avatar_url text;
  resolved_avatar_url text;
begin
  select profiles.avatar_url
  into profile_avatar_url
  from public.profiles as profiles
  where profiles.id = new.id;

  resolved_avatar_url := coalesce(
    nullif(profile_avatar_url, ''),
    nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
    nullif(new.raw_user_meta_data ->> 'picture', ''),
    public.default_avatar_path(new.id)
  );

  if resolved_avatar_url like '/%' then
    resolved_avatar_url := 'https://mikeiu.com' || resolved_avatar_url;
  end if;

  new.raw_user_meta_data := coalesce(new.raw_user_meta_data, '{}'::jsonb)
    || jsonb_build_object(
      'avatar_url', resolved_avatar_url,
      'picture', resolved_avatar_url
    );

  return new;
end;
$$;

drop trigger if exists ensure_auth_user_avatar_metadata on auth.users;
create trigger ensure_auth_user_avatar_metadata
before insert or update of raw_user_meta_data
on auth.users
for each row execute function public.ensure_auth_user_avatar_metadata();

-- Repair users created between the original backfill and this guard trigger.
-- The before-update trigger supplies the authoritative profile/default avatar.
update auth.users
set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb)
where nullif(raw_user_meta_data ->> 'avatar_url', '') is null
   or nullif(raw_user_meta_data ->> 'picture', '') is null;

revoke all on function public.ensure_auth_user_avatar_metadata() from public;
