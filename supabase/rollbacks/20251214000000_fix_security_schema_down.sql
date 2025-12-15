-- Revert migration: 20251214000000_fix_security_schema.sql

-- 1. Remove Indexes
drop index if exists entitlements_user_id_idx;
drop index if exists subscriptions_user_id_idx;

-- 2. Drop "snake_case" RLS Policies (New ones)

-- PROFILES
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

-- ENTITLEMENTS
drop policy if exists "entitlements_select_own" on public.entitlements;

-- SUBSCRIPTIONS
drop policy if exists "subscriptions_select_own" on public.subscriptions;

-- 3. Restore "Original" RLS Policies 
-- Restoring based on linter descriptions ("Users can ...") and standard pattern.
-- Note: These policies were flagged as "permissive" by the linter, implying they likely used `auth.uid() = id` (or user_id).

-- PROFILES
-- "Users can view own profile"
create policy "Users can view own profile" on public.profiles
for select using ( auth.uid() = id );

-- "Users can insert own profile" (assuming this existed, though the linter only mentioned Update/Select specifics + duplicate INSERT policies were implied by "Multiple Permissive Policies" if present, but the log only showed SELECT/UPDATE for duplicated ones, but INSERT is standard. I will restore what I deleted.)
create policy "Users can insert own profile" on public.profiles
for insert with check ( auth.uid() = id );

-- "Users can update own profile"
create policy "Users can update own profile" on public.profiles
for update using ( auth.uid() = id );

-- ENTITLEMENTS
-- "Users can view own entitlements"
create policy "Users can view own entitlements" on public.entitlements
for select using ( auth.uid() = user_id );

-- SUBSCRIPTIONS
-- "Users can view own subscriptions"
create policy "Users can view own subscriptions" on public.subscriptions
for select using ( auth.uid() = user_id );
