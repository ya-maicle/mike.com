name: "Environment Documentation Updates - Phase 0.18/0.19 Component"
description: |

## Purpose

Update .env.example and ENVIRONMENT.md to include comprehensive Sanity configuration and all vendor environment variable placeholders, creating a complete environment contract for the project.

## Core Principles

1. **Complete documentation**: All environment variables documented with clear usage
2. **Security guidance**: Clear notes about server vs client exposure
3. **Environment mapping**: Clear env-to-dataset/key mappings documented
4. **Developer experience**: Helpful comments and examples for quick setup

---

## Goal

Update environment documentation files to include complete Sanity configuration and all vendor placeholders, providing developers with comprehensive guidance for environment setup across all phases.

## Why

- **Developer onboarding**: Clear environment setup reduces configuration errors
- **Security compliance**: Proper documentation prevents security misconfigurations
- **Phase preparation**: Complete contract enables smooth vendor integration phases

## What

- Update .env.example with Sanity variables and vendor placeholders
- Update ENVIRONMENT.md with comprehensive vendor sections
- Include security notes and environment-specific guidance
- Add helpful comments and examples

### Success Criteria

- [ ] .env.example includes all Sanity variables with examples
- [ ] .env.example includes all vendor placeholders with helpful comments
- [ ] ENVIRONMENT.md has comprehensive Sanity section with env mappings
- [ ] ENVIRONMENT.md has vendor sections for all Phase 1+ integrations
- [ ] Security guidance provided for server vs client variables
- [ ] Environment-specific usage notes included
- [ ] Documentation stays consistent with actual implementation

## All Needed Context

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- file: .env.example
  why: Current environment template structure to preserve and extend

- file: ENVIRONMENT.md
  why: Current documentation format and structure to maintain

- file: docs/logs/phase-0-log.md
  why: Phase 0.18/0.19 requirements for environment documentation

- file: docs/product_requirements_document.md
  why: Complete vendor list and usage context across phases

- file: apps/web/src/sanity/client.ts
  why: Understand actual Sanity variable usage patterns
```

### Current Codebase tree

```bash
mikeiu.com/
├── .env.example                      # UPDATE: Add Sanity + vendor vars
├── ENVIRONMENT.md                    # UPDATE: Add comprehensive sections
└── docs/
    ├── logs/
    │   └── phase-0-log.md           # REFERENCE: Requirements
    └── product_requirements_document.md # REFERENCE: Vendor usage
```

### Desired Codebase tree (no new files)

```bash
mikeiu.com/
├── .env.example                      # UPDATED: Complete variable set
├── ENVIRONMENT.md                    # UPDATED: Comprehensive documentation
```

### Known Gotchas of documentation patterns

```bash
# PRESERVE: Existing structure and format in both files
# ADD: New sections without disrupting existing content
# MAINTAIN: Consistency between .env.example and ENVIRONMENT.md
# INCLUDE: Security warnings for server-only variables
# DOCUMENT: Environment-specific mappings (dev/staging/prod)
```

## Implementation Blueprint

### Data models and structure

```yaml
# .env.example Structure
EXISTING_SECTIONS:
  - Supabase variables (preserve)
  - Any other existing variables

NEW_SECTIONS:
  - Sanity CMS Configuration
  - Stripe Payment Processing
  - Mux Video Streaming
  - Email Services (Resend)
  - Marketing Automation (MailerLite)
  - Analytics (PostHog)
  - Error Monitoring (Sentry)

# ENVIRONMENT.md Structure
EXISTING_SECTIONS:
  - Current environment descriptions
  - Current variable documentation

NEW_SECTIONS:
  - Sanity CMS (with env-to-dataset mapping)
  - Payment Processing (Stripe)
  - Video Streaming (Mux)
  - Email & Marketing (Resend + MailerLite)
  - Analytics & Monitoring (PostHog + Sentry)
  - Security Notes section
```

### List of tasks to be completed in order

```yaml
Task 1 - Update .env.example with Sanity Variables:
  MODIFY .env.example:
    - ADD Sanity CMS section
    - INCLUDE helpful comments about dataset mapping
    - PROVIDE example values with correct patterns
    - PRESERVE existing structure

Task 2 - Update .env.example with Vendor Placeholders:
  MODIFY .env.example:
    - ADD Stripe section (test key examples)
    - ADD Mux section (token pattern examples)
    - ADD Email services section
    - ADD Analytics section
    - ADD Monitoring section
    - INCLUDE security warnings for server-only vars

