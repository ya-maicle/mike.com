# Supabase Setup (Phase 0)

This folder holds local database tooling and versioned SQL migrations for Supabase (Postgres + Auth).

Phase 0 goals:

- Run Supabase locally for development (`supabase start`)
- Version schema changes under `supabase/migrations/`
- Prepare to link local CLI to remote staging/production projects (created in Supabase Dashboard)
- Seed Vercel Environment Variables with Supabase credentials per environment

Important:

- Do NOT commit secrets. Only commit SQL migrations and non-secret config.
- Service role keys are server-only; never expose to the client or commit to the repo.

---

## 1) Install Supabase CLI

macOS (Homebrew):

- brew install supabase/tap/supabase

Verify:

- supabase --version

If you prefer not to install globally, see: https://supabase.com/docs/guides/cli

---

## 2) Create remote projects (Dashboard)

Create two managed projects in the Supabase Dashboard:

- maicle-staging (EU/UK region recommended)
- maicle-prod (same region as staging)

For each project, record:

- Project Reference (Settings → API → Project Reference)
- API URL (Settings → API → URL)
- anon (public) key (Settings → API → anon key)
- service_role key (Settings → API → service_role key — server-only)

These values will be used to:

- Link the CLI to each project (via Project Reference)
- Seed Vercel environment variables (URL + keys)

---

## 3) Initialize local Supabase and start services

At repo root:

- supabase init
- supabase start

This will generate a local `config.toml` and start Postgres, Auth, Storage, and Studio in Docker.

Notes:

- The CLI scaffolds files under `supabase/` as needed.
- You can stop services with `supabase stop`.

---

## 4) Migrations workflow

Use these npm scripts from the repo root (see package.json):

- pnpm db:start
  Starts local Supabase (same as `supabase start`).

- pnpm db:stop
  Stops local Supabase (`supabase stop`).

- pnpm db:reset
  Resets local DB (drops data; no backup). Use sparingly.

- pnpm db:diff
  Creates a new timestamped SQL migration file under `supabase/migrations/` based on differences between your local DB and current migrations.

Handy flow:

1. Start local: `pnpm db:start`
2. Apply any pending migrations automatically on start (CLI manages this)
3. Make schema changes locally (e.g., via SQL or psql)
4. Generate migration: `pnpm db:diff`
5. Commit the new migration file

---

## 5) Link CLI to remote projects

Export your project refs (from Dashboard → Settings → API):

- export SUPABASE_STAGING_PROJECT_REF=<your-staging-project-ref>
- export SUPABASE_PROD_PROJECT_REF=<your-prod-project-ref>

Then link:

- pnpm db:link:staging
- pnpm db:link:prod

This stores the remote link in your local `.supabase` config for future CLI operations (no secrets committed).

Important:

- Migrations to managed environments will be executed by CI (Phase 0/1), not manually from laptops.

---

## 6) Vercel environment variables

Set these per environment in the Vercel project (Development, Preview, Production):

Client (safe to expose):

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

Server-only:

- SUPABASE_SERVICE_ROLE_KEY
- DATABASE_URL (optional; if you need a direct connection string for server jobs)

Recommended mapping:

- Local (Development): local URL/keys from `supabase start` or pulled via `vercel env pull`
- Preview (PRs): use staging URL/key to share a common schema
- Staging: staging project
- Production: production project

After seeding Vercel:

- Pull local envs with `vercel env pull .env.local` (do not commit `.env.local`)

---

## 7) Security and RLS baseline

- Phase 0: keep schema simple, prepare the pipeline. RLS deny-all will be enforced in Phase 1 when tables exist.
- Never place service_role or DATABASE_URL in client-exposed variables.
- Treat each environment (staging/production) as separate credentials; never reuse across envs.

---

## 8) Troubleshooting

- supabase: command not found
  Install the CLI (see Section 1) and ensure your shell PATH includes Homebrew binary paths.

- Docker not running
  The CLI needs Docker for `supabase start`. Start Docker Desktop first.

- Migrations not detected
  Ensure you generated a migration file with `pnpm db:diff` and committed it under `supabase/migrations/`.
