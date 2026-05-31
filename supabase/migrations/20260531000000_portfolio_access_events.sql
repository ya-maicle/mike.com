create table if not exists public.portfolio_access_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (
    event_type in ('link_opened', 'login_granted', 'login_denied', 'login_blocked')
  ),
  company_slug text,
  grant_type text check (grant_type in ('link', 'login')),
  path text,
  user_id uuid references auth.users(id) on delete set null,
  email_domain text,
  created_at timestamptz not null default now()
);

alter table public.portfolio_access_events enable row level security;

create index if not exists portfolio_access_events_created_at_idx
  on public.portfolio_access_events(created_at);

create index if not exists portfolio_access_events_company_slug_idx
  on public.portfolio_access_events(company_slug);

create index if not exists portfolio_access_events_user_id_idx
  on public.portfolio_access_events(user_id);
