# maicle.co.uk — Monorepo

Personal portfolio site (mikeiu.com) with recruiter-gated case studies. Stack: Next.js (App Router) + React 19, Tailwind v4 with design tokens, Sanity CMS (embedded studio), Supabase (auth + Postgres), Mux video with signed playback for gated content, Vercel hosting.

## Structure

- `apps/web` — the Next.js app: routes, the design system (`src/components/ui`, each component has a Storybook story), Sanity schemas/queries, business logic in `src/lib`
- `packages/ui` — design tokens as CSS variables (imported by `globals.css`); no JS components
- `packages/config` — shared ESLint flat config and tsconfig base
- `tests/smoke` — Playwright smoke tests run against Vercel previews in CI
- `supabase` — database migrations (+ `supabase/rollbacks`)
- `scripts` — deploy/migration helpers and Mux admin scripts

See `ENVIRONMENT.md` for the full env-var contract and the signed-playback runbook.

## Development (local)

Prereqs: Node ≥20.17, pnpm, Git, Docker (for local Supabase).

- `pnpm i`
- `pnpm db:start` (local Supabase)
- `pnpm dev`

Quality gates (all run in CI on every PR):

```bash
pnpm typecheck   # tsc --noEmit
pnpm lint        # ESLint 9
pnpm test        # Vitest unit tests
pnpm build       # Next.js production build
pnpm storybook:web                      # component catalog (dev)
pnpm --filter web build-storybook       # CI-equivalent Storybook build
pnpm e2e:smoke   # Playwright smoke (needs PLAYWRIGHT_BASE_URL)
```

## Git & Branching Strategy

```
Feature Branches → Preview Branch → Main Branch
     ↓                   ↓              ↓
Feature Previews → Staging Deploy → Production Deploy
```

- **Default branch**: `preview` (feature branches target this)
- **Production branch**: `main` (promote by PR from `preview`)
- CI: a single workflow (`.github/workflows/pr.yml`) runs typecheck, lint, unit tests, build, Storybook build, then Playwright smoke against the PR's own Vercel preview URL. Preview→main PRs run the stricter production spec.
- Deploys happen through Vercel's git integration. Supabase migrations are applied manually (`scripts/apply-migrations.sh`); there is no automated migration pipeline.

| Environment    | Git Branch | Domain               | Deployment |
| -------------- | ---------- | -------------------- | ---------- |
| **Local**      | any        | `localhost:3000`     | Manual     |
| **Preview**    | `preview`  | `staging.mikeiu.com` | Auto       |
| **Production** | `main`     | `mikeiu.com`         | Manual PR  |

## Recruiter access (gated case studies)

Case studies with `visibility: recruiter` protect confidential client work; their teasers are intentionally public.

- **Share links**: `https://mikeiu.com/<company-slug>?k=<linkToken>`. The token is set on the Portfolio Access Profile in the studio (auto-generated for new profiles). Bare `/company` URLs 404 — slugs alone grant nothing. To revoke a shared link, change the profile's Link Token.
- **Email-domain login**: signing in with an allowed corporate email domain grants access via `/api/portfolio-access/claim` (token verified server-side).
- **Grants** are HMAC-signed httpOnly cookies, re-validated against Sanity on every request. A missing `PORTFOLIO_ACCESS_SECRET` denies all access (fails closed).
- **Video**: gated content uses signed Mux playback once signing keys are configured — see the runbook in `ENVIRONMENT.md`. Covers/teasers stay public.

## Authentication: Login & Logout (Supabase)

A single Supabase browser client using the **PKCE flow** with `autoRefreshToken`, `persistSession`, and `detectSessionInUrl` (see `apps/web/src/lib/supabase.ts`). Google OAuth and passwordless magic links are both supported; sessions sync across tabs via storage events.

- The `AuthProvider` (`apps/web/src/components/providers/auth-provider.tsx`) handles the OAuth `?code=` return, cleans up URL params, claims portfolio access after sign-in, and validates any return path against open-redirect rules (`src/lib/url-validation.ts`).
- The Google button and magic-link send live in `apps/web/src/components/login-form.tsx`.
- Logout clears the local session immediately, revokes globally in the background, and notifies other tabs.

Environment: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL` (must match the domain you're on; no trailing whitespace).

Supabase settings (per environment):

- Auth → URL Configuration: Site URL = canonical domain for that env; add every redirect domain to the allowlist (localhost, preview, prod, www variants).
- Auth → Providers → Google: Client ID/Secret; authorized redirect URI is `https://<ref>.supabase.co/auth/v1/callback`.
- Auth → Email: enable Magic Link. Note the "Resend magic link" button is Supabase's own email — the Resend service is not integrated.

Known gotchas:

- Email-client prefetch can consume one-time magic-link tokens (`otp_expired`) — resend and open directly.
- `127.0.0.1` vs `localhost` mismatches fail the redirect allowlist.
- Debug logging: `localStorage.setItem('auth-debug', '1')` then hard refresh (or set `NEXT_PUBLIC_AUTH_DEBUG=1`). Logs are prefixed `[AUTH]`.

Default profile data: on first sign-in a `profiles` row is upserted with a default avatar/name (`apps/web/src/lib/profile.ts`); RLS allows users to manage only their own row. A debug view exists at `/debug/profile` (404s in production).

## Protecting routes and sections (auth)

Use the `Protected` wrapper for signed-in-only UI:

```tsx
'use client'
import { Protected } from '@/components/protected'

export default function SomeProtectedPage() {
  return (
    <Protected
      onUnauthed="modal"
      fallback={<div className="p-6">Sign in to access this page.</div>}
    >
      <div>Your protected content here…</div>
    </Protected>
  )
}
```

Providers are wired in `apps/web/src/app/layout.tsx` (`AuthProvider` → `LoginModalProvider` → `ThemeProvider`).

## Sanity Studio

- Embedded at `/studio` in the web app; config source of truth is `apps/web/src/app/studio/sanity.config.ts` (the root `sanity.config.ts` re-exports it for CLI use: `pnpm sanity:dev|build|deploy`).
- Content fetching: `sanityFetch` (tagged ISR) for pages, `sanityNoStoreFetch` for access checks.

## Database operations

```bash
pnpm db:start | db:stop          # local Supabase
pnpm db:reset                    # reset local DB to migrations
pnpm db:diff                     # generate a migration from local changes
pnpm db:link:staging | db:link:prod
scripts/apply-migrations.sh      # push migrations to the linked project
```
