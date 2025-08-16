name: "Vercel Domain Model Finalization and Checks - Phase 0.26"
description: |

## Purpose

Finalize and verify the complete domain and deployment model with staging.mikeiu.com aliasing to latest main deployments and mikeiu.com pointing to promoted production builds, including rollback procedures and health check protocols.

## Core Principles

1. **Clear domain mapping**: Staging and production environments have distinct, predictable URLs
2. **Deployment verification**: Every deployment is validated before going live
3. **Fast rollback capability**: Previous deployments can be quickly promoted if issues arise
4. **Health monitoring**: Automated and manual checks ensure service availability
5. **Documentation completeness**: All procedures documented for team operations

---

## Goal

Verify and document the complete domain model where staging.mikeiu.com automatically aliases to the latest main branch deployment while mikeiu.com requires manual promotion, with comprehensive health checks and rollback procedures.

## Why

- **Deployment confidence**: Clear staging environment for testing before production
- **Risk mitigation**: Manual promotion gate prevents broken deployments reaching users
- **Operational clarity**: Team understands exact deployment and rollback procedures
- **Monitoring foundation**: Health checks enable proactive issue detection
- **Domain reliability**: DNS and domain configuration verified and documented

## What

- Verify staging.mikeiu.com automatically aliases to latest main deployments
- Confirm mikeiu.com points to manually promoted production builds
- Validate Cloudflare DNS configuration remains correct after Vercel setup
- Create comprehensive post-deploy health check procedures
- Document fast rollback processes for production issues
- Add operational runbooks to README for team reference

### Success Criteria

- [ ] staging.mikeiu.com resolves to latest main branch deployment
- [ ] mikeiu.com resolves to current production (manually promoted) deployment
- [ ] Cloudflare DNS configuration verified and documented
- [ ] Health check procedures documented and tested
- [ ] Rollback process documented with step-by-step instructions
- [ ] Post-deploy check list added to README
- [ ] Domain resolution verified from multiple locations
- [ ] SSL certificates valid for both domains

## All Needed Context

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- url: https://vercel.com/docs/concepts/projects/domains
  why: Vercel domain configuration and aliasing documentation

- url: https://vercel.com/docs/concepts/deployments/environments
  why: Understanding Vercel environment and promotion workflows

- file: docs/logs/phase-0-log.md
  why: Sections 0.12, 0.13 for existing domain setup context

- url: https://developers.cloudflare.com/dns/
  why: Cloudflare DNS management and verification procedures

- url: https://vercel.com/docs/concepts/deployments/deployments
  why: Deployment management and rollback procedures

- file: .env.example
  why: Environment variables including NEXT_PUBLIC_SITE_URL configuration

- file: apps/web/src/app/api/health/route.ts
  why: Health endpoint for monitoring and checks

- url: https://vercel.com/docs/concepts/analytics
  why: Monitoring and analytics for deployment health
```

### Current Codebase tree

```bash
mikeiu.com/
├── apps/
│   └── web/
│       └── src/
│           └── app/
│               └── api/
│                   └── health/
│                       └── route.ts    # REFERENCE: Health endpoint
├── docs/
│   └── logs/
│       └── phase-0-log.md              # REFERENCE: Domain setup history
├── .env.example                        # REFERENCE: Site URL configuration
└── README.md                           # MODIFY: Add operational procedures
```

### Desired Codebase tree with files to be added

```bash
mikeiu.com/
├── docs/
│   ├── logs/
│   │   └── phase-0-log.md              # EXISTING: Domain setup history
│   └── operations/
│       ├── health-checks.md            # CREATE: Health monitoring procedures
│       ├── deployment-rollback.md      # CREATE: Rollback procedures
│       └── domain-verification.md      # CREATE: DNS verification guide
├── scripts/
│   ├── health-check.sh                 # CREATE: Automated health check script
│   └── verify-domains.sh               # CREATE: Domain verification script
└── README.md                           # MODIFY: Add operational procedures
```

### Known Gotchas of our codebase & Domain Configuration

```bash
# CRITICAL: Vercel domain aliasing behavior
# staging.mikeiu.com should auto-alias to latest main deployment
# mikeiu.com should only change on manual promotion

# CRITICAL: Cloudflare DNS caching
# DNS changes may take time to propagate
# Use Cloudflare's purge cache if immediate verification needed

# GOTCHA: SSL certificate validation
# Both domains need valid SSL certificates
# Vercel automatically provisions Let's Encrypt certificates

# GOTCHA: Health check timing
# Allow time for deployment to fully initialize
# Cold starts may cause temporary 500s immediately after deployment

# PATTERN: Domain verification methods
# 1. Direct HTTP requests to both domains
# 2. DNS lookup verification
# 3. SSL certificate validation
# 4. Response time monitoring

