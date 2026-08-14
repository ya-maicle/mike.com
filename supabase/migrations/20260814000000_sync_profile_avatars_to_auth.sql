-- Keep application profiles and Supabase Auth user metadata aligned.
-- The public profile remains authoritative; Auth metadata mirrors it so the
-- dashboard, refreshed sessions, and every profile surface resolve one avatar.

create or replace function public.default_avatar_path(user_id uuid)
returns text
language sql
immutable
set search_path = ''
as $$
  select format(
    '/default-avatars/avatar-%s.png',
    1 + mod(abs(hashtext(user_id::text)::bigint), 6)
  );
$$;

create or replace function public.profile_avatar_url(avatar_url text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when avatar_url like 'https://mikeiu.com/default-avatars/%'
      then substr(avatar_url, length('https://mikeiu.com') + 1)
    else avatar_url
  end;
$$;

create or replace function public.sync_profile_to_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  auth_avatar_url text;
begin
  auth_avatar_url := case
    when new.avatar_url like '/%'
      then 'https://mikeiu.com' || new.avatar_url
    else new.avatar_url
  end;

  update auth.users
  set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb)
    || jsonb_build_object(
      'avatar_url', auth_avatar_url,
      'picture', auth_avatar_url,
      'first_name', new.first_name,
      'last_name', new.last_name,
      'full_name', new.full_name,
      'name', new.full_name
    )
  where id = new.id;

  return new;
end;
$$;

drop trigger if exists sync_profile_to_auth_user on public.profiles;
create trigger sync_profile_to_auth_user
after insert or update of avatar_url, first_name, last_name, full_name
on public.profiles
for each row execute function public.sync_profile_to_auth_user();

-- Ensure every existing Auth user has a profile and a stable avatar.
insert into public.profiles (id, email, full_name, avatar_url, created_at, updated_at)
select
  users.id,
  users.email,
  coalesce(
    nullif(users.raw_user_meta_data ->> 'full_name', ''),
    nullif(users.raw_user_meta_data ->> 'name', ''),
    split_part(coalesce(users.email, ''), '@', 1),
    'User'
  ),
  public.profile_avatar_url(
    coalesce(
      nullif(users.raw_user_meta_data ->> 'avatar_url', ''),
      nullif(users.raw_user_meta_data ->> 'picture', ''),
      public.default_avatar_path(users.id)
    )
  ),
  now(),
  now()
from auth.users as users
on conflict (id) do update
set
  email = excluded.email,
  full_name = coalesce(nullif(public.profiles.full_name, ''), excluded.full_name),
  avatar_url = case
    when nullif(public.profiles.avatar_url, '') is null then excluded.avatar_url
    when public.profiles.avatar_url like '/default-avatars/%'
      and excluded.avatar_url not like '/default-avatars/%'
      and excluded.avatar_url not like 'https://mikeiu.com/default-avatars/%'
      then excluded.avatar_url
    else public.profiles.avatar_url
  end,
  updated_at = now();

-- Recreate the signup handler so future users receive the same persisted,
-- deterministic default in both public.profiles and Auth metadata.
create or replace function public.handle_new_user_defaults()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  default_names text[] := array[
    'Anonymous Kraken',
    'Anonymous Blobfish',
    'Anonymous Quokka',
    'Anonymous Unicorn',
    'Anonymous Dumbo Octopus',
    'Anonymous Auroch',
    'Anonymous Nyan Cat',
    'Anonymous Ifrit',
    'Anonymous Quagga'
  ];
  meta_name text;
  chosen_name text;
  chosen_avatar text;
begin
  meta_name := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    ''
  );

  chosen_name := case
    when btrim(meta_name) = ''
      then default_names[1 + floor(random() * array_length(default_names, 1))::int]
    else meta_name
  end;

  chosen_avatar := public.profile_avatar_url(
    coalesce(
      nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
      nullif(new.raw_user_meta_data ->> 'picture', ''),
      public.default_avatar_path(new.id)
    )
  );

  insert into public.profiles (id, email, full_name, avatar_url, created_at, updated_at)
  values (new.id, new.email, chosen_name, chosen_avatar, now(), now())
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(nullif(public.profiles.full_name, ''), excluded.full_name),
    avatar_url = coalesce(nullif(public.profiles.avatar_url, ''), excluded.avatar_url),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user_defaults();

revoke all on function public.sync_profile_to_auth_user() from public;
