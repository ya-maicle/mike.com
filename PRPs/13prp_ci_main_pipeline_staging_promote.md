name: "CI Main Pipeline with Staging Deploy and Promote Gate - Phase 0.20"
description: |

## Purpose

Implement the complete main branch CI/CD pipeline that automatically deploys to staging, runs comprehensive validation including database migrations and smoke tests, then requires manual approval before promoting the same build to production.

## Core Principles

1. **Safe deployment pipeline**: Staging validation before production promotion
2. **Database migration safety**: Non-destructive migrations applied to staging first
3. **Build once, deploy twice**: Same artifacts promoted from staging to production
4. **Manual promotion gate**: Human approval required for production deployment
5. **Complete automation**: End-to-end pipeline from commit to production-ready

---

## Goal

Create a robust main branch pipeline that automatically deploys to staging with database migrations, runs smoke tests, then waits for manual approval before promoting the identical build to production, ensuring safe and reliable deployments.

## Why

- **Deployment safety**: Staging validation catches issues before production
- **Database integrity**: Migrations tested in staging environment first
- **Build consistency**: Same artifacts deployed to both environments
- **Risk mitigation**: Manual gate prevents automatic broken deployments
- **Operational confidence**: Complete CI/CD enables rapid, safe releases

## What

- Create .github/workflows/main.yml triggered on push to main branch
- Install dependencies and run quality checks (typecheck, lint, build)
- Apply Supabase migrations to staging environment only
- Deploy to Vercel and alias to staging.mikeiu.com
- Run end-to-end smoke tests against staging
- Configure manual approval gate using GitHub environments
- Promote same build to production (mikeiu.com) after approval
- Ensure Vercel GitHub integration provides preview links on PRs

### Success Criteria

- [ ] main.yml workflow triggers on push to main branch
- [ ] Quality checks (typecheck, lint, build) pass before deployment
- [ ] Supabase migrations applied to staging environment automatically
- [ ] Vercel deployment successful and aliased to staging.mikeiu.com
- [ ] Smoke tests run against staging environment and pass
- [ ] Manual approval gate configured using GitHub environments
- [ ] Production promotion deploys same build without rebuilding
- [ ] Vercel GitHub integration active for PR preview links
- [ ] Complete pipeline runs in under 10 minutes for typical changes
- [ ] Failed migrations or smoke tests block production promotion

## All Needed Context

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- file: .github/workflows/pr.yml
  why: Existing PR workflow patterns to maintain consistency

- file: package.json
  why: Root scripts and monorepo commands for pipeline steps

- url: https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment
  why: GitHub environments for manual approval gates

- url: https://vercel.com/docs/cli
  why: Vercel CLI commands for deployment and aliasing

- url: https://supabase.com/docs/reference/cli
  why: Supabase CLI for migration application and project management

- file: supabase/README.md
  why: Current Supabase setup and migration procedures

- file: .env.example
  why: Environment variables needed for staging and production

- file: docs/logs/phase-0-log.md
  why: Sections 0.21-0.22 for smoke test integration requirements

- url: https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions
  why: GitHub Actions workflow syntax and job dependencies

- docfile: PRPs/07prp_playwright_smoke_staging.md
  why: Smoke test implementation to integrate into pipeline
```

### Current Codebase tree

```bash
mikeiu.com/
├── .github/
│   └── workflows/
│       └── pr.yml                    # REFERENCE: Existing CI patterns
├── apps/
│   └── web/
│       ├── package.json              # Build and test scripts
│       └── src/                      # Next.js application
├── supabase/
│   ├── config.toml                   # Supabase configuration
│   ├── migrations/                   # Database migration files
│   └── README.md                     # Migration procedures
├── package.json                      # Root monorepo scripts
└── .env.example                      # Environment variable template
```

### Desired Codebase tree with files to be added

```bash
mikeiu.com/
├── .github/
│   ├── environments/
│   │   └── production.yml            # CREATE: Production environment config
│   └── workflows/
│       ├── pr.yml                    # EXISTING: PR workflow
│       └── main.yml                  # CREATE: Main pipeline workflow
├── scripts/
│   ├── deploy-staging.sh             # CREATE: Staging deployment script
│   ├── promote-production.sh         # CREATE: Production promotion script
│   └── apply-migrations.sh           # CREATE: Migration application script
└── docs/
    └── operations/
        └── deployment-pipeline.md    # CREATE: Pipeline documentation
