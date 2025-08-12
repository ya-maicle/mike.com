# Development process & environments

## Environments (single source of truth)

- **Local (dev):** your laptop. Uses `.env.local` and Vercel “Development” env vars pulled via `vercel env pull`. Optional Docker only when you need local Supabase or to reproduce CI exactly.
- **Preview (PR):** every pull request deploys a Vercel Preview URL + ephemeral Sanity preview if needed. Used for design reviews and QA.
- **Staging:** protected branch (e.g., `release` or `main` with a flag). Mirrors prod config but points at **staging** Stripe keys, Supabase DB, and MailerLite sandbox.
- **Production:** protected `main` (or `prod`) branch → Vercel Production.

**Golden rule:** features are merged behind flags or fully dark‑launched to staging before prod.

---

# GitHub workflow (trunk‑based, short‑lived branches)

## Branching

- **Default:** trunk‑based. Keep `main` protected.
- Feature branches: `feat/<scope>‑<short‑slug>`
  Fix branches: `fix/<scope>‑<issue#>`
  Ops/docs: `chore/<scope>‑<short‑slug>`, `docs/<topic>`
- One branch = one focused change (respect “only make changes that are requested or clearly related”).

## Commit style (Conventional Commits)

- `feat(auth): google sign-in with Supabase`
- `fix(paywall): handle canceled stripe session`
- `chore(ci): add playwright to build matrix`
- Keep commits small, logical, and _buildable_.

## Daily sync habits (avoid drift)

1. `git checkout main`
2. `git pull --rebase origin main` ← keeps history linear
3. `git checkout -b feat/<scope>‑<slug>` (or `git switch -c ...`)
4. Work in small commits. Push early: `git push -u origin <branch>`
5. Rebase often to stay current:
   - `git fetch origin`
   - `git rebase origin/main`
   - Resolve conflicts, run tests, force‑push **your branch** only: `git push --force-with-lease`

6. Open PR as draft early; convert to “Ready for review” when CI is green.

**Never** push directly to `main`. Enable GitHub branch protection + required checks.

---

# Pull requests (quality gate)

## PR requirements

- Passing checks: **typecheck, lint, unit/integration tests, e2e (smoke), build**.
- Scope is tight; no unrequested refactors.
- PR template filled: problem, approach, screenshots/preview URL, test plan, risk.
- Linked issue (if applicable). Labels: `feat`, `fix`, `chore`, `breaking`.
- Reviewer ownership via **CODEOWNERS** (e.g., `packages/ui/* @you`).

## Review checklist

- Simplicity (prefer the simplest working solution).
- No code duplication (reuse existing utils/components).
- Env‑aware (dev/staging/prod behavior considered).
- No new tech/patterns for fixes unless truly necessary; if introduced, **remove** the old implementation in the same PR (no duplicate logic).
- Files ≤ 200–300 LOC; suggest refactor if larger.
- Security notes addressed (see per‑phase checklists below).

---

# CI/CD (GitHub Actions + Vercel)

## CI pipeline (per PR)

1. **Install & cache** (PNPM/Yarn)
2. **Typecheck** (`tsc --noEmit`)
3. **Lint** (ESLint) + **Format check** (Prettier)
4. **Unit/Integration tests** (Vitest/Jest)
5. **E2E smoke** (Playwright on the Vercel Preview URL)
6. **Build** (Next.js)
7. **Bundle/size** report (optional)

## CD

- **PR merge → Staging** deploy (auto). Run migration job (see below), then e2e.
- **Promote to Prod** via GitHub “Release” or tag (`vX.Y.Z`), or auto on merge to `main`.

**Rollback:** use Vercel “Promote previous deployment”. DB rollbacks follow your migration plan (never ad‑hoc SQL in prod).

---

# Environment variables & secrets

- **Never** commit secrets. Use Vercel envs (`Development`, `Preview`, `Production`).
- Maintain a **`.env.example`** (no secrets) to document required vars.
- Local dev pulls from Vercel: `vercel env pull --environment=development .env.local`
- **Do not overwrite** your `.env.local` without explicit confirmation (your rule).
- Separate keys per env: `STRIPE_SECRET_KEY`, `SANITY_TOKEN`, `NEXT_PUBLIC_POSTHOG_KEY`, etc.
- Client‑exposed vars prefixed with `NEXT_PUBLIC_` only when necessary.

---

# When to use Docker

**Default:** run natively (faster Next.js reloads).
**Use Docker** when:

- Teammates need identical environments.
- Reproducing CI issues locally.
- Running **local Supabase** (Postgres + Studio + Auth) for offline work.
- End‑to‑end smoke with services (wiremock for webhooks, etc.).

Keep a **`docker-compose.dev.yml`** (opt‑in) for `web` + `supabase`. Don’t force Docker for everyone.

---

# Database & migrations (Supabase/Postgres)

- Use Supabase **migrations** (`supabase db diff`, `db push`) and commit SQL migration files.
- **Never** hot‑patch prod via console. Every schema change is a migration reviewed in PR.
- RLS: **deny‑by‑default**; add policies for specific roles.
- Data backfills are **idempotent** scripts in `scripts/` with clear dry‑run flags; remove once executed (avoid one‑off scripts living forever).

**Promotion order:** dev → staging → prod.
Run migrations **before** starting the new app version (or use backward‑compatible change first → deploy → forward migration).

---

# Testing strategy (keep it lean)

