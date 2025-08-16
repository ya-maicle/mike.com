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

### Two-Environment Model

| Environment     | Purpose                                       | Domain                                                        | Database                                        | Deployment       |
| --------------- | --------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------- | ---------------- |
| **Development** | Feature development, testing, content staging | Local: `localhost:3000`<br>Preview: `mike-com-web.vercel.app` | Local: Docker Supabase<br>Preview: mike-staging | Auto (PRs)       |
| **Production**  | Live public application                       | `mikeiu.com`                                                  | mike-prod                                       | Manual promotion |

### Environment Configuration

- **Development Environment**:
  - **Local**: Docker Supabase + development Sanity dataset
  - **Preview**: mike-staging database + development Sanity dataset
  - **Vendor Keys**: Test/sandbox mode (Stripe, Mux, etc.)

- **Production Environment**:
  - **Live**: mike-prod database + production Sanity dataset
  - **Vendor Keys**: Live production keys

### CI/CD Pipeline Status

✅ **Fully Configured**: All GitHub secrets and environment protection rules are set up

**Main Pipeline** (Push to `main` triggers):

1. **Quality Checks**: TypeScript, ESLint, tests, build
2. **Staging Deployment**:
   - Apply Supabase migrations to mike-staging
   - Deploy to Vercel with staging alias
   - Run comprehensive smoke tests
3. **Manual Approval Gate**: Production deployment requires approval
4. **Production Promotion**: Same build promoted to `mikeiu.com`

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
```

### Manual Operations

- **Trigger deployment**: Push to `main` or use GitHub Actions UI
- **Approve production**: Review and approve in GitHub Actions workflow
- **Emergency rollback**: See [docs/operations/deployment-rollback.md](docs/operations/deployment-rollback.md)

### Documentation

- 📖 [Deployment Runbook](docs/operations/deployment-runbook.md) - Complete deployment procedures and troubleshooting
- ⚙️ [GitHub Pipeline Setup](docs/operations/github-pipeline-setup.md) - CI/CD configuration guide
- 🗄️ [Database Management](supabase/README.md) - Migration workflows and database operations
- 🌍 [Environment Variables](ENVIRONMENT.md) - Complete environment configuration guide
- 📝 [Phase 0 Log](docs/logs/phase-0-log.md) - Infrastructure setup history
- 📋 [PRD](docs/product_requirements_document.md) - Complete product requirements

### Status & Health

- **Pipeline Status**: 🟢 Fully operational
- **Environments**: 2 (Development, Production)
- **Database Projects**: 2 (mike-staging, mike-prod)
- **GitHub Secrets**: ✅ 6/6 configured
- **Environment Protection**: ✅ Manual approval required for production

### Quick Health Check

```bash
# Local development
curl http://localhost:3000/api/health

# Staging (after deployment)
curl https://staging.mikeiu.com/api/health

# Production
curl https://mikeiu.com/api/health
```

Expected response: `{"status":"ok","service":"web","timestamp":"..."}`