```

### Known Gotchas of our codebase & CI/CD Pipeline Quirks

```bash
# CRITICAL: Supabase migration safety
# Migrations must be non-destructive and tested in staging first
# Use --dry-run flag to validate before applying
# Store SUPABASE_ACCESS_TOKEN and project refs as GitHub secrets

# CRITICAL: Vercel deployment and aliasing
# Deploy to Vercel first, then alias to staging domain
# Use --prod flag for production promotion
# Ensure same build artifacts used for both environments

# GOTCHA: GitHub environment protection
# Production environment requires manual approval
# Reviewers must be configured for approval gate
# Failed staging tests should block approval availability

# GOTCHA: Job dependencies and artifact sharing
# Use needs: to control job execution order
# Share build artifacts between jobs to avoid rebuilding
# Environment variables must be available across jobs

# PATTERN: Pipeline failure handling
# Any failure in staging deployment blocks production
# Migration failures require manual intervention
# Smoke test failures indicate deployment issues

# PATTERN: Vercel GitHub integration
# Must be configured in Vercel dashboard
# Preview deployments appear on PRs automatically
# Production deployments update domain alias
```

## Implementation Blueprint

### Data models and structure

```yaml
# Pipeline Structure
PIPELINE_STAGES:
  1. quality_checks:
    - Install dependencies
    - Typecheck and lint
    - Build applications

  2. staging_deployment:
    - Apply Supabase migrations to staging
    - Deploy to Vercel
    - Alias to staging.mikeiu.com

  3. staging_validation:
    - Run smoke tests against staging
    - Validate deployment health

  4. production_gate:
    - Manual approval required
    - GitHub environment protection

  5. production_promotion:
    - Promote same build to production
    - Update mikeiu.com alias

# Environment Configuration
ENVIRONMENTS:
  staging:
    domain: 'staging.mikeiu.com'
    supabase_project: '${{ secrets.SUPABASE_STAGING_PROJECT_REF }}'
    auto_deploy: true

  production:
    domain: 'mikeiu.com'
    supabase_project: '${{ secrets.SUPABASE_PROD_PROJECT_REF }}'
    auto_deploy: false
    approval_required: true

# Secret Management
GITHUB_SECRETS:
  - VERCEL_TOKEN
  - VERCEL_ORG_ID
  - VERCEL_PROJECT_ID
  - SUPABASE_ACCESS_TOKEN
  - SUPABASE_STAGING_PROJECT_REF
  - SUPABASE_PROD_PROJECT_REF
```

### List of tasks to be completed in order

```yaml
Task 1 - Create GitHub Environment Configuration:
  CREATE .github/environments/production.yml:
    - CONFIGURE manual approval requirement
    - SET protection rules for production deployment
    - SPECIFY required reviewers for approval gate

Task 2 - Create Main Pipeline Workflow:
  CREATE .github/workflows/main.yml:
    - CONFIGURE trigger on push to main branch
    - ADD dependency installation and caching
    - INCLUDE quality checks (typecheck, lint, build)
    - SET up job dependencies and artifact sharing

Task 3 - Add Staging Deployment Job:
  MODIFY main.yml:
    - ADD Supabase migration application to staging
    - INCLUDE Vercel deployment to staging
    - CONFIGURE staging domain aliasing
    - ADD error handling for deployment failures

