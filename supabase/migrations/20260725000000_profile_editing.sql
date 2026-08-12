-- Add structured profile names while preserving full_name for existing consumers.
alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text;

update public.profiles
set
  first_name = nullif(
    split_part(regexp_replace(btrim(coalesce(full_name, '')), '\s+', ' ', 'g'), ' ', 1),
    ''
  ),
  last_name = nullif(
    regexp_replace(
      regexp_replace(btrim(coalesce(full_name, '')), '\s+', ' ', 'g'),
      '^\S+\s*',
      ''
    ),
    ''
  )
where first_name is null and last_name is null;

-- Keep the legacy full_name column synchronized for signup and existing UI paths.
create or replace function public.sync_profile_names()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  normalized_full_name text;
begin
  if
    tg_op = 'INSERT'
    and nullif(btrim(coalesce(new.first_name, '')), '') is null
    and nullif(btrim(coalesce(new.last_name, '')), '') is null
  then
    normalized_full_name := regexp_replace(
      btrim(coalesce(new.full_name, '')),
      '\s+',
      ' ',
      'g'
    );
    new.first_name := nullif(split_part(normalized_full_name, ' ', 1), '');
    new.last_name := nullif(
      regexp_replace(normalized_full_name, '^\S+\s*', ''),
      ''
    );
  elsif
    tg_op = 'INSERT'
    or new.first_name is distinct from old.first_name
    or new.last_name is distinct from old.last_name
  then
    new.first_name := nullif(
      regexp_replace(btrim(coalesce(new.first_name, '')), '\s+', ' ', 'g'),
      ''
    );
    new.last_name := nullif(
      regexp_replace(btrim(coalesce(new.last_name, '')), '\s+', ' ', 'g'),
      ''
    );
    new.full_name := nullif(
      btrim(concat_ws(' ', new.first_name, new.last_name)),
      ''
    );
  elsif new.full_name is distinct from old.full_name then
    normalized_full_name := regexp_replace(
      btrim(coalesce(new.full_name, '')),
      '\s+',
      ' ',
      'g'
    );
    new.first_name := nullif(split_part(normalized_full_name, ' ', 1), '');
    new.last_name := nullif(
      regexp_replace(normalized_full_name, '^\S+\s*', ''),
      ''
    );
  end if;

  return new;
end;
$$;

drop trigger if exists sync_profile_names on public.profiles;
create trigger sync_profile_names
before insert or update of first_name, last_name, full_name
on public.profiles
for each row execute function public.sync_profile_names();

-- Profile pictures are public display assets, but each user may only manage
-- the single object at <their-auth-id>/avatar.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "avatars_select_own" on storage.objects;
create policy "avatars_select_own"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'avatars'
  and name = (select auth.uid())::text || '/avatar'
);

drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and name = (select auth.uid())::text || '/avatar'
);

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and name = (select auth.uid())::text || '/avatar'
)
with check (
  bucket_id = 'avatars'
  and name = (select auth.uid())::text || '/avatar'
);

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and name = (select auth.uid())::text || '/avatar'
);
