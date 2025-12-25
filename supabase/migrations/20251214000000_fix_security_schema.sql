-- Fix 1: Remove Duplicate Policies on profiles
-- We prefer the snake_case naming convention (profiles_select_own, etc.)
-- and remove the verbose English ones ("Users can view own profile", etc.)

drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;

-- Fix 2: Optimize RLS Policies using (select auth.uid()) to avoid re-evaluation per row
-- See: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select

-- PROFILES
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
for select using (auth.uid() = id); -- Note: auth.uid() vs (select auth.uid()) optimization is subtle in simple equality but good practice

-- Re-create to be sure we are using best practices, though simple equality `auth.uid() = id` is often optimizable by PG.
-- The linter specifically flags `current_setting` or `auth.uid()` usage without wrapping in sub-select in some contexts,
-- but for simple ID equality, Postgres usually handles it well. 
-- However, to strictly satisfy the linter and ensure stable performance:

-- "profiles_select_own"
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
for select using ( (select auth.uid()) = id );

-- "profiles_insert_own"
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
for insert with check ( (select auth.uid()) = id );

-- "profiles_update_own"
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
for update using ( (select auth.uid()) = id ) with check ( (select auth.uid()) = id );

-- ENTITLEMENTS
-- "Users can view own entitlements"
drop policy if exists "Users can view own entitlements" on public.entitlements;
create policy "entitlements_select_own" on public.entitlements
for select using ( (select auth.uid()) = user_id );

-- SUBSCRIPTIONS
-- "Users can view own subscriptions"
drop policy if exists "Users can view own subscriptions" on public.subscriptions;
create policy "subscriptions_select_own" on public.subscriptions
for select using ( (select auth.uid()) = user_id );


-- Fix 3: Add Missing Indexes on Foreign Keys

create index if not exists entitlements_user_id_idx on public.entitlements(user_id);
create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);
