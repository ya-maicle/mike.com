name: "Development Pipeline Comprehensive Review & Environment Consolidation - Phase 0.21"
description: |

## Purpose

Conduct a comprehensive review of the current development pipeline infrastructure and create a detailed execution plan to consolidate from a confusing three-environment setup to a clear two-environment deployment model (development and production) with proper CI/CD pipeline implementation.

## Core Principles

1. **Environment Clarity**: Establish clear development → production flow
2. **Database Alignment**: Consolidate to two databases matching two environments
3. **Sanity Dataset Optimization**: Utilize existing two-dataset limit effectively
4. **CI/CD Completeness**: Ensure all pipeline components are properly configured
5. **Security Compliance**: No secrets in GitHub, proper environment isolation

---

## Goal

Transform the current confusing multi-environment setup into a streamlined development pipeline with clear environment boundaries, proper database configurations, and a complete CI/CD pipeline that safely promotes code from development to production.

## Why

- **Current State Analysis**: Multiple disconnected environments causing confusion
- **Database Inconsistency**: Three databases (local Docker, mike-staging, mike-prod) with unclear usage
- **Sanity Dataset Misalignment**: Two datasets (development, production) not properly mapped
- **Incomplete CI/CD**: Main pipeline exists but lacks secrets and proper configuration
- **Security Gaps**: GitHub secrets not configured, manual deployment process unclear

## What

**Current Environment Audit Results:**

### Existing Infrastructure

- **Vercel Environments**: 2 (preview: mike-com-web.vercel.app, production: mikeiu.com)
- **Supabase Projects**: 2 (mike-staging: qijxfigergpnuqbaxtjv, mike-prod: pzgczflyltjyxwqyteuj)
- **Sanity Datasets**: 2 (development, production) in project nf3mt1vl
- **GitHub Environments**: 2 (Preview, Production) - no protection rules configured
- **Local Development**: Docker Supabase + Next.js dev server

### Current Issues Identified

1. **Environment Mapping Confusion**: Preview environment uses staging database but development dataset
2. **Missing GitHub Secrets**: No CI/CD secrets configured (VERCEL_TOKEN, SUPABASE_ACCESS_TOKEN, etc.)
3. **Database Migration Gap**: No clear migration path from local → staging → production
4. **Manual Deployment Process**: No automated deployment despite having workflows
5. **Inconsistent Naming**: "staging" database with "development" dataset creates confusion

### Success Criteria

- [ ] Clear two-environment model: Development and Production
- [ ] Database alignment: Local development → Production deployment
- [ ] Sanity dataset mapping: development for local/preview, production for live
- [ ] Complete GitHub secrets configuration for CI/CD
- [ ] Functional main pipeline with staging deployment and promotion gate
- [ ] Clear documentation of environment responsibilities and data flow
- [ ] Security compliance: all secrets in GitHub environments, none in repository

## All Needed Context

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- file: docs/product_requirements_document.md
  why: Environment strategy and deployment model requirements

- file: docs/logs/phase-0-log.md
  why: Current infrastructure setup history and configuration decisions

- file: ENVIRONMENT.md
  why: Complete environment variable mapping and current configuration

- file: .github/workflows/main.yml
  why: Existing main pipeline configuration needing secrets

- file: .github/workflows/pr.yml
  why: Working PR pipeline pattern to maintain

- file: supabase/README.md
  why: Database setup and migration procedures

- file: apps/web/src/sanity/client.ts
  why: Sanity configuration and server-side usage patterns

- docfile: PRPs/13prp_ci_main_pipeline_staging_promote.md
  why: Intended CI/CD pipeline requirements and implementation guide
```

### Current Codebase Infrastructure Review

```bash
# Environment Configuration Status
├── Vercel Project: mike-com-web (prj_wN2kD7lvIqP0BjopkvC9yd9Xl17f)
│   ├── Preview Environment: mike-com-web.vercel.app (auto-deploy from PRs)
│   └── Production Environment: mikeiu.com (manual promotion)
│
├── Supabase Projects:
│   ├── Staging: qijxfigergpnuqbaxtjv (EU region, currently mapped to preview)
│   └── Production: pzgczflyltjyxwqyteuj (EU region, mapped to production)
│
├── Sanity CMS (Project: nf3mt1vl):
│   ├── Development Dataset (used for preview/staging content)
│   └── Production Dataset (used for production content)
│
├── GitHub Repository:
│   ├── Environments: Preview, Production (no protection rules)
│   ├── Secrets: None configured (CRITICAL ISSUE)
│   └── Workflows: PR checks working, Main pipeline needs secrets
│
└── Local Development:
    ├── Supabase: Docker container (separate from remote)
    ├── Environment: .env.local with Vercel development credentials
    └── Sanity: Connected to development dataset
