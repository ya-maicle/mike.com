name: "Security & Performance Baseline Checks - Phase 0.27"
description: |

## Purpose

Conduct comprehensive security and performance baseline validation to ensure Phase 0 infrastructure meets production readiness standards, with no secrets in repository, proper client/server security boundaries, and documented performance benchmarks.

## Core Principles

1. **Security by design**: No secrets in repository, proper environment variable separation
2. **Performance measurement**: Establish baseline metrics for future optimization
3. **Documentation completeness**: All security and performance standards documented
4. **Compliance verification**: Ensure all Phase 0 requirements satisfied per PRD
5. **Operational readiness**: Infrastructure prepared for Phase 1 development

---

## Goal

Complete Phase 0 with comprehensive security audit, performance baseline establishment, and final documentation updates to ensure production-ready infrastructure foundation for subsequent development phases.

## Why

- **Production safety**: Verify no security vulnerabilities in Phase 0 setup
- **Performance foundation**: Establish baseline metrics for monitoring and optimization
- **Phase gate compliance**: Ensure all Phase 0 exit criteria satisfied per PRD
- **Team enablement**: Complete documentation for development team onboarding
- **Future optimization**: Baseline metrics enable performance regression detection

## What

- Audit repository for secrets and security violations
- Verify proper client/server environment variable separation
- Validate Tailwind CSS optimization and build performance
- Measure and document baseline performance metrics
- Update README and ENVIRONMENT.md with final configurations
- Create Phase 0 completion checklist and sign-off documentation

### Success Criteria

- [ ] Repository contains no secrets or sensitive environment variables
- [ ] Supabase service keys properly isolated to server-side only
- [ ] Environment variable configuration validated across all environments
- [ ] Tailwind CSS purge configuration active and optimized
- [ ] Baseline performance metrics documented for /api/health endpoint
- [ ] Cold start performance measured and documented
- [ ] README updated with complete run/test/deploy workflows
- [ ] ENVIRONMENT.md reflects final vendor environment mappings
- [ ] Phase 0 completion checklist created and validated
- [ ] All Phase 0 exit criteria satisfied per PRD

## All Needed Context

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- file: .gitignore
  why: Verify sensitive files properly excluded from repository

- file: .env.example
  why: Template for environment variables without actual secrets

- file: ENVIRONMENT.md
  why: Environment variable documentation to validate and update

- file: apps/web/tailwind.config.js
  why: Tailwind configuration and purge settings

- file: apps/web/src/sanity/client.ts
  why: Verify server-only imports and client/server separation

- file: apps/web/src/app/api/health/route.ts
  why: Health endpoint for performance baseline measurement

- file: docs/logs/phase-0-log.md
  why: Phase 0 requirements and completion criteria

- docfile: docs/product_requirements_document.md
  why: PRD Phase 0 exit criteria and security requirements

- url: https://nextjs.org/docs/basic-features/environment-variables
  why: Next.js environment variable security best practices

- url: https://vercel.com/docs/concepts/projects/environment-variables
  why: Vercel environment variable security and management
```

### Current Codebase tree

```bash
mikeiu.com/
├── .env.example                        # VERIFY: No secrets, only placeholders
├── .gitignore                          # VERIFY: Excludes sensitive files
├── ENVIRONMENT.md                      # UPDATE: Final vendor mappings
├── README.md                           # UPDATE: Complete workflows
├── apps/
│   └── web/
│       ├── src/
│       │   ├── app/
│       │   │   └── api/
│       │   │       └── health/
│       │   │           └── route.ts    # MEASURE: Performance baseline
│       │   └── sanity/
│       │       └── client.ts           # VERIFY: Server-only security
│       └── tailwind.config.js          # VERIFY: Purge configuration
├── docs/
│   └── logs/
│       └── phase-0-log.md              # REFERENCE: Phase 0 status
└── supabase/                           # VERIFY: No exposed credentials
```

### Desired Codebase tree with files to be added

```bash
mikeiu.com/
├── docs/
│   ├── logs/
│   │   └── phase-0-log.md              # EXISTING: Phase 0 status
│   ├── security/
│   │   ├── baseline-audit.md           # CREATE: Security audit results
│   │   └── environment-security.md     # CREATE: Security guidelines
│   └── performance/
│       ├── baseline-metrics.md         # CREATE: Performance baselines
│       └── monitoring-guide.md         # CREATE: Performance monitoring
├── scripts/
│   ├── security-audit.sh               # CREATE: Automated security checks
│   └── performance-baseline.sh         # CREATE: Performance measurement
├── ENVIRONMENT.md                      # UPDATE: Final mappings
├── README.md                           # UPDATE: Complete documentation
└── .phase0-complete.md                 # CREATE: Phase 0 sign-off document
```

### Known Gotchas of our codebase & Security/Performance Considerations

```bash
# CRITICAL: Environment variable security patterns
# NEXT_PUBLIC_* variables are exposed to client
# Server-only variables must never have NEXT_PUBLIC_ prefix
# Supabase SERVICE_ROLE_KEY must be server-only