Task 4 - Add Staging Validation Job:
  MODIFY main.yml:
    - INTEGRATE smoke tests against staging environment
    - ADD health check validation
    - CONFIGURE test result reporting
    - BLOCK production on validation failures

Task 5 - Add Production Promotion Job:
  MODIFY main.yml:
    - CONFIGURE manual approval gate using environments
    - ADD production promotion without rebuilding
    - INCLUDE production domain aliasing
    - ADD post-deployment validation

Task 6 - Create Deployment Scripts:
  CREATE scripts/apply-migrations.sh:
    - IMPLEMENT safe migration application
    - ADD dry-run validation
    - INCLUDE error handling and rollback procedures

  CREATE scripts/deploy-staging.sh:
    - IMPLEMENT staging deployment automation
    - ADD domain aliasing logic

  CREATE scripts/promote-production.sh:
    - IMPLEMENT production promotion
    - ADD post-deployment checks

Task 7 - Configure Vercel Integration:
  VERIFY Vercel GitHub integration:
    - ENSURE preview deployments on PRs
    - CONFIRM automatic deployment triggers
    - VALIDATE domain management permissions

Task 8 - Add Pipeline Documentation:
  CREATE docs/operations/deployment-pipeline.md:
    - DOCUMENT complete pipeline flow
    - INCLUDE troubleshooting procedures
    - SPECIFY manual intervention steps
