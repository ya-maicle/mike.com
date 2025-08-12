# maicle.co.uk — Monorepo

Personal website and application for maicle.co.uk following the PRD stack: Next.js (App Router), Tailwind with design tokens, Supabase, Sanity, Stripe, Mux, Resend, MailerLite, PostHog, Vercel hosting.

## Structure

- apps/
  - web: Next.js app (to be scaffolded in Phase 0)
- packages/
  - ui: Design system package (scaffolded in Phase 0 with Storybook baseline)
  - config: Shared configs (eslint, tsconfig) [planned]
- docs/
  - logs/: Phase 0 build log and future logs

## Development (local)

Prereqs: Node LTS (≥18), pnpm, Git. Optional CLIs for later phases: Vercel, Supabase, Sanity, Stripe.

Bootstrap:

- pnpm i
- pnpm dev (after apps/web is created)

## Git & CI

- Trunk-based with feature branches (feat/_, fix/_).
- PRs run typecheck/lint/tests/build; preview deploys via Vercel.
- main deploys to staging; manual promotion to production.

See PRD for detailed environments and pipelines.
