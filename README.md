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

## Git & Branching Strategy

### **Two-Environment Branching Model**

```
Feature Branches → Preview Branch → Main Branch
     ↓                   ↓              ↓
Feature Previews → Staging Deploy → Production Deploy
```

- **Default Branch**: `preview` (feature branches target this)
- **Production Branch**: `main` (requires manual promotion from preview)
- **Feature Branches**: `feat/*`, `fix/*`, `chore/*` (merge to preview)

### **Quality Gates**

- **Feature PRs**: TypeScript, ESLint, build, Storybook + PR review
- **Preview Branch**: Auto-deploy to staging after merge
- **Main Branch**: Manual approval required for production

## 🚀 Deployment & Operations

### **Environment Mapping**

| Environment    | Git Branch | Domain               | Purpose            | Deployment |
| -------------- | ---------- | -------------------- | ------------------ | ---------- |
| **Local**      | any        | `localhost:3000`     | Development        | Manual     |
| **Preview**    | `preview`  | `staging.mikeiu.com` | Staging validation | Auto       |
| **Production** | `main`     | `mikeiu.com`         | Live application   | Manual     |

### **Developer Workflow**

1. **Create Feature Branch**: `git checkout -b feat/my-feature`
2. **Target Preview**: Feature branches automatically target `preview` branch
3. **Feature Preview**: Get dynamic preview URLs for testing changes
4. **Merge to Preview**: PR review required, triggers staging deployment
5. **Promote to Production**: Create PR from `preview` to `main`, requires approval

### **Pipeline Status**: ✅ **READY**

- ✅ GitHub environments configured (Preview, Production)
- ✅ Vercel projects mapped (stagining → staging, mike-com-web → production)
- ✅ Quality checks enforced at all levels
- ✅ Manual approval gates for production
- ✅ Database migration workflows operational

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

- [Deployment Pipeline](docs/operations/deployment-pipeline.md) - Complete pipeline documentation
- [Phase 0 Log](docs/logs/phase-0-log.md) - Infrastructure setup history
- [PRD](docs/product_requirements_document.md) - Complete product requirements