```

### Per task pseudocode

```yaml
# Task 2: Main Pipeline Workflow
# File: .github/workflows/main.yml
name: Main Pipeline

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  quality-checks:
    name: "Quality Checks"
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm build
      - uses: actions/upload-artifact@v4
        with:
          name: build-artifacts
          path: |
            apps/web/.next
            packages/ui/storybook-static

  staging-deployment:
    name: "Deploy to Staging"
    runs-on: ubuntu-latest
    needs: quality-checks
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: build-artifacts

      - name: Apply Supabase migrations to staging
        run: |
          echo "${{ secrets.SUPABASE_ACCESS_TOKEN }}" | supabase auth login --token
          supabase link --project-ref ${{ secrets.SUPABASE_STAGING_PROJECT_REF }}
          supabase db push --dry-run
          supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Deploy to Vercel
        run: |
          vercel --token ${{ secrets.VERCEL_TOKEN }} --prod
          vercel alias --token ${{ secrets.VERCEL_TOKEN }} staging.mikeiu.com
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

  staging-validation:
    name: "Validate Staging"
    runs-on: ubuntu-latest
    needs: staging-deployment
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm exec playwright install chromium
      - name: Run smoke tests
        run: pnpm run e2e:smoke:ci
        env:
          PLAYWRIGHT_BASE_URL: https://staging.mikeiu.com

  production-promotion:
    name: "Promote to Production"
    runs-on: ubuntu-latest
    needs: staging-validation
    environment: production
    steps:
      - name: Promote to production
        run: |
          # Get latest staging deployment
          DEPLOYMENT_URL=$(vercel list --token ${{ secrets.VERCEL_TOKEN }} --limit 1 --json | jq -r '.[0].url')
          # Promote to production
          vercel promote $DEPLOYMENT_URL --token ${{ secrets.VERCEL_TOKEN }}
          # Update production alias
          vercel alias $DEPLOYMENT_URL mikeiu.com --token ${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

# Task 3: Migration Application Script
# File: scripts/apply-migrations.sh
#!/bin/bash
set -e

PROJECT_REF="$1"
DRY_RUN="${2:-false}"

if [ -z "$PROJECT_REF" ]; then
  echo "Usage: $0 <project-ref> [dry-run]"
  exit 1
fi

echo "🔗 Linking to Supabase project: $PROJECT_REF"
supabase link --project-ref "$PROJECT_REF"

if [ "$DRY_RUN" = "true" ]; then
  echo "🧪 Running migration dry-run..."
  supabase db push --dry-run
else
  echo "📊 Applying migrations..."
  supabase db push
  echo "✅ Migrations applied successfully"
fi

# Task 6: Production Promotion Script
# File: scripts/promote-production.sh
#!/bin/bash
set -e

echo "🚀 Starting production promotion..."

# Get latest staging deployment
STAGING_URL=$(vercel list --token "$VERCEL_TOKEN" --limit 1 --json | jq -r '.[0].url')

if [ -z "$STAGING_URL" ] || [ "$STAGING_URL" = "null" ]; then
  echo "❌ Could not find staging deployment"
  exit 1
fi

echo "📦 Promoting deployment: $STAGING_URL"

# Promote to production
vercel promote "$STAGING_URL" --token "$VERCEL_TOKEN"

# Update production alias
vercel alias "$STAGING_URL" mikeiu.com --token "$VERCEL_TOKEN"

echo "✅ Production promotion completed"
echo "🌐 Live at: https://mikeiu.com"

# Post-deployment health check
echo "🏥 Running post-deployment health check..."
curl -f https://mikeiu.com/api/health || (echo "❌ Health check failed" && exit 1)
echo "✅ Health check passed"
```

### Integration Points

```yaml
SUPABASE_INTEGRATION:
  - migration_application: Staging environment first
  - project_linking: Dynamic project reference handling
  - rollback_capability: Migration revert procedures

VERCEL_INTEGRATION:
  - deployment_artifacts: Build once, deploy twice pattern
  - domain_aliasing: Staging and production domain management
  - promotion_workflow: Same build promoted to production

GITHUB_INTEGRATION:
  - environment_protection: Manual approval gates
  - secret_management: Secure credential handling
  - workflow_dependencies: Job orchestration and artifact sharing

TESTING_INTEGRATION:
  - smoke_test_execution: Playwright against staging
  - health_check_validation: API endpoint verification
  - deployment_verification: Complete stack validation
```

## Validation Loop

### Level 1: Pipeline Configuration Validation

```bash
# Validate workflow syntax
npx @github/github-actions-parser .github/workflows/main.yml

# Test GitHub secrets configuration
gh secret list

# Verify environment configuration
gh api repos/:owner/:repo/environments

# Expected: Valid syntax, secrets configured, environments set up
```

### Level 2: Staging Deployment Testing

```bash
# Trigger workflow manually
gh workflow run "Main Pipeline" --ref main

# Monitor deployment progress
gh run list --workflow="Main Pipeline" --limit 1

# Verify staging deployment
curl https://staging.mikeiu.com/api/health

# Expected: Successful deployment, staging accessible
```

### Level 3: Production Promotion Validation

```bash
# Check manual approval gate
gh run view --log

# After approval, verify production
curl https://mikeiu.com/api/health

# Verify same build deployed
# Compare build IDs between staging and production

# Expected: Manual approval required, same build promoted
```

## Final validation Checklist

- [ ] main.yml workflow created and triggers on push to main
- [ ] Quality checks run before any deployment steps
- [ ] Supabase migrations applied to staging automatically
- [ ] Staging deployment successful with proper domain aliasing
- [ ] Smoke tests run against staging and block on failures
- [ ] Manual approval gate configured for production environment
- [ ] Production promotion uses same build without rebuilding
- [ ] Vercel GitHub integration active for PR previews
- [ ] Pipeline completes in reasonable time (under 10 minutes)
- [ ] Error handling prevents broken deployments reaching production
- [ ] Documentation covers complete pipeline operation
- [ ] Scripts enable manual intervention when needed

---

## Anti-Patterns to Avoid

- ❌ Don't rebuild for production - promote the same staging artifacts
- ❌ Don't skip migration validation - staging must test database changes first
- ❌ Don't allow automatic production deployment - manual gate is critical
- ❌ Don't ignore smoke test failures - they indicate real deployment issues
- ❌ Don't hardcode environment values - use secrets and configuration
- ❌ Don't skip error handling - pipeline failures must be clearly reported
- ❌ Don't bypass staging - every production deployment must validate in staging first