# PATTERN: Rollback procedure
# 1. Identify previous stable deployment
# 2. Promote previous deployment to production
# 3. Verify rollback successful
# 4. Monitor for stability
```

## Implementation Blueprint

### Data models and structure

```yaml
# Domain Model Structure
DOMAIN_MAPPING:
  staging.mikeiu.com:
    target: 'Latest main branch deployment'
    update_method: 'Automatic on main push'
    purpose: 'Pre-production testing and validation'

  mikeiu.com:
    target: 'Manually promoted deployment'
    update_method: 'Manual promotion from staging'
    purpose: 'Production user traffic'

# Health Check Structure
HEALTH_CHECKS:
  endpoints:
    - url: '/api/health'
      expected_status: 200
      expected_body: 'status: ok'
    - url: '/'
      expected_status: 200
      expected_element: 'main content'

  domains:
    - staging.mikeiu.com
    - mikeiu.com

# Rollback Procedure
ROLLBACK_STEPS: 1. "Identify issue and previous stable deployment"
  2. "Access Vercel dashboard deployments"
  3. "Promote previous deployment to production"
  4. "Verify rollback with health checks"
  5. "Monitor stability and user impact"
```

### List of tasks to be completed in order

```yaml
Task 1 - Verify Current Domain Configuration:
  VERIFY staging.mikeiu.com:
    - CHECK automatic aliasing to latest main deployment
    - CONFIRM DNS resolution to Vercel infrastructure
    - VALIDATE SSL certificate and HTTPS redirect

  VERIFY mikeiu.com:
    - CHECK manual promotion requirement
    - CONFIRM production deployment targeting
    - VALIDATE SSL certificate and performance

Task 2 - Validate Cloudflare DNS Configuration:
  CHECK DNS records:
    - VERIFY CNAME records point to Vercel
    - CONFIRM proxy status (orange cloud) appropriate
    - VALIDATE TTL settings for quick updates

  TEST DNS propagation:
    - CHECK from multiple global locations
    - VERIFY both IPv4 and IPv6 resolution
    - CONFIRM consistent responses

Task 3 - Create Health Check Procedures:
  CREATE docs/operations/health-checks.md:
    - DOCUMENT manual health check steps
    - INCLUDE automated script for health validation
    - SPECIFY expected responses and error conditions

  CREATE scripts/health-check.sh:
    - IMPLEMENT automated health endpoint testing
    - ADD domain resolution verification
    - INCLUDE SSL certificate validation

Task 4 - Document Rollback Procedures:
  CREATE docs/operations/deployment-rollback.md:
    - DOCUMENT step-by-step rollback process
    - INCLUDE Vercel dashboard navigation
    - SPECIFY monitoring steps post-rollback

  DOCUMENT emergency procedures:
    - IDENTIFY key personnel and access requirements
    - SPECIFY communication protocols during incidents
    - INCLUDE escalation procedures

Task 5 - Create Domain Verification Tools:
  CREATE scripts/verify-domains.sh:
    - IMPLEMENT DNS resolution testing
    - ADD SSL certificate expiration monitoring
    - INCLUDE response time measurements

  CREATE docs/operations/domain-verification.md:
    - DOCUMENT domain verification procedures
    - INCLUDE troubleshooting common DNS issues
    - SPECIFY monitoring and alerting setup

Task 6 - Update README with Operational Procedures:
  MODIFY README.md:
    - ADD post-deploy health check section
    - INCLUDE quick reference for rollback procedures
    - DOCUMENT domain model and responsibilities
    - LINK to detailed operational documentation
