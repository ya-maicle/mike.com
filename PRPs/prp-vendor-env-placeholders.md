name: "Vendor Environment Variable Placeholders - Phase 0.19"
description: |

## Purpose

Add comprehensive environment variable placeholders for all vendor integrations (Stripe, Mux, Resend, MailerLite, PostHog, Sentry) across Vercel environments to establish the complete environment contract before vendor-specific implementation phases.

## Core Principles

1. **Complete contract**: All vendor vars defined upfront for consistency
2. **Security separation**: Server keys never exposed to client; test/live key separation
3. **Environment isolation**: Separate keys per environment with appropriate test/live designation
4. **Documentation sync**: .env.example and ENVIRONMENT.md stay aligned

---

## Goal

Establish complete environment variable contract for all vendor integrations, ensuring proper test/live key separation and comprehensive documentation for Phase 1+ development.

## Why

- **Business value**: Prevents env var issues during vendor integration phases
- **Integration**: Creates stable foundation for Stripe, Mux, email, analytics implementations
- **Problems solved**: Eliminates environment configuration surprises in later phases

## What

Add placeholder environment variables for Stripe, Mux, Resend, MailerLite, PostHog, and Sentry across all Vercel environments with proper test/live key separation and comprehensive documentation.

### Success Criteria

- [ ] All vendor environment variables added to Vercel (Preview/Staging/Production)
- [ ] Test keys used for non-production environments; live keys only in production
- [ ] No server keys exposed to client-side (proper NEXT*PUBLIC* prefixing)
- [ ] `vercel env pull` syncs all required placeholder names into local .env.local
- [ ] .env.example contains all vendor variables with helpful comments
- [ ] ENVIRONMENT.md documents all vendor variables with usage notes
- [ ] No actual secrets committed to repository

## All Needed Context

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- file: docs/logs/phase-0-log.md
  why: Task 0.19 requirements and vendor list

- file: docs/product_requirements_document.md
  why: Vendor integration requirements across phases

- file: ENVIRONMENT.md
  why: Current environment variable structure and patterns

- file: .env.example
  why: Current environment template structure

- url: https://stripe.com/docs/keys
  why: Understanding test vs live key patterns and security

- url: https://docs.mux.com/guides/video/secure-video-playback
  why: Mux token security patterns

- url: https://posthog.com/docs/getting-started/install?tab=snippet
  why: PostHog key types and EU residency setup

- doc: https://docs.sentry.io/product/sentry-basics/dsn-explainer/
  section: DSN configuration
  critical: DSNs can be public but should still be environment-specific
```

### Current Codebase tree

```bash
mikeiu.com/
├── ENVIRONMENT.md                    # Current env documentation
├── .env.example                      # Current env template
└── docs/
    ├── logs/
    │   └── phase-0-log.md           # Task 0.19 requirements
    └── product_requirements_document.md # Vendor usage context
```

### Desired Codebase tree with files to be modified

```bash
mikeiu.com/
├── ENVIRONMENT.md                    # UPDATE: Add all vendor sections
├── .env.example                      # UPDATE: Add all vendor placeholders
└── docs/
    └── logs/
        └── phase-0-log.md           # REFERENCE: Vendor requirements
```

### Known Gotchas of our codebase & Vendor Quirks

```bash
# CRITICAL: Stripe has test/live key prefixes
# Test keys: pk_test_*, sk_test_*
# Live keys: pk_live_*, sk_live_*

# CRITICAL: Mux tokens are different from keys
# TOKEN_ID and TOKEN_SECRET pairs for API access

# CRITICAL: PostHog EU residency for compliance
# Use EU PostHog instance: https://eu.posthog.com

# CRITICAL: Client-exposed vars need NEXT_PUBLIC_ prefix
# Server-only vars MUST NOT have NEXT_PUBLIC_ prefix

# GOTCHA: Sentry DSNs can be public but should be env-specific
# Different projects per environment for proper separation

# GOTCHA: MailerLite API keys have different scopes
# Use appropriate scope for automation vs manual operations
```

## Implementation Blueprint

### Data models and structure

```yaml
# Environment Variable Categories
CLIENT_EXPOSED:
  - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  - NEXT_PUBLIC_SITE_URL
  - NEXT_PUBLIC_POSTHOG_KEY
  - NEXT_PUBLIC_POSTHOG_HOST

SERVER_ONLY:
  - STRIPE_SECRET_KEY
  - MUX_TOKEN_ID
  - MUX_TOKEN_SECRET
  - RESEND_API_KEY
  - MAILERLITE_API_KEY
  - SENTRY_DSN

# Environment Mapping
DEVELOPMENT/PREVIEW:
  - All test/sandbox keys
  - EU PostHog instance
  - Test Stripe webhook endpoints

STAGING:
  - All test/sandbox keys
  - Separate Sentry project
  - Staging-specific webhooks

PRODUCTION:
  - Live keys only
  - Production Sentry project
  - Live webhook endpoints