```

### Proposed Environment Consolidation

```bash
# Target State: Two-Environment Model
├── Development Environment:
│   ├── Local: localhost:3000 (Docker Supabase + development Sanity)
│   ├── Preview: mike-com-web.vercel.app (mike-staging DB + development Sanity)
│   └── Purpose: Feature development, testing, content staging
│
└── Production Environment:
    ├── Live: mikeiu.com (mike-prod DB + production Sanity)
    └── Purpose: Public-facing application with live data
```

### Known Issues & Required Fixes

```yaml
CRITICAL_ISSUES:
  github_secrets_missing:
    description: 'No GitHub secrets configured for CI/CD pipeline'
    impact: 'Main pipeline cannot execute deployments'
    required_secrets:
      - VERCEL_TOKEN
      - VERCEL_ORG_ID
      - VERCEL_PROJECT_ID
      - SUPABASE_ACCESS_TOKEN
      - SUPABASE_STAGING_PROJECT_REF
      - SUPABASE_PROD_PROJECT_REF

  environment_protection_missing:
    description: 'GitHub Production environment lacks protection rules'
    impact: 'No manual approval gate for production deployments'
    required_config:
      - Manual approval required
      - Deployment branch restriction to main
      - Required reviewers configuration

  database_migration_unclear:
    description: 'No clear path for applying migrations across environments'
    impact: 'Schema changes could break environments'
    required_process:
      - Local development and testing
      - Automatic staging application via CI
      - Verified production promotion

CONFIGURATION_GAPS:
  environment_variable_inconsistency:
    description: 'Preview environment uses staging DB but development dataset'
    impact: 'Confusing data sources and testing scenarios'

  local_development_isolation:
    description: 'Local Docker Supabase not connected to migration workflow'
    impact: 'Schema drift between local and remote environments'

  manual_deployment_dependency:
    description: 'Production deployments require manual Vercel operations'
    impact: 'Risk of human error and deployment inconsistency'
```

## Implementation Blueprint

### Environment Mapping Strategy

```yaml
# Finalized Two-Environment Model
DEVELOPMENT_ENVIRONMENT:
  purpose: 'Feature development, content staging, testing'
  components:
    local:
      domain: 'localhost:3000'
      database: 'Docker Supabase (local schema)'
      sanity_dataset: 'development'
      stripe_mode: 'test'

    preview:
      domain: 'mike-com-web.vercel.app'
      database: 'mike-staging (qijxfigergpnuqbaxtjv)'
      sanity_dataset: 'development'
      stripe_mode: 'test'
      deployment: 'Auto from PR branches'

PRODUCTION_ENVIRONMENT:
  purpose: 'Live public application'
  components:
    live:
      domain: 'mikeiu.com'
      database: 'mike-prod (pzgczflyltjyxwqyteuj)'
      sanity_dataset: 'production'
      stripe_mode: 'live'
      deployment: 'Manual promotion after staging validation'
```

### List of tasks to be completed in order

```yaml
Task 1 - Environment Configuration Audit and Documentation:
  REVIEW current Vercel environment variables:
    - Document what's configured in Preview vs Production
    - Identify missing variables needed for complete CI/CD
    - Verify Supabase credentials mapping per environment

  UPDATE ENVIRONMENT.md:
    - Simplify to two-environment model (Development/Production)
    - Clarify database and dataset usage per environment
    - Document the development → production promotion flow

Task 2 - GitHub Secrets Configuration:
  CONFIGURE GitHub repository secrets:
    - Add VERCEL_TOKEN (from Vercel account settings)
    - Add VERCEL_ORG_ID and VERCEL_PROJECT_ID (from Vercel project)
    - Add SUPABASE_ACCESS_TOKEN (from Supabase account)
    - Add SUPABASE_STAGING_PROJECT_REF and SUPABASE_PROD_PROJECT_REF

  SETUP GitHub environment protection:
    - Configure Production environment with manual approval
    - Set deployment branch restrictions to main only
    - Add required reviewers for production deployments

Task 3 - Database Migration Strategy Implementation:
  ENHANCE supabase/README.md:
    - Document clear local development workflow
    - Add staging deployment via CI instructions
    - Include production promotion procedures

  CREATE migration testing procedure:
    - Local development and validation
    - Automatic staging application via CI
    - Manual production promotion after approval

Task 4 - CI/CD Pipeline Validation and Testing:
  TEST existing main.yml workflow:
    - Verify quality checks run successfully
    - Validate staging deployment with secrets
    - Test smoke tests against staging environment
    - Confirm production promotion workflow

  ADD missing Playwright configuration:
    - Ensure smoke tests are properly configured
    - Validate test runs against staging.mikeiu.com
    - Add health check endpoint if missing

