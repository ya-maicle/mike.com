### 🔄 Project Awareness & Context (Monorepo: pnpm + Next.js)

- Always read:
  - `docs/product_requirements_document.md` (PRD: goals, stack, phased plan)
  - `docs/logs/phase-0-log.md` (build log: what’s done, next steps)
  - `ENVIRONMENT.md` (env vars contract, per env)
  - `README.md` (run/test/deploy flows, workspace overview)
  - `.clinerules/maicle.co.uk_instructions.md` (process conventions, CI/CD, security)

- Confirm target area before changes:
  - Apps: `apps/web` (Next.js App Router)
  - Packages: `packages/ui` (design system), `packages/config` (shared ESLint/TS config)

- Use Node LTS (≥18) and pnpm. Prefer workspace scripts. Do not introduce new tech for a fix unless necessary; if you do, remove the old implementation in the same change.

### 🧱 Code Structure & Modularity (Next.js + RSC)

- Structure:
  - `apps/web/src/app` for routes (App Router, RSC-first; minimal `"use client"`).
  - `apps/web/src/sanity` for Sanity clients/queries (server-only token usage).
  - `packages/ui` for tokens, primitives, patterns, Storybook.
  - `packages/config` for shared ESLint/TS configurations.

- Prefer simple, composable modules. Keep files ≤ 200–300 LOC (refactor once exceeding).

- Co-locate feature utilities and server actions with their route where appropriate.

- Imports:
  - Use `@/*` alias in the web app (configured via tsconfig).
  - Keep shared logic in `packages/*` to avoid duplication.

### 🧪 Testing & Reliability

- Unit/integration: Vitest + React Testing Library (+ @testing-library/jest-dom, jsdom).

- Component/visual: Storybook with a11y addon; Playwright + Percy (visual) where configured.

- E2E (smoke): Playwright hitting staging/preview URLs (auth, checkout, gated content, health).

- Minimum per module/feature:
  - 1 happy-path test
  - 1 edge case
  - 1 failure case

- Never ship stubs/fakes for dev/prod. Mock only in tests.

### ✅ Task Completion & Workflow

- Use trunk-based branches (`feat/*`, `fix/*`, `chore/*`), Conventional Commits.
- Open PR early (draft). Required checks: typecheck, lint, tests, build, Storybook, e2e smoke.
- Keep scope tight; only change what’s requested or clearly related.
- Use the PR template sections for Security notes and Env changes.

### 📎 Style & Conventions (TypeScript + ESLint 9 + Prettier)

- Language: TypeScript (strict). JSDoc/TSDoc for public APIs and non-trivial functions.

- Linting: ESLint 9 using shared config from `@maicle/config`.

- Formatting: Prettier (per repo config).

- UI: Tailwind CSS with tokens from `@maicle/ui/styles/tokens.css`; Radix UI primitives; shadcn patterns sparingly; Framer Motion only where needed.

- Forms/validation: React Hook Form + Zod (not pydantic).

- Data fetching:
  - Sanity: `next-sanity` + GROQ; server-only token; prevent draft leaks without preview.
  - Supabase: Server utilities with RLS; avoid exposing service keys to client.

- APIs: Next.js Route Handlers under `apps/web/src/app/api/*/route.ts`. Use server-side helpers. Validate input with Zod.

- Comments and docs:

  ```ts
  /**
   * Brief summary (what/why).
   * @param arg - Description (type inferred).
   * @returns Description.
   */
  export function example(arg: string) {
    // Reason: explain non-obvious decisions or constraints.
    return arg.toUpperCase()
  }
  ```

### 📚 Documentation & Explainability

- Update `README.md` and `ENVIRONMENT.md` when setup, dependencies, or steps change.
- Keep `docs/logs/phase-0-log.md` aligned with actual progress (for Phase 0 and beyond logs).
- For complex logic, add inline comments with “Reason:” to capture intent.

### 🔐 Environment & Secrets

- Envs via Vercel (Development/Preview/Production). No secrets in repo.

- Local: `vercel env pull` → `.env.local` (never overwrite without explicit confirmation).

- Client-exposed vars must be prefixed `NEXT_PUBLIC_`.

- Vendor guidelines:
  - Supabase: service keys server-only; RLS deny-by-default; test policies.
  - Sanity: server token only; verify webhooks; no draft leak without preview token.
  - Stripe: verify webhook signatures with raw body; grant/revoke entitlements only via webhook.
  - Mux: signed playback; never expose raw IDs unauth’d.
  - MailerLite: sync consent; verify signatures.
  - PostHog: consent-gated; EU residency; no PII.

### 🚀 CI/CD (GitHub Actions + Vercel)

- PR pipeline (per repo PRD):
  - Install (pnpm), typecheck (tsc --noEmit), lint (ESLint), tests (Vitest), build (Next.js), Storybook build, Playwright smoke on preview where configured.
- Main pipeline:
  - Apply Supabase migrations to staging (guarded), deploy to Vercel staging, run e2e smoke, manual approval to promote to prod (promote previous deployment to rollback).
- Keep builds green; do not merge with failing checks.

### 📦 Design System (packages/ui)

- Tokens as CSS variables; Tailwind maps to tokens.
- Component tiers: Primitives → Patterns → Layouts. Minimal `"use client"`.
- Storybook a11y checks enabled; maintain docs and examples.
- Introduce Changesets versioning for `@maicle/ui` when publishing.

### 🎥/💳/✉️/📈 Provider Integrations (Phase per PRD)

- Sanity: ISR and `revalidateTag`; PortableText → design system typography; preview mode UX.
- Mux: direct uploads, webhooks, signed playback; lazy-load player; analytics events gated by consent.
- Stripe: Checkout + Billing Portal; webhooks update entitlements; cache products/prices.
- Resend: lightweight transactional emails; templates; preview in Storybook.
- MailerLite: consent sync via webhooks; batching where possible.
- PostHog: client + server events; gate by consent; exclude sensitive routes from replays.

### 🧠 AI Behavior Rules (TS/Next.js context)

- Never assume missing context; read PRD/logs/ENVIRONMENT.md/README and confirm file paths before edits.
- Never hallucinate libraries or functions; only use the stack defined above.
- Avoid new tech/patterns for fixes unless necessary; if introduced, remove old code in the same change (no duplication).
- Do not delete or overwrite existing code unless explicitly required and within the task scope.
- Mock only in tests; never add stubs/fakes affecting dev or prod behavior.

### 🧰 Commands (reference)

- Install deps: `pnpm install`
- Dev app: `pnpm --filter apps/web dev`
- Lint/typecheck: `pnpm lint && pnpm typecheck`
- Build: `pnpm build`
- Tests: `pnpm test` (and package-level equivalents)
- Storybook (ui): `pnpm --filter @maicle/ui storybook` or `build-storybook`
- Supabase local: `pnpm db:start | db:stop | db:reset | db:diff`