Task 3 - Update ENVIRONMENT.md with Sanity Documentation:
  MODIFY ENVIRONMENT.md:
    - ADD comprehensive Sanity section
    - DOCUMENT environment-to-dataset mapping
    - EXPLAIN server-only token usage
    - PRESERVE existing format

Task 4 - Update ENVIRONMENT.md with Vendor Documentation:
  MODIFY ENVIRONMENT.md:
    - ADD vendor sections for all services
    - DOCUMENT test vs live key requirements
    - INCLUDE security considerations
    - EXPLAIN environment-specific configurations

Task 5 - Add Security and Usage Notes:
  MODIFY both files:
    - ADD security warnings section
    - DOCUMENT NEXT_PUBLIC_ prefix usage
    - EXPLAIN environment separation principles
    - INCLUDE troubleshooting tips
```

### Per task pseudocode

```bash
# Task 1: .env.example Sanity section
# Sanity CMS Configuration
# Project ID and dataset are client-safe (NEXT_PUBLIC_)
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
# Dataset varies by environment: development, staging, production
NEXT_PUBLIC_SANITY_DATASET=development
# Server-only read token (NEVER expose to client)
SANITY_API_READ_TOKEN=your_sanity_read_token

# Task 2: .env.example Vendor sections
# Stripe Payment Processing
# Use test keys (pk_test_*, sk_test_*) for development
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Mux Video Streaming
# Token ID and Secret for API access (both server-only)
MUX_TOKEN_ID=your_mux_token_id
MUX_TOKEN_SECRET=your_mux_token_secret
```

### Integration Points

```yaml
CONSISTENCY_CHECKS:
  - .env.example variable names match ENVIRONMENT.md documentation
  - Security warnings consistent between files
  - Environment mapping explanations align
  - Comment style consistent throughout

REFERENCE_ALIGNMENT:
  - Variable names match actual usage in apps/web/src/sanity/client.ts
  - Security patterns align with project security requirements
  - Environment separation matches Vercel environment strategy
```

## Validation Loop

### Level 1: File Structure Validation

```bash
# Verify both files exist and are readable
test -f .env.example && echo "✅ .env.example exists"
test -f ENVIRONMENT.md && echo "✅ ENVIRONMENT.md exists"

# Check for Sanity variables in both files
grep -q "SANITY" .env.example && echo "✅ Sanity vars in .env.example"
grep -q "Sanity" ENVIRONMENT.md && echo "✅ Sanity docs in ENVIRONMENT.md"
```

### Level 2: Content Validation

```bash
# Verify all vendor variables are documented
vendors=("STRIPE" "MUX" "RESEND" "MAILERLITE" "POSTHOG" "SENTRY")
for vendor in "${vendors[@]}"; do
  grep -q "$vendor" .env.example && echo "✅ $vendor in .env.example"
  grep -q "$vendor" ENVIRONMENT.md && echo "✅ $vendor in ENVIRONMENT.md"
done
```

### Level 3: Security Pattern Validation

```bash
# Check for proper NEXT_PUBLIC_ usage documentation
grep -q "NEXT_PUBLIC_" .env.example && echo "✅ Client vars documented"
grep -q "server-only\|Server-only" ENVIRONMENT.md && echo "✅ Security notes present"

# Verify no actual secrets in examples
! grep -E "(sk_live_|pk_live_)" .env.example && echo "✅ No live keys in examples"
```

## Final validation Checklist

- [ ] .env.example includes complete Sanity configuration with comments
- [ ] .env.example includes all vendor placeholders with examples
- [ ] ENVIRONMENT.md has comprehensive Sanity section with env mappings
- [ ] ENVIRONMENT.md has complete vendor documentation sections
- [ ] Security warnings included for server-only variables
- [ ] NEXT*PUBLIC* prefix usage properly documented
- [ ] Environment-to-dataset/key mappings clearly explained
- [ ] No actual secrets included in example files
- [ ] Documentation consistency between files maintained
- [ ] Existing content preserved and enhanced

---

## Anti-Patterns to Avoid

- ❌ Don't include actual API keys or secrets in examples
- ❌ Don't disrupt existing documentation structure
- ❌ Don't create inconsistencies between .env.example and ENVIRONMENT.md
- ❌ Don't forget security warnings for server-only variables
- ❌ Don't use live key patterns (sk*live*, pk*live*) in examples
- ❌ Don't skip environment-specific configuration guidance
