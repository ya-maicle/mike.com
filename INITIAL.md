## FEATURE:

Build mikeiu.com — a secure, scalable Next.js web app with:

- CMS-driven content (Sanity) for marketing pages, posts, and video posts
- Auth and core data (Supabase) with strict RLS and least privilege
- Secure video hosting/streaming (Mux) with signed playback and teaser gating
- Payments and subscriptions (Stripe) with automated entitlement management
- Transactional email (Resend) and marketing automation (MailerLite)
- Product analytics and feature flags (PostHog) with consent management
- Design system and Storybook for consistent, accessible UI
- Vercel-based CI/CD with staging promote-to-production model

Core user journeys

- Anonymous user: visits marketing pages → reads free content → views teaser for gated video → sees Pricing → signs up
- Authenticated user (no subscription): can browse, update profile, initiate checkout, manage email consent
- Subscriber: access to members-only posts/videos → billing portal for subscription management
- Admin/editor (via Sanity): manages content and triggers ISR revalidation via webhook
- System: webhooks grant/revoke entitlements based on Stripe events; Mux webhooks persist asset state; MailerLite syncs consent

Tech stack (high level)

- Frontend: Next.js (App Router, RSC), Tailwind tokens, Radix UI + shadcn/ui patterns, Framer Motion (sparingly), lucide-react, PortableText rendering for Sanity
- Backend: Supabase (Postgres + Auth + RLS), Sanity (hosted), Stripe (Checkout + Billing Portal), Mux (Direct Uploads + signed playback), Resend, MailerLite, PostHog (client + server)
- Hosting/infra: Vercel (edge/serverless, ISR), GitHub Actions CI/CD

Phased development (summary)

- Phase 0: Project setup & infra (completed per build log; see “What’s already done” below)
- Phase 1: Auth + core DB schema (profiles, entitlements, subscriptions) with RLS and secure server helpers
- Phase 2: Sanity content integration (schemas, GROQ, webhooks, ISR, preview mode)
- Phase 3: Mux video (direct uploads, webhooks, signed playback, paywall integration)
- Phase 4: Payments & entitlements (Stripe Checkout, webhooks, billing portal, pricing page)
- Phase 5: Email & marketing (Resend templates, MailerLite consent sync + webhooks)
- Phase 6: Analytics & consent (PostHog, event map, cookie consent, replay sampling)
- Phase 7: Design system completion (tokens, primitives, patterns, Storybook, a11y, docs)

Success criteria (per phase)

- Tasks closed, security/optimization requirements pass, CI builds green, staging smoke test passes, merged to main

Environments and governance (single source of truth)

- Local (dev): .env.local via vercel env pull; optional Supabase local via Docker
- Preview (PR): Vercel preview URL + ephemeral Sanity preview if needed
- Staging: mirrors prod config but test/sandbox keys and staging datasets
- Production: protected main branch → promote from staging
- Trunk-based, short-lived branches; Conventional Commits; required PR checks

What’s already done (Phase 0 highlights from docs/logs/phase-0-log.md)

- Repo/monorepo: Initialized Git, trunk/main branch; created apps/web, packages/ui, packages/config; root tooling (TypeScript, ESLint, Prettier, EditorConfig)
- Next.js app: apps/web scaffolded (TypeScript, Tailwind, App Router, alias @/\*), API health route added
- Design system: packages/ui scaffolded with tokens.css; Storybook configured and builds; placeholder Button + stories
- Shared config: @maicle/config for ESLint/TS; web and ui extend base configs
- CI (PR): GitHub Actions workflow for typecheck, lint, build, Storybook build; resolved ESLint and lockfile issues; standardized on eslint v9
- Governance: CODEOWNERS, PR/issue templates in place; branch protections to be toggled in GitHub UI
- Vercel: Project created and linked to repo; main deployed; domains mikeiu.com and staging.mikeiu.com configured
- Supabase: Remote projects created (staging/prod); Vercel envs seeded; vercel env pull configured; local Supabase CLI linked; local stack starts; env docs and scripts added

Next key steps (from Phase 0 log)

- 0.18 Sanity project/datasets and env wiring
- 0.19 Vendor env placeholders (Stripe, Mux, Resend, MailerLite, PostHog, Sentry)
- 0.20 Main CI pipeline: staging deploy + promote gate + migrations
- 0.21 Vitest/RTL; 0.22 Playwright smoke
- 0.24 Changesets for packages/ui
- 0.25 Optional containerization
- 0.26 Domain model checks and docs
- 0.27 Security/performance baseline wrap-up