# CRITICAL: Tailwind purge configuration
# Must include all component paths for proper CSS optimization
# Missing paths result in larger bundle sizes

# GOTCHA: Serverless cold start measurement
# First request after idle period has higher latency
# Measure p95 over multiple requests for realistic baseline

# GOTCHA: Repository secret scanning
# Use tools like git-secrets or manual audit
# Check commit history for accidentally committed secrets

# PATTERN: Performance baseline establishment
# Measure multiple metrics: response time, bundle size, cold start
# Document current state for future optimization comparison

# PATTERN: Security audit checklist
# 1. Repository secret scan
# 2. Environment variable classification
# 3. Client/server boundary verification
# 4. Build output analysis
```

## Implementation Blueprint

### Data models and structure

```yaml
# Security Audit Structure
SECURITY_CHECKLIST:
  repository_secrets: 'No secrets committed to git history'
  environment_separation: 'Client vs server variables properly classified'
  api_key_protection: 'Service keys server-only, anon keys client-safe'
  build_output: 'No secrets in build artifacts'

# Performance Baseline Structure
PERFORMANCE_METRICS:
  api_health_response: 'p95 latency under 500ms target'
  cold_start_latency: 'Serverless function initialization time'
  bundle_size: 'JavaScript bundle size optimization'
  css_optimization: 'Tailwind purge effectiveness'

# Documentation Updates
DOCUMENTATION_COMPLETENESS:
  README: 'Complete run/test/deploy workflows'
  ENVIRONMENT: 'Final vendor environment mappings'
  security_guidelines: 'Security best practices and audit results'
  performance_baselines: 'Current metrics and monitoring setup'
```

### List of tasks to be completed in order

```yaml
Task 1 - Security Repository Audit:
  SCAN repository for secrets:
    - CHECK git history for accidentally committed secrets
    - VERIFY .env.example contains only placeholders
    - CONFIRM .gitignore excludes all sensitive files
    - VALIDATE no hardcoded API keys or passwords

Task 2 - Environment Variable Security Validation:
  VERIFY client/server separation:
    - CHECK all NEXT_PUBLIC_ variables are client-safe
    - CONFIRM server-only variables lack NEXT_PUBLIC_ prefix
    - VALIDATE Supabase service keys are server-only
    - TEST environment variable loading in both contexts

Task 3 - Performance Baseline Measurement:
  MEASURE current performance:
    - BENCHMARK /api/health endpoint response times
    - MEASURE cold start latency for serverless functions
    - ANALYZE JavaScript bundle sizes
    - VERIFY Tailwind CSS purge effectiveness

Task 4 - Tailwind Optimization Verification:
  VALIDATE CSS optimization:
    - CONFIRM tailwind.config.js content paths include all components
    - VERIFY purge removes unused CSS classes
    - MEASURE CSS bundle size before/after optimization
    - TEST production build CSS optimization

Task 5 - Create Security Documentation:
  CREATE docs/security/baseline-audit.md:
    - DOCUMENT security audit results and findings
    - INCLUDE environment variable security guidelines
    - SPECIFY ongoing security practices for team

Task 6 - Create Performance Documentation:
  CREATE docs/performance/baseline-metrics.md:
    - DOCUMENT current performance baselines
    - INCLUDE monitoring and alerting recommendations
    - SPECIFY performance optimization targets