- **Unit** (fast): pure functions, small hooks, utils.
- **Integration**: API route handlers with mocked service clients (Stripe, Mux, MailerLite, Sanity).
- **E2E (smoke)**: Playwright on preview/staging: auth → view free post → hit paywall → checkout (Stripe test mode) → access members post → sign out.
- **A11y**: axe on Storybook + key flows.
- **Performance**: Lighthouse CI on preview; budget regressions fail the PR.

Mock **only** in tests. Never ship stub/fake data paths that touch dev or prod.

---

# Code organization & design system hygiene

- **packages/ui** (design system): tokens (CSS vars), Tailwind config, primitives (Radix‑based), patterns (FormRow, PaywallCTA), layouts. Tree‑shakeable exports; minimal `"use client"`.
- **apps/web**: pages/routes, feature modules (`/features/paywall`, `/features/auth`), server utilities (`/server/*`), API routes.
- Keep files under \~300 LOC; refactor to smaller components/hooks when needed.
- Avoid duplication: search the repo before adding a util/pattern.
- Delete dead code promptly (no commented blocks).
- No once‑off scripts in repo root—put in `scripts/` with README and remove after run.

---

# Security & optimization checklists (phase gates)

## Phase 0 — Setup

**Security**

- Vercel envs configured; no secrets in repo.
- Supabase RLS set to deny‑all default.
- HTTPS everywhere (default Vercel).
  **Optimization**
- Tailwind purge active; build passes; preview deploy under 2s TTFB on small page.

## Phase 1 — Auth & Core DB

**Security**

- Providers: Email + Google (+ Facebook) enabled with correct OAuth callbacks.
- Email confirmation required.
- JWT expiry ≤ 1h; refresh in place.
- RLS for `profiles`, `entitlements`, `subscriptions`: user can only read/write their rows.
  **Optimization**
- Server‑side session helper (avoid heavy client session polling).
- Minimal auth bundle on client (no unnecessary providers/scripts).

## Phase 2 — Sanity

**Security**

- Server‑side Sanity token only; no client leaks.
- Webhook signature verification; drafts never leak without preview token.
  **Optimization**
- ISR / `revalidateTag` in place.
- `next/image` + Sanity image transforms; responsive sizes.

## Phase 3 — Mux

**Security**

- Mux API keys server‑only; webhook signatures verified.
- Signed playback (or token gated) for members‑only; IDs never exposed unauth’d.
  **Optimization**
- Lazy‑load `<mux-player>`; poster images; fall back to native `<video>` when needed.

## Phase 4 — Stripe

**Security**

- Raw body parsing for webhook verify; replay protection considered.
- Entitlements granted/revoked **only** from webhook (not the client).
- Customer Portal linked; test downgrade/upgrade/cancel flows.
  **Optimization**
- Cache Stripe products/prices (reduce API calls).
- Optimistic entitlement UI with server reconciliation.

## Phase 5 — Email & Marketing

**Security**

- Resend used only for transactional; MailerLite consent respected.
- Webhook signatures verified; no PII logged.
  **Optimization**
- Batch/queue MailerLite updates where possible; template emails (no heavy inline HTML).

## Phase 6 — Analytics & Consent

**Security**

- No PII in analytics events; respect DNT + consent state.
  **Optimization**
- EU residency in PostHog; replay sampling ≤10%.

## Phase 7 — Design System

**Security**

- Dependencies audited (npm audit/GitHub Dependabot).
- All interactive components pass a11y checks.
  **Optimization**
- Components are RSC‑friendly by default, client only where needed; zero unused styles.

---

# GitHub best practices (operationalized)

- **Branch protection:** required PR reviews (≥1), required status checks (typecheck, lint, tests, build), linear history, no force pushes to `main`.
- **CODEOWNERS:** route sensitive files to you (billing, auth, infra).
- **PR Template:** include “Security notes” and “Env changes” sections (call out any new ENV VARS).
- **Issue templates:** bug, feature, chore; link to acceptance criteria & phase gate.
- **Projects/Boards:** Kanban with columns: Backlog → In Progress → In Review → In Staging → Done.
- **Automation:** auto‑label PRs based on branch prefix; auto‑close issues on merge with “Fixes #123”.
- **Releases:** Changesets (or GitHub Releases) to version/tag; changelog includes migration steps.

---

# Day‑to‑day commands (muscle memory)

```bash
# start work
git checkout main
git pull --rebase origin main
git switch -c feat/paywall-cta

# code...
git add -A
git commit -m "feat(paywall): add CTA and pricing link"
git push -u origin feat/paywall-cta

# keep in sync
git fetch origin
git rebase origin/main
# fix conflicts, run tests
git push --force-with-lease

# open PR → wait for green checks → request review → merge (squash or rebase)
```

---

# Observability & ops

- **Errors:** Sentry (or Vercel Monitoring) on server routes + client; alert on 5xx spikes.
- **Logs:** structured logs in API handlers; no secrets or PII.
- **Metrics:** PostHog dashboards for signup → checkout → first play funnel.
- **Runbooks:** short docs for “Stripe webhook down,” “Sanity publish broken,” “Mux playback errors.”

---

# Final reminders (from your rules)

- Prefer **simple solutions**; avoid unnecessary abstraction.
- **No duplication**—reuse before writing new.
- **Env‑aware** code paths (dev/test/prod).
- Only change what’s requested or clearly related.
- For **fixes**, don’t introduce new tech unless you’ve exhausted the current approach; if you must, **remove** the old implementation in the same PR.
- Keep files **≤ 200–300 LOC**; refactor when crossing that threshold.
- **Mock data only in tests**; never in dev or prod.
- Never add stubs/fakes affecting dev or prod.
- **Never overwrite** your `.env.local` without you explicitly agreeing.
