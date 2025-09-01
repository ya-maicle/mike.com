-- Create defaults for name and avatar on user signup and ensure a profile row exists.
-- This runs inside the database so it works for magic link and OAuth flows,
-- and is not affected by client-side RLS or timing.

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
  default_avatars text[] := array[
    '/default-avatars/avatar-1.png',
    '/default-avatars/avatar-2.png',
    '/default-avatars/avatar-3.png',
    '/default-avatars/avatar-4.png',
    '/default-avatars/avatar-5.png',
    '/default-avatars/avatar-6.png'
  ];
  meta_name text;
  chosen_name text;
  chosen_avatar text;
begin
  -- Name from auth metadata if provided, else pick a default.
  meta_name := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    ''
  );

  if meta_name is null or btrim(meta_name) = '' then
    chosen_name := default_names[1 + floor(random() * array_length(default_names,1))::int];
  else
    chosen_name := meta_name;
  end if;

  -- Always choose a default avatar if none was supplied via metadata.
  chosen_avatar := coalesce(
    nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
    nullif(new.raw_user_meta_data ->> 'picture', ''),
    default_avatars[1 + floor(random() * array_length(default_avatars,1))::int]
  );

  -- Ensure a profile row exists with defaults. Update on conflict to keep email fresh.
  insert into public.profiles (id, email, full_name, avatar_url, created_at, updated_at)
  values (new.id, new.email, chosen_name, chosen_avatar, now(), now())
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(nullif(public.profiles.full_name, ''), excluded.full_name),
        avatar_url = coalesce(nullif(public.profiles.avatar_url, ''), excluded.avatar_url),
        updated_at = now();

  -- Optionally reflect the chosen name back into auth metadata (so the Auth UI shows it).
  if meta_name is null or btrim(meta_name) = '' then
    begin
      update auth.users
        set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb)
                                  || jsonb_build_object('full_name', chosen_name, 'name', chosen_name)
        where id = new.id;
    exception when others then
      -- ignore failures; not critical
      null;
    end;
  end if;

  return new;
end;
$$;

-- Recreate trigger to ensure it's in place
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user_defaults();

-- Helpful RLS policies for profiles (only if not already present).
-- These statements are idempotent; they create policies only if missing.
do $$
begin
  begin
    execute 'alter table public.profiles enable row level security';
  exception when others then null; end;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_select_own'
  ) then
    execute 'create policy profiles_select_own on public.profiles for select using (auth.uid() = id)';
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_insert_own'
  ) then
    execute 'create policy profiles_insert_own on public.profiles for insert with check (auth.uid() = id)';
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_update_own'
  ) then
    execute 'create policy profiles_update_own on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id)';
  end if;
end $$;

