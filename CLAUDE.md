### 🔄 Project Awareness & Context (Monorepo: pnpm + Next.js)

- Always read:
  - `README.md` (run/test/deploy flows, workspace overview, auth notes)
  - `ENVIRONMENT.md` (env vars contract, per env, Mux signing runbook)
  - `AGENTS.md` (conventions and gotchas, agent-maintained)
  - `.clinerules/maicle.co.uk_instructions.md` (process conventions, CI/CD, security)

- Confirm target area before changes:
  - Apps: `apps/web` (Next.js App Router) — the entire product lives here
  - Packages: `packages/ui` (design **tokens** as CSS only), `packages/config` (shared ESLint/TS config)

- Use Node ≥20.17 and pnpm. Prefer workspace scripts. Do not introduce new tech for a fix unless necessary; if you do, remove the old implementation in the same change.

### 🧱 Code Structure & Modularity (Next.js + RSC)

- Structure:
  - `apps/web/src/app` — routes (App Router, RSC-first; minimal `"use client"`).
  - `apps/web/src/components/ui` — **the design system** (shadcn-style primitives). Every component here MUST have a `.stories.tsx` file; the web Storybook is the catalog and the owner's verification tool. Always import from `@/components/ui/*`; never recreate lookalike components.
  - `apps/web/src/sanity` — Sanity client/queries/schemas (server-only token usage).
  - `apps/web/src/lib` — pure logic and server utilities; pure modules get unit tests.
  - `packages/ui` — design tokens (CSS variables) imported by `globals.css`. No JS components live here.
  - `packages/config` — shared ESLint/TS configurations.

- Prefer simple, composable modules. Keep files ≤ 200–300 LOC (refactor once exceeding).
- Imports: use the `@/*` alias inside the web app.

### 🧪 Testing & Reliability

- Unit: Vitest (`pnpm --filter web test`, or `pnpm test` from the root). Runs in CI on every PR.
- Keep crypto/business logic in pure modules without `server-only`/`next/headers` imports so it stays unit-testable (see `portfolio-access-crypto.ts`, `mux-signing.ts`).
- E2E smoke: Playwright against the PR's Vercel preview (`tests/smoke/*`).
- Minimum per module/feature: 1 happy path, 1 edge case, 1 failure case.
- Never ship stubs/fakes for dev/prod. Mock only in tests.

### ✅ Task Completion & Workflow

- Trunk-based branches (`feat/*`, `fix/*`, `chore/*`) target the `preview` branch; Conventional Commits.
- Single CI workflow: `.github/workflows/pr.yml` (typecheck, lint, unit tests, build, web Storybook build, Playwright smoke against the Vercel preview URL).
- Deploys happen via Vercel's git integration (preview branch → staging, main → production). Supabase migrations are applied manually with `scripts/apply-migrations.sh` — there is no automated migration pipeline.
- Keep scope tight; only change what's requested or clearly related.

### 📎 Style & Conventions (TypeScript + ESLint 9 + Prettier)

- TypeScript strict. ESLint 9 flat config shared from `@maicle/config` (run via `eslint .`, not the deprecated `next lint`).
- Prettier per repo config (enforced on commit via lint-staged).
- UI: Tailwind CSS v4 with tokens from `@maicle/ui/styles/*.css`; Radix UI primitives; shadcn patterns; Framer Motion only where needed.
- Forms/validation: React Hook Form + Zod. API route inputs MUST be validated with Zod (`safeParse`, fail closed).
- Data fetching:
  - Sanity: `next-sanity` + GROQ; server-only token; `sanityFetch` (tagged ISR) for content, `sanityNoStoreFetch` for access checks.
  - Supabase: server utilities with RLS; service keys server-only.
- Comments: explain non-obvious decisions with `// Reason:`. JSDoc for public APIs.

### 🔐 Security & Access Model

- Recruiter-gated case studies protect **confidential client work**; teasers are intentionally public.
  - Access grants: HMAC-signed httpOnly cookies (`src/lib/portfolio-access.ts`), re-validated against Sanity per request. Missing `PORTFOLIO_ACCESS_SECRET` fails closed.
  - Share links: `/{slug}?k=<linkToken>` — the secret token is required; bare slugs 404.
  - Gated video: signed Mux playback via `src/lib/mux-signing.ts` (see ENVIRONMENT.md runbook). Covers/teasers stay public by design.
- Envs via Vercel. No secrets in repo. Client-exposed vars must be prefixed `NEXT_PUBLIC_`.
- Supabase: RLS deny-by-default; service keys server-only.
- Sanity: server token only; plan is to make the dataset private (see ENVIRONMENT.md).

### 🎥/💳/✉️/📈 Provider Integrations — STATUS

- **Integrated:** Sanity (CMS + embedded studio at `/studio`), Supabase (auth + Postgres), Mux (video, signed playback for gated content), Vercel Analytics/Speed Insights.
- **NOT integrated yet (planned):** Stripe, Resend, MailerLite, PostHog. The `entitlements`/`subscriptions` tables exist for future Stripe work. Note: the "Resend magic link" button is Supabase auth email, not the Resend service.
- When integrating later: Stripe webhooks update entitlements (verify signatures, raw body); Resend would slot in as Supabase custom SMTP first; PostHog must be consent-gated, EU residency.

### 🤖 Agents

- `AGENTS.md` is the agent-maintained memory file; keep it under ~60 lines.
- Ralph (autonomous loop): `scripts/ralph/`, default tool is Claude Code.

### 🧰 Commands (reference)

- Install deps: `pnpm install`
- Dev app: `pnpm dev`
- Lint/typecheck: `pnpm lint && pnpm typecheck`
- Unit tests: `pnpm test` (watch: `pnpm --filter web test:watch`)
- Build: `pnpm build`
- Storybook: `pnpm storybook:web` (build: `pnpm --filter web build-storybook`)
- E2E smoke: `pnpm e2e:smoke`
- Supabase local: `pnpm db:start | db:stop | db:reset | db:diff` (CLI v2)
- Sanity studio (CLI): `pnpm sanity:dev | sanity:build | sanity:deploy`
- Mux admin: `scripts/mux-rotate-gated-to-signed.ts` (dry-run by default), `scripts/mux-enable-static-renditions.ts`, `scripts/mux-audit-quality.ts` (read-only resolution/tier audit)