## EXAMPLES:

[Provide and explain examples that you have in the `examples/` folder]

- Current status: claude/examples/ is a placeholder (contains .gitkeep) and has no runnable examples yet.
- Planned examples to add under examples/ aligned with PRD phases:
  - examples/supabase-auth/:
    - Server-side getSessionUser helper usage with RSC route handlers
    - RLS policy tests and negative cases
  - examples/sanity-groq-and-isr/:
    - GROQ query patterns for post, videoPost, page
    - ISR with revalidateTag per document type
    - PortableText to design system typography mapping
  - examples/mux-direct-upload-and-webhooks/:
    - /api/mux/create-direct-upload route returning signed URL
    - Handling video.asset.ready webhook and persisting mux_asset_id in Supabase
    - mux-player setup with signed playback, teaser gating for non-members
  - examples/stripe-checkout-and-entitlements/:
    - /api/checkout (server-validated plan IDs)
    - /api/stripe/webhook verifying raw body and granting/revoking entitlements on events
    - /api/billing/portal for customer billing management
  - examples/resend-and-mailerlite/:
    - Transactional email templates (welcome, receipt, magic link) with Resend
    - MailerLite consent capture + unsubscribe webhook sync
  - examples/posthog-and-consent/:
    - Cookie consent banner gating analytics
    - Client/server event capture (signup_completed, checkout_started/succeeded, video_played)
    - EU residency config and replay sampling
- In-repo references you can use today (outside examples/):
  - apps/web/src/app/api/health/route.ts: example of a typed API route and healthcheck
  - packages/ui/src/components/Button.tsx and Button.stories.tsx: minimal component + Storybook story
  - packages/ui/styles/tokens.css: design tokens CSS variables and Tailwind mapping
  - apps/web/src/app/layout.tsx and page.tsx: baseline Next.js App Router structure
- Note: When examples are added, include README.md per example with:
  - Prereqs and env vars
  - Setup and how to run tests (unit/e2e)
  - Security gotchas (e.g., raw body for Stripe/Mux webhooks, server-only tokens)

## DOCUMENTATION:

[List out any documentation (web pages, sources for an MCP server like Crawl4AI RAG, etc.) that will need to be referenced during development]
Internal project docs

- Product Requirements Document (authoritative scope/criteria)
  - docs/product_requirements_document.md
- Phase 0 build log (source of truth for what’s done and what’s next)
  - docs/logs/phase-0-log.md
- ENVIRONMENT.md and .env.example (required variables per env)
  - ENVIRONMENT.md
  - .env.example
- Repo structure and local dev instructions
  - README.md
- Supabase local workflow
  - supabase/README.md

Vendor/platform docs

- Next.js App Router
  - https://nextjs.org/docs/app
- Tailwind CSS / design tokens
  - https://tailwindcss.com/docs/theme
- Radix UI primitives
  - https://www.radix-ui.com/primitives
- shadcn/ui patterns
  - https://ui.shadcn.com
- Framer Motion
  - https://www.framer.com/motion/
- Sanity + next-sanity + PortableText
  - https://www.sanity.io/docs
  - https://github.com/sanity-io/next-sanity
  - https://github.com/portabletext/react-portabletext
- Supabase (Auth, RLS, CLI, Migrations)
  - https://supabase.com/docs
- Stripe (Checkout, Billing Portal, Webhooks)
  - https://stripe.com/docs/payments/checkout
  - https://stripe.com/docs/billing/subscriptions/integrating-customer-portal
  - https://stripe.com/docs/webhooks/signatures
- Mux (Direct Uploads, Webhooks, Signed Playback)
  - https://docs.mux.com/guides/video/upload-files-directly
  - https://docs.mux.com/guides/video/secure-video-playback
  - https://docs.mux.com/guides/video/receive-webhooks-from-mux
- Resend (Transactional Email)
  - https://resend.com/docs
- MailerLite (API + Webhooks)
  - https://developers.mailerlite.com/docs/
- PostHog (Analytics, Feature Flags, EU Residency)
  - https://posthog.com/docs