```

### Per task pseudocode

````bash
# Task 3: Health Check Script
# File: scripts/health-check.sh
#!/bin/bash
set -e

STAGING_URL="https://staging.mikeiu.com"
PRODUCTION_URL="https://mikeiu.com"

echo "🔍 Checking domain health..."

# Health endpoint check
check_health() {
  local url=$1
  local response=$(curl -s -w "%{http_code}" "$url/api/health" -o /tmp/health_response)

  if [ "$response" = "200" ]; then
    echo "✅ $url health check passed"
  else
    echo "❌ $url health check failed (HTTP $response)"
    return 1
  fi
}

# SSL certificate check
check_ssl() {
  local domain=$1
  local expiry=$(openssl s_client -connect "$domain:443" -servername "$domain" 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)
  echo "🔒 $domain SSL expires: $expiry"
}

# Run checks
check_health "$STAGING_URL"
check_health "$PRODUCTION_URL"
check_ssl "staging.mikeiu.com"
check_ssl "mikeiu.com"

echo "🎉 All health checks completed"

# Task 4: Rollback Documentation
# File: docs/operations/deployment-rollback.md
# Deployment Rollback Procedures

## Emergency Rollback (5-minute procedure)

1. **Access Vercel Dashboard**
   - Navigate to vercel.com/mikeiu-com/mike-com-web
   - Go to "Deployments" tab

2. **Identify Previous Stable Deployment**
   - Look for the last deployment marked as "Production"
   - Verify timestamp and commit hash
   - Check deployment status is "Ready"

3. **Promote Previous Deployment**
   - Click on the stable deployment
   - Click "Promote to Production"
   - Confirm promotion action

4. **Verify Rollback Success**
   - Run health checks: `./scripts/health-check.sh`
   - Verify mikeiu.com serves expected content
   - Monitor error rates in Vercel analytics

5. **Post-Rollback Monitoring**
   - Watch Vercel function logs for 10 minutes
   - Check user-facing functionality
   - Communicate status to team

## Troubleshooting
- If promotion fails: Contact Vercel support
- If DNS issues: Check Cloudflare configuration
- If SSL problems: Wait 5 minutes for certificate provisioning

# Task 6: README Operational Section
# Addition to README.md
## 🚀 Deployment & Operations

### Domain Model
- **staging.mikeiu.com**: Automatically deploys latest `main` branch
- **mikeiu.com**: Manual promotion from staging required

### Post-Deploy Health Checks
```bash
# Quick health check
./scripts/health-check.sh

# Manual verification
curl https://mikeiu.com/api/health
curl https://staging.mikeiu.com/api/health
````

### Emergency Rollback

See [docs/operations/deployment-rollback.md](docs/operations/deployment-rollback.md) for complete procedures.

Quick rollback:

1. Go to Vercel dashboard → Deployments
2. Find last stable deployment
3. Click "Promote to Production"
4. Verify with health checks

````

### Integration Points

```yaml
VERCEL_INTEGRATION:
  - automatic_aliasing: staging domain updates on main push
  - manual_promotion: production requires explicit action
  - deployment_history: Full rollback capability via dashboard

CLOUDFLARE_INTEGRATION:
  - dns_management: CNAME records to Vercel infrastructure
  - ssl_termination: Cloudflare proxy or Vercel SSL handling
  - cache_management: CDN caching for static assets

MONITORING_INTEGRATION:
  - health_endpoints: /api/health for automated monitoring
  - vercel_analytics: Built-in performance and error tracking
  - custom_scripts: Automated health and domain verification

OPERATIONAL_INTEGRATION:
  - documentation: Complete procedures in docs/operations/
  - automation: Scripts for common verification tasks
  - team_access: Clear responsibilities and access requirements
````

## Validation Loop

### Level 1: Domain Resolution Verification

```bash
# Verify domain DNS resolution
nslookup staging.mikeiu.com
nslookup mikeiu.com

# Test HTTP response
curl -I https://staging.mikeiu.com
curl -I https://mikeiu.com

# Expected: Both domains resolve and return 200 OK
```

### Level 2: Health Check Validation

```bash
# Run automated health checks
./scripts/health-check.sh

# Test health endpoints manually
curl https://staging.mikeiu.com/api/health
curl https://mikeiu.com/api/health

# Verify SSL certificates
./scripts/verify-domains.sh

# Expected: All health checks pass, SSL certificates valid
```

### Level 3: Rollback Procedure Testing

```bash
# Document current production deployment
CURRENT_PROD=$(curl -s https://mikeiu.com | grep "Build ID" || echo "No build ID found")

# Test rollback procedure (in staging first)
# Follow docs/operations/deployment-rollback.md procedures

# Verify rollback capability exists
# Expected: Previous deployments available for promotion
```

## Final validation Checklist

- [ ] staging.mikeiu.com automatically aliases to latest main deployment
- [ ] mikeiu.com points to manually promoted production deployment
- [ ] Cloudflare DNS configuration verified and documented
- [ ] Health check scripts created and tested successfully
- [ ] Rollback procedures documented with step-by-step instructions
- [ ] Domain verification tools created and functional
- [ ] SSL certificates valid for both domains with proper expiration monitoring
- [ ] README updated with operational procedures and quick reference
- [ ] Emergency procedures documented with clear responsibilities

---

## Anti-Patterns to Avoid

- ❌ Don't set up automatic production deployment - manual promotion is a safety gate
- ❌ Don't ignore SSL certificate expiration monitoring
- ❌ Don't skip health check automation - manual checks are error-prone
- ❌ Don't forget to document rollback procedures - emergencies require quick action
- ❌ Don't rely only on Vercel's health - implement custom health endpoints
- ❌ Don't ignore DNS propagation time when making changes
- ❌ Don't skip testing rollback procedures - they must work when needed
