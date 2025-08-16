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

- `pnpm i`
- `pnpm db:start` (runs local Supabase in Docker)
- `pnpm dev`

See `supabase/README.md` for detailed instructions on setting up the Supabase CLI, linking to remote projects, and managing database migrations.

## Git & CI

- Trunk-based with feature branches (feat/_, fix/_).
- PRs run typecheck/lint/tests/build; preview deploys via Vercel.
- main deploys to staging; manual promotion to production.

See PRD for detailed environments and pipelines.

## 🚀 Deployment & Operations

### Domain Model

- **staging.mikeiu.com**: Automatically deploys latest `main` branch
- **mikeiu.com**: Manual promotion from staging required

### Main Pipeline

Push to `main` triggers:

1. Quality checks (typecheck, lint, build)
2. Deploy to staging with database migrations
3. Run smoke tests against staging
4. Manual approval gate for production
5. Promote same build to production

### Quick Commands

```bash
# Local development
pnpm dev                    # Start development server
pnpm build                  # Build all packages
pnpm typecheck              # Run TypeScript checks
pnpm lint                   # Run ESLint

# Database operations
pnpm db:start              # Start local Supabase
pnpm db:stop               # Stop local Supabase
pnpm db:reset              # Reset local database

# Testing (placeholders)
pnpm e2e:smoke             # Run smoke tests locally
pnpm e2e:smoke:ci          # Run smoke tests in CI

# Health checks and verification
./scripts/health-check.sh   # Quick health check (both domains)
./scripts/verify-domains.sh # Comprehensive domain verification
```

### Post-Deploy Health Checks

After any deployment, verify service health:

```bash
# Quick health check
./scripts/health-check.sh

# Manual verification
curl https://mikeiu.com/api/health
curl https://staging.mikeiu.com/api/health

# Expected response:
# {"status":"ok","service":"web","timestamp":"2025-08-16T11:38:43.571Z"}
```

### Emergency Rollback

If production issues are detected:

1. Go to [Vercel dashboard](https://vercel.com/mikeiu-com/mike-com-web) → Deployments
2. Find last stable deployment (marked "Production")
3. Click "Promote to Production"
4. Verify with `./scripts/health-check.sh`

For detailed procedures, see [docs/operations/deployment-rollback.md](docs/operations/deployment-rollback.md)

### Manual Operations

- **Trigger deployment**: Push to `main` or use GitHub Actions UI
- **Approve production**: Review and approve in GitHub Actions workflow
- **Health monitoring**: Use automated scripts for regular verification
- **Domain verification**: Run domain checks after DNS or configuration changes

### Operational Documentation

- [Health Checks](docs/operations/health-checks.md) - Health monitoring procedures
- [Deployment Rollback](docs/operations/deployment-rollback.md) - Emergency rollback procedures
- [Domain Verification](docs/operations/domain-verification.md) - DNS and SSL verification
- [Deployment Pipeline](docs/operations/deployment-pipeline.md) - Complete pipeline documentation
- [Phase 0 Log](docs/logs/phase-0-log.md) - Infrastructure setup history
- [PRD](docs/product_requirements_document.md) - Complete product requirements