```

### List of tasks to be completed in order

```yaml
Task 1 - Add Stripe Environment Variables:
  MODIFY Vercel environments:
    - Add STRIPE_SECRET_KEY (server-only)
    - Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (client-safe)
    - Use test keys for Preview/Staging
    - Use live keys for Production only

Task 2 - Add Mux Environment Variables:
  MODIFY Vercel environments:
    - Add MUX_TOKEN_ID (server-only)
    - Add MUX_TOKEN_SECRET (server-only)
    - Use test tokens for non-production
    - Use live tokens for Production only

Task 3 - Add Email Service Environment Variables:
  MODIFY Vercel environments:
    - Add RESEND_API_KEY (server-only)
    - Add MAILERLITE_API_KEY (server-only)
    - Use test/sandbox keys for non-production

Task 4 - Add Analytics Environment Variables:
  MODIFY Vercel environments:
    - Add NEXT_PUBLIC_POSTHOG_KEY (client-safe)
    - Add NEXT_PUBLIC_POSTHOG_HOST (client-safe, EU instance)
    - Add NEXT_PUBLIC_SITE_URL (client-safe)
    - Use separate PostHog projects per environment

Task 5 - Add Monitoring Environment Variables:
  MODIFY Vercel environments:
    - Add SENTRY_DSN (can be public but env-specific)
    - Use separate Sentry projects per environment

Task 6 - Update Environment Documentation:
  MODIFY .env.example:
    - Add all vendor variables with helpful comments
    - Include test key patterns as examples
    - Preserve existing structure

  MODIFY ENVIRONMENT.md:
    - Add vendor sections with usage notes
    - Document test vs live key requirements
    - Include security notes and gotchas
```

### Per task pseudocode

```bash
# Task 1: Stripe Variables (Example for all environments)
# Vercel Environment Configuration

# Preview/Staging Environment:
STRIPE_SECRET_KEY=sk_test_placeholder_for_staging
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder_for_staging

# Production Environment:
STRIPE_SECRET_KEY=sk_live_placeholder_for_production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_placeholder_for_production

# PATTERN: All test keys for non-prod, live keys only for prod
```

```yaml
# Task 6: Documentation Updates
# .env.example pattern:
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_test_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_publishable_key_here

# Mux Video Configuration
MUX_TOKEN_ID=your_mux_token_id_here
MUX_TOKEN_SECRET=your_mux_token_secret_here

# ENVIRONMENT.md pattern:
## Stripe
- `STRIPE_SECRET_KEY`: Server-only secret key (test/live per env)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Client-safe publishable key
```

### Integration Points

```yaml
VERCEL_ENVIRONMENT_STRUCTURE:
  Preview:
    - All test/sandbox keys
    - Development-oriented configuration
    - EU PostHog instance

  Staging:
    - All test/sandbox keys
    - Staging-specific projects where available
    - Separate monitoring/analytics projects

  Production:
    - Live keys only
    - Production projects and monitoring
    - Real webhook endpoints

DOCUMENTATION_INTEGRATION:
  - .env.example: Template with helpful comments
  - ENVIRONMENT.md: Comprehensive vendor documentation
  - README.md: Reference to environment setup process
```

## Validation Loop

### Level 1: Environment Variable Structure

```bash
# Verify all environments have required variables
vercel env ls --environment=preview
vercel env ls --environment=staging
vercel env ls --environment=production

# Expected: All vendor variables present in each environment
```

### Level 2: Local Environment Sync

```bash
# Test environment pulling
vercel env pull --environment=preview

# Verify .env.local contains all vendor variables
grep -E "(STRIPE|MUX|RESEND|MAILERLITE|POSTHOG|SENTRY)" .env.local

# Expected: All vendor variables present with placeholder values
```

### Level 3: Documentation Validation

```bash
# Verify documentation completeness
grep -E "(STRIPE|MUX|RESEND|MAILERLITE|POSTHOG|SENTRY)" .env.example
grep -E "(STRIPE|MUX|RESEND|MAILERLITE|POSTHOG|SENTRY)" ENVIRONMENT.md

# Expected: All vendor variables documented in both files
```

## Final validation Checklist

- [ ] All vendor variables added to Vercel Preview environment
- [ ] All vendor variables added to Vercel Staging environment
- [ ] All vendor variables added to Vercel Production environment
- [ ] Test/sandbox keys used for non-production environments
- [ ] Live keys designated for production only
- [ ] Client-exposed variables use NEXT*PUBLIC* prefix correctly
- [ ] Server-only variables do NOT use NEXT*PUBLIC* prefix
- [ ] `vercel env pull` successfully syncs all vendor variables
- [ ] .env.example updated with all vendor variables and comments
- [ ] ENVIRONMENT.md updated with vendor sections and usage notes
- [ ] No actual secrets committed to repository

---

## Anti-Patterns to Avoid

- ❌ Don't use live keys in non-production environments
- ❌ Don't expose server keys with NEXT*PUBLIC* prefix
- ❌ Don't mix test and live credentials in same environment
- ❌ Don't commit actual API keys to git repository
- ❌ Don't forget to document security implications
- ❌ Don't use same monitoring projects across environments
- ❌ Don't skip environment-specific webhook endpoints