Task 5 - Environment Variable Alignment:
  VERIFY Vercel environment configuration:
    - Preview environment uses staging database + development dataset
    - Production environment uses production database + production dataset
    - All vendor keys properly separated (test vs live)

  UPDATE local development setup:
    - Ensure .env.local matches development environment expectations
    - Verify Sanity dataset usage for local development
    - Test complete local development workflow

Task 6 - Documentation and Process Finalization:
  CREATE deployment runbook:
    - Step-by-step development to production process
    - Rollback procedures for failed deployments
    - Emergency procedures and contacts

  UPDATE project README.md:
    - Clarify environment model and purposes
    - Document complete development workflow
    - Add troubleshooting section for common issues

Task 7 - Security and Compliance Verification:
  AUDIT security configuration:
    - Verify no secrets in repository code
    - Confirm all environment variables properly classified
    - Validate GitHub environment access controls

  TEST complete pipeline security:
    - Verify secrets are properly masked in logs
    - Confirm environment isolation
    - Validate rollback capabilities

Task 8 - Pipeline Testing and Go-Live Validation:
  EXECUTE end-to-end pipeline test:
    - Create test branch with minor change
    - Validate PR workflow completion
    - Test main branch deployment to staging
    - Verify manual production promotion

  DOCUMENT final state:
    - Update phase-0-log.md with completion status
    - Create environment diagram showing final architecture
    - Record any remaining technical debt for future phases
```

### Per task implementation details

```yaml
# Task 1: Environment Configuration Audit
VERIFY_VERCEL_ENVIRONMENTS:
  preview_environment:
    expected_variables:
      - NEXT_PUBLIC_SITE_URL: 'https://mike-com-web.vercel.app'
      - NEXT_PUBLIC_SUPABASE_URL: 'https://qijxfigergpnuqbaxtjv.supabase.co'
      - NEXT_PUBLIC_SANITY_DATASET: 'development'
      - All vendor keys in test mode

  production_environment:
    expected_variables:
      - NEXT_PUBLIC_SITE_URL: 'https://mikeiu.com'
      - NEXT_PUBLIC_SUPABASE_URL: 'https://pzgczflyltjyxwqyteuj.supabase.co'
      - NEXT_PUBLIC_SANITY_DATASET: 'production'
      - All vendor keys in live mode

# Task 2: GitHub Secrets Configuration
GITHUB_REPOSITORY_SECRETS:
  vercel_integration:
    - VERCEL_TOKEN: 'Vercel account access token'
    - VERCEL_ORG_ID: 'Team/user organization ID'
    - VERCEL_PROJECT_ID: 'prj_wN2kD7lvIqP0BjopkvC9yd9Xl17f'

  supabase_integration:
    - SUPABASE_ACCESS_TOKEN: 'Supabase account access token'
    - SUPABASE_STAGING_PROJECT_REF: 'qijxfigergpnuqbaxtjv'
    - SUPABASE_PROD_PROJECT_REF: 'pzgczflyltjyxwqyteuj'

GITHUB_ENVIRONMENT_PROTECTION:
  production_environment:
    protection_rules:
      - required_reviewers: 1
      - deployment_branches: ['main']
      - manual_approval: true
      - secrets_access: 'environment_specific'

# Task 4: CI/CD Pipeline Testing
PIPELINE_VALIDATION_STEPS:
  quality_checks:
    command: 'pnpm typecheck && pnpm lint && pnpm build'
    expected: 'All checks pass, artifacts uploaded'

  staging_deployment:
    steps:
      - 'Apply Supabase migrations to staging (dry-run first)'
      - 'Deploy to Vercel with staging alias'
      - 'Verify deployment accessibility'

  smoke_tests:
    target: 'https://staging.mikeiu.com'
    tests:
      - 'Health endpoint returns 200'
      - 'Homepage renders without errors'
      - 'Basic navigation functional'

  production_promotion:
    trigger: 'Manual approval after smoke tests pass'
    process: 'Promote same build without rebuilding'
    verification: 'Health check on mikeiu.com'
```

### Integration Points

```yaml
VERCEL_INTEGRATION:
  github_app_connection:
    status: 'Active (automatic PR previews working)'
    configuration: 'Repository connected, auto-deploy enabled'

  domain_management:
    staging_domain: 'mike-com-web.vercel.app (automatic)'
    production_domain: 'mikeiu.com (manual alias required)'

  environment_promotion:
    process: 'vercel promote <deployment-url>'
    automation: 'CI/CD pipeline handles promotion'