- Vercel (Environments, ISR, Promote)
  - https://vercel.com/docs

Tooling/testing docs

- Storybook (a11y, docs)
  - https://storybook.js.org/docs
- Vitest + React Testing Library
  - https://vitest.dev/
  - https://testing-library.com/docs/react-testing-library/intro/
- Playwright (component/e2e)
  - https://playwright.dev/
- ESLint v9 / Prettier / TypeScript
  - https://eslint.org/docs/latest/
  - https://prettier.io/docs/en/
  - https://www.typescriptlang.org/docs/
- GitHub Actions
  - https://docs.github.com/en/actions

## OTHER CONSIDERATIONS:

[Any other considerations or specific requirements - great place to include gotchas that you see AI coding assistants miss with your projects a lot]
Security and secrets

- Never commit secrets; use Vercel envs across Development/Preview/Staging/Production
- Do not overwrite .env.local; pull via vercel env pull
- Separate keys per environment; never mix test/live credentials
- Supabase RLS: deny-by-default; write explicit policies and test negative paths
- Webhooks: verify signatures (Stripe raw body, Mux, Sanity, MailerLite); guard replay attacks
- Sanity: server-only token; no draft content leaks on public pages; preview mode indicators

Auth and data

- Use server-side session helpers (getSessionUser) to avoid heavy client polling
- JWT expiry ≤ 1h; refresh flow implemented
- Prevent open redirects (whitelist returnTo)
- Profiles/entitlements/subscriptions tables are the single source of truth for access

Payments and entitlements

- Grant/revoke entitlements only in webhook handlers, not client-side
- Validate plan/price IDs on the server; never trust client inputs
- Provide clear recurring billing disclosures and post-checkout states
- Stripe Customer Portal link under Account → Billing (no custom PII handled)

Video security and performance

- Never expose raw playback IDs to unauthenticated users
- Generate short-lived signed playback URLs for members-only content
- Lazy-load mux-player; use poster images; support native video fallback
- Capture play/pause/ended analytics events (consent-aware)

Content and ISR

- Use ISR with revalidateTag per Sanity document type
- Map PortableText to design system typography and media rules
- Provide sizes for next/image; eager only hero; otherwise lazy; avoid CLS

Analytics and consent

- Gate analytics on cookie consent; respect DNT
- EU data residency for PostHog; replay sampling ≤ 10%
- Exclude billing/auth pages from session replays
- Use PostHog feature flags as kill-switches

Design system and performance budgets

- Keep components tree-shakeable; minimal "use client"
- Tokens (colors, spacing, radii, typography) are the single source of truth
- Budgets: First-load JS < 180KB (marketing), < 250KB (app shell); LCP < 2.5s; CLS < 0.1
- All interactive components must pass a11y (axe) and keyboard navigation checks

CI/CD and releases

- Trunk-based, short-lived branches; Conventional Commits
- Required PR checks: typecheck, lint, tests, build, Storybook
- Main pipeline: apply staging migrations, deploy to staging, run smoke, manual approve, promote to production
- Rollback: Vercel promote previous deployment; DB rollbacks via forward migration

Testing

- Unit: utilities, reducers, guards
- Component: Storybook + axe
- E2E smoke: health, homepage render, later auth/checkout/gated content on staging
- Performance: Lighthouse CI; optionally K6 on staging critical routes
- Security: RLS tests, OAuth callback SSRF/redirect tests, webhook signature tests

Local dev

- Default dev is native (pnpm dev); Docker optional (web + supabase) for parity and offline
- Scripts for local Supabase (db:start/stop/reset/diff) and linking remote projects
- Stripe CLI for local webhook forwarding; ngrok if needed for Sanity/Mux

Common pitfalls to avoid (AI assistant guardrails)

- Do not send server tokens to the client (Sanity, Supabase service role, Stripe/Mux secrets)
- Do not implement entitlement changes in the client or UI handlers
- Do not render Sanity draft content on public pages; only in preview mode
- Do not forget raw body middleware for Stripe webhook verification
- Do not preload restricted media; ensure entitlement guard checks run server-side first
- Do not add mock/stub data paths that can leak to dev/prod; mocks only in tests
- Keep files under ~300 LOC; refactor into smaller components/hooks as needed
- Avoid introducing new tech/patterns for fixes unless necessary; if introduced, remove the old implementation in the same PR