Task 7 - Final Documentation Updates:
  UPDATE README.md:
    - COMPLETE run/test/deploy workflow documentation
    - INCLUDE Phase 0 completion status
    - ADD links to security and performance documentation

  UPDATE ENVIRONMENT.md:
    - FINALIZE vendor environment variable mappings
    - INCLUDE security classifications for each variable
    - VERIFY accuracy across all environments

Task 8 - Phase 0 Completion Validation:
  CREATE .phase0-complete.md:
    - CHECKLIST all Phase 0 exit criteria per PRD
    - DOCUMENT final architecture and configuration
    - INCLUDE sign-off and next phase readiness assessment
```

### Per task pseudocode

```bash
# Task 1: Security Repository Audit Script
# File: scripts/security-audit.sh
#!/bin/bash
set -e

echo "🔍 Starting security audit..."

# Check for secrets in git history
echo "📜 Scanning git history for secrets..."
if command -v git-secrets >/dev/null; then
  git secrets --scan-history
else
  # Manual patterns check
  git log --all --full-history -- '*.env*' || echo "No .env files in history"
  git grep -n -i -E "(api_key|secret|password|token)" -- ':!.env.example' ':!docs/' || echo "No hardcoded secrets found"
fi

# Verify .env.example safety
echo "📝 Checking .env.example for secrets..."
if grep -E "(sk_live_|pk_live_)" .env.example; then
  echo "❌ Live keys found in .env.example"
  exit 1
else
  echo "✅ .env.example contains only placeholders"
fi

# Check Supabase client configuration
echo "🔐 Verifying Supabase security..."
if grep -r "SERVICE_ROLE_KEY" apps/web/src --include="*.ts" --include="*.tsx" | grep -v "process.env"; then
  echo "❌ Service role key used in client code"
  exit 1
else
  echo "✅ Supabase service keys properly isolated"
fi

echo "🎉 Security audit completed successfully"

# Task 3: Performance Baseline Script
# File: scripts/performance-baseline.sh
#!/bin/bash
set -e

STAGING_URL="https://staging.mikeiu.com"
HEALTH_ENDPOINT="$STAGING_URL/api/health"

echo "📊 Measuring performance baselines..."

# Health endpoint response time
echo "⏱️ Measuring API response times..."
for i in {1..10}; do
  curl -s -w "%{time_total}s\n" -o /dev/null "$HEALTH_ENDPOINT"
  sleep 1
done | sort -n | tail -1 | xargs -I {} echo "p95 response time: {}"

# Cold start measurement (after idle period)
echo "🥶 Testing cold start performance..."
# Wait for idle, then measure first request
sleep 30
curl -s -w "Cold start time: %{time_total}s\n" -o /dev/null "$HEALTH_ENDPOINT"

# Bundle size analysis
echo "📦 Analyzing bundle sizes..."
cd apps/web && npm run build > /dev/null 2>&1
ls -lh .next/static/chunks/ | grep -E '\.(js|css)$' | head -5

echo "📈 Performance baseline measurement completed"

# Task 5: Security Documentation Template
# File: docs/security/baseline-audit.md
# Security Baseline Audit - Phase 0

## Audit Summary
- **Date**: $(date)
- **Scope**: Phase 0 infrastructure security validation
- **Status**: ✅ Passed

## Findings

### ✅ Repository Security
- No secrets found in git history
- .env.example contains only safe placeholders
- .gitignore properly excludes sensitive files

### ✅ Environment Variable Security
- Server-only variables: SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY, etc.
- Client-safe variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- Proper separation maintained

### ✅ API Security
- Supabase service keys isolated to server-side only
- No hardcoded credentials in source code
- Environment variables properly loaded

## Ongoing Security Practices
1. Never commit .env files to repository
2. Use NEXT_PUBLIC_ prefix only for client-safe variables
3. Regular security audits using scripts/security-audit.sh
4. Review all environment variable additions for proper classification

# Task 8: Phase 0 Completion Document
# File: .phase0-complete.md
# Phase 0 Completion Certificate

**Project**: mikeiu.com
**Phase**: 0 - Infrastructure Setup
**Completion Date**: $(date)
**Status**: ✅ COMPLETE

## Exit Criteria Validation