SUPABASE_INTEGRATION:
  migration_workflow:
    local: 'supabase db diff -> generate migration file'
    staging: 'CI applies migrations automatically'
    production: 'Same migrations promoted with build'

  access_control:
    development: 'Full access for schema changes'
    production: 'Migration-only access via CI'

SANITY_INTEGRATION:
  content_workflow:
    development_dataset: 'Content staging and preview'
    production_dataset: 'Live content only'

  webhook_configuration:
    target: 'Vercel ISR revalidation endpoints'
    environment: 'Both development and production'

GITHUB_INTEGRATION:
  workflow_orchestration:
    pr_workflow: 'Quality checks + preview deployment'
    main_workflow: 'Staging deploy + smoke tests + manual promotion'

  environment_protection:
    development: 'No restrictions (auto-deploy)'
    production: 'Manual approval required'
```

## Validation Loop

### Level 1: Configuration Verification

```bash
# Verify GitHub secrets are configured
gh secret list --env production
gh secret list # Repository secrets

# Check Vercel environment variables
vercel env ls --environment preview
vercel env ls --environment production

# Validate Supabase project access
supabase projects list
supabase link --project-ref qijxfigergpnuqbaxtjv --password [password]

# Expected: All secrets present, environments configured, projects accessible
```

### Level 2: Pipeline Functionality Testing

```bash
# Test PR workflow
git checkout -b test/pipeline-validation
echo "// Pipeline test" >> apps/web/src/app/page.tsx
git add . && git commit -m "test: validate PR pipeline"
git push origin test/pipeline-validation
# Create PR and verify all checks pass

# Test main pipeline (after merging)
gh workflow run "Main Pipeline" --ref main
gh run list --workflow="Main Pipeline" --limit 1
# Monitor deployment and staging smoke tests

# Expected: PR checks pass, staging deployment succeeds, awaits approval
```

### Level 3: Production Promotion Validation

```bash
# Test manual approval and promotion
gh run view [run-id] --log
# Approve production deployment via GitHub UI
# Monitor promotion to production

# Verify production deployment
curl https://mikeiu.com/api/health
curl https://mikeiu.com/

# Compare build versions between staging and production
# Verify same build promoted without rebuilding

# Expected: Manual approval works, same build promoted, production accessible
```

## Final validation Checklist

- [ ] GitHub repository secrets configured for CI/CD pipeline
- [ ] GitHub Production environment has manual approval protection
- [ ] Vercel environments properly mapped to databases and datasets
- [ ] Main pipeline deploys to staging and runs smoke tests successfully
- [ ] Manual approval gate functions for production promotion
- [ ] Production promotion uses same build without rebuilding
- [ ] Local development workflow clearly documented and functional
- [ ] Database migration process works from local → staging → production
- [ ] All secrets properly secured and not exposed in logs
- [ ] Environment documentation updated to reflect two-environment model
- [ ] Complete development to production workflow documented
- [ ] Rollback procedures documented and tested

---

## Anti-Patterns to Avoid

- ❌ Don't create additional environments - stick to development/production model
- ❌ Don't configure secrets in repository code - use GitHub environments only
- ❌ Don't skip staging validation - every production deploy must validate first
- ❌ Don't rebuild for production - promote the same tested artifacts
- ❌ Don't mix test and live credentials across environments
- ❌ Don't bypass manual approval for production - human verification required
- ❌ Don't ignore environment variable consistency - maintain clear boundaries

## Current Critical Issues Summary

**BLOCKING ISSUES (Must fix immediately):**

1. **No GitHub Secrets**: CI/CD pipeline cannot execute without VERCEL_TOKEN, SUPABASE_ACCESS_TOKEN
2. **No Environment Protection**: Production deployments lack manual approval gate
3. **Incomplete Documentation**: Development workflow unclear, no rollback procedures

**HIGH PRIORITY (Fix during implementation):**

1. **Environment Mapping Confusion**: Preview using staging DB + development dataset needs clarification
2. **Missing Health Endpoint**: Smoke tests expect /api/health endpoint
3. **Migration Process Gaps**: No clear local → staging → production migration workflow

**MEDIUM PRIORITY (Address after core pipeline working):**

1. **Database Naming Inconsistency**: "staging" database with "development" dataset terminology
2. **Local Development Isolation**: Docker Supabase not integrated with migration workflow
3. **Monitoring Gaps**: No deployment success/failure notifications configured

This comprehensive review identifies the current state as having all necessary infrastructure components but lacking the critical configuration and documentation needed for a production-ready development pipeline. The execution plan above provides a clear path to resolve all issues and establish a robust two-environment development workflow.