### ✅ Infrastructure Foundation
- [x] Monorepo structure with Next.js app and UI packages
- [x] GitHub repository with proper CI/CD workflows
- [x] Vercel hosting with staging and production environments
- [x] Domain configuration (staging.mikeiu.com, mikeiu.com)

### ✅ Development Environment
- [x] Local development environment operational
- [x] Environment variable management across all environments
- [x] Supabase local and remote project configuration
- [x] Testing framework baseline (Vitest + RTL)

### ✅ Security & Compliance
- [x] No secrets in repository
- [x] Proper client/server variable separation
- [x] Environment variable security audit passed
- [x] SSL certificates and domain security verified

### ✅ Performance & Monitoring
- [x] Performance baselines documented
- [x] Health endpoints operational
- [x] Build optimization verified
- [x] Monitoring foundation established

## Next Phase Readiness
- Team can begin Phase 1 development
- All vendor integrations prepared with environment variables
- CI/CD pipeline operational for safe deployments
- Local development environment fully functional

**Signed off by**: Infrastructure Team
**Next Phase**: Phase 1 - Core Application Development
```

### Integration Points

```yaml
SECURITY_INTEGRATION:
  - repository_scanning: Automated secret detection
  - environment_validation: Client/server separation verification
  - build_analysis: No secrets in production artifacts

PERFORMANCE_INTEGRATION:
  - baseline_establishment: Current metrics for future comparison
  - monitoring_setup: Health endpoints and alerting foundation
  - optimization_verification: CSS/JS bundle optimization confirmed

DOCUMENTATION_INTEGRATION:
  - complete_workflows: All team procedures documented
  - security_guidelines: Ongoing security practices established
  - performance_monitoring: Baseline metrics and targets set

PHASE_GATE_INTEGRATION:
  - exit_criteria: All Phase 0 requirements satisfied per PRD
  - team_readiness: Documentation enables Phase 1 development
  - infrastructure_stability: Foundation ready for application development
```

## Validation Loop

### Level 1: Security Audit Execution

```bash
# Run automated security audit
./scripts/security-audit.sh

# Manual verification of critical security boundaries
grep -r "SERVICE_ROLE" apps/web/src/
grep -r "NEXT_PUBLIC_" .env.example

# Expected: No security violations found, proper separation maintained
```

### Level 2: Performance Baseline Measurement

```bash
# Measure current performance
./scripts/performance-baseline.sh

# Verify Tailwind optimization
cd apps/web && npm run build
ls -la .next/static/css/

# Expected: Reasonable performance metrics documented, CSS optimized
```

### Level 3: Phase 0 Completion Validation

```bash
# Verify all Phase 0 components functional
pnpm typecheck && pnpm lint && pnpm build
pnpm test
curl https://staging.mikeiu.com/api/health
curl https://mikeiu.com/api/health

# Review Phase 0 exit criteria checklist
cat .phase0-complete.md

# Expected: All systems operational, exit criteria satisfied
```

## Final validation Checklist

- [ ] Repository security audit passed with no secrets found
- [ ] Environment variable security verified across all environments
- [ ] Supabase service keys properly isolated to server-side only
- [ ] Performance baselines measured and documented
- [ ] Tailwind CSS optimization verified and effective
- [ ] Cold start performance measured and within acceptable range
- [ ] README updated with complete run/test/deploy workflows
- [ ] ENVIRONMENT.md finalized with all vendor mappings
- [ ] Security documentation created for ongoing practices
- [ ] Performance monitoring foundation established
- [ ] Phase 0 completion certificate created and validated
- [ ] All Phase 0 exit criteria satisfied per PRD requirements

---

## Anti-Patterns to Avoid

- ❌ Don't skip security audit - secrets in repository are critical vulnerabilities
- ❌ Don't ignore environment variable classification - client exposure is a security risk
- ❌ Don't skip performance baseline measurement - future optimization needs current metrics
- ❌ Don't leave documentation incomplete - team needs operational procedures
- ❌ Don't ignore Tailwind purge configuration - CSS bloat affects performance
- ❌ Don't rush Phase 0 completion - foundation quality affects all future phases
- ❌ Don't skip verification of exit criteria - Phase 1 depends on Phase 0 completeness
