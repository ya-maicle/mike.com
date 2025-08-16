# Pipeline Validation Guide

This document provides comprehensive validation procedures to test the complete development pipeline from local development through production deployment.

## Validation Overview

### Pipeline Status: ✅ READY FOR TESTING

All components are configured and ready for end-to-end validation:

- ✅ GitHub secrets configured (6/6)
- ✅ Environment protection rules active
- ✅ Vercel environment variables set (35/35)
- ✅ Database projects separated (mike-staging/mike-prod)
- ✅ Smoke tests enhanced and ready
- ✅ Health endpoints operational

## Validation Levels

### Level 1: Configuration Verification ✅ COMPLETED

**Purpose**: Verify all secrets and environment configuration

```bash
# Verify GitHub secrets are configured
gh secret list
# Expected: 6 secrets (VERCEL_*, SUPABASE_*)

# Check GitHub environments
gh api repos/:owner/:repo/environments --jq '.environments[] | {name: .name, protection_rules: .protection_rules}'
# Expected: Preview (no protection), Production (manual approval)

# Verify Vercel environment variables
vercel env ls
# Expected: 35+ environment variables across Preview/Production
```

**✅ Status**: All configuration verified and documented

---

### Level 2: Pipeline Functionality Testing

**Purpose**: End-to-end pipeline validation

#### Test 1: PR Workflow Validation

**Prerequisites**:

- Working git repository
- GitHub repository with configured workflows

**Steps**:

1. **Create Test Branch**:

   ```bash
   git checkout -b test/pipeline-validation
   echo "// Pipeline validation test" >> apps/web/src/app/page.tsx
   git add apps/web/src/app/page.tsx
   git commit -m "test: validate PR pipeline functionality"
   git push origin test/pipeline-validation
   ```

2. **Create Pull Request**:

   ```bash
   gh pr create \
     --title "Test: Validate PR Pipeline" \
     --body "Testing complete PR workflow including quality checks and preview deployment" \
     --base main \
     --head test/pipeline-validation
   ```

3. **Monitor PR Checks**:

   ```bash
   # Monitor workflow progress
   gh pr checks test/pipeline-validation --watch

   # Expected checks to pass:
   # - Setup and dependency installation
   # - TypeScript checking
   # - ESLint validation
   # - Application build
   # - Storybook build
   ```

4. **Verify Preview Deployment**:

   ```bash
   # Get preview URL from PR
   gh pr view test/pipeline-validation --json url,statusCheckRollup

   # Test preview deployment health
   curl https://mike-com-web-git-test-pipeline-validation-mikeiu-com.vercel.app/api/health

   # Expected response:
   # {"status":"ok","service":"web","timestamp":"..."}
   ```

**Success Criteria**:

- ✅ All quality checks pass
- ✅ Preview deployment accessible
- ✅ Health endpoint responds correctly
- ✅ No secrets exposed in logs

---

#### Test 2: Main Pipeline Deployment

**Prerequisites**:

- Test PR from Test 1 merged or new change on main
- All GitHub secrets configured

**Steps**:

1. **Trigger Main Pipeline**:

   ```bash
   # Option A: Merge test PR
   gh pr merge test/pipeline-validation --squash

   # Option B: Direct commit to main (for testing)
   git checkout main
   git pull origin main
   echo "// Main pipeline test $(date)" >> apps/web/src/app/page.tsx
   git add apps/web/src/app/page.tsx
   git commit -m "test: trigger main pipeline deployment"
   git push origin main
   ```

2. **Monitor Main Workflow**:

   ```bash
   # Watch workflow execution
   gh run list --workflow="Main Pipeline" --limit 1
   gh run watch [run-id]
   ```

3. **Monitor Staging Deployment**:

   ```bash
   # Wait for staging deployment to complete
   # Check staging health endpoint
   curl https://staging.mikeiu.com/api/health

   # Expected response:
   # {"status":"ok","service":"web","timestamp":"..."}
   ```

4. **Verify Smoke Tests**:

   ```bash
   # Monitor smoke test execution in workflow logs
   gh run view [run-id] --log | grep -A 10 -B 10 "smoke"

   # Expected: All smoke tests pass
   # - Health API returns 200
   # - Homepage renders correctly
   # - Static assets load successfully
   # - No console errors
   # - Environment verification
   ```

**Success Criteria**:

- ✅ Quality checks pass
- ✅ Supabase migrations apply successfully (if any)
- ✅ Staging deployment accessible
- ✅ All smoke tests pass
- ✅ Manual approval gate activated

---

#### Test 3: Production Promotion

**Prerequisites**:

- Main pipeline deployment successful (Test 2)
- Staging validation passed
- Manual approval ready

**Steps**:

1. **Manual Staging Review**:

   ```bash
   # Test staging environment manually
   curl https://staging.mikeiu.com/api/health
   curl https://staging.mikeiu.com/

   # Verify staging environment configuration
   # - Database: mike-staging
   # - Sanity: development dataset
   # - Vendor keys: test mode
   ```

2. **Approve Production Deployment**:

   ```bash
   # View pending workflow
   gh run list --workflow="Main Pipeline" --status=waiting --limit 1

   # Open workflow in browser for approval
   gh run view [run-id] --web

   # In GitHub UI:
   # 1. Click "Review deployments"
   # 2. Select "production" environment
   # 3. Click "Approve and deploy"
   ```

3. **Monitor Production Promotion**:

   ```bash
   # Watch production deployment progress
   gh run watch [run-id]

   # Expected steps:
   # - Vercel deployment promotion
   # - Domain alias update to mikeiu.com
   # - Post-deployment health checks
   ```

4. **Verify Production Deployment**:

   ```bash
   # Test production health endpoint
   curl https://mikeiu.com/api/health

   # Expected response:
   # {"status":"ok","service":"web","timestamp":"..."}

   # Verify production environment configuration
   # - Database: mike-prod
   # - Sanity: production dataset
   # - Vendor keys: live mode (when configured)
   ```

**Success Criteria**:

- ✅ Manual approval process works
- ✅ Same build promoted (no rebuild)
- ✅ Production domain updated
- ✅ Production health checks pass
- ✅ Environment variables correct

---

### Level 3: End-to-End Validation

**Purpose**: Complete pipeline validation with rollback testing

#### Test 4: Pipeline Integration Test

**Complete Workflow Test**:

1. **Feature Development**:
   - Create feature branch
   - Make changes locally
   - Test local development environment
   - Push and create PR

2. **PR Review Process**:
   - Automated quality checks pass
   - Preview deployment successful
   - Code review and approval
   - Merge to main

3. **Staging Deployment**:
   - Automatic deployment triggers
   - Database migrations (if any) apply
   - Smoke tests validate deployment
   - Manual review of staging

4. **Production Promotion**:
   - Manual approval granted
   - Production deployment successful
   - Health checks pass
   - Production verification

**Expected Timeline**: 5-10 minutes total (excluding manual review time)

---

## Emergency Testing Procedures

### Rollback Validation

**Purpose**: Verify emergency rollback procedures work

**Test Rollback**:

1. **Identify Previous Deployment**:

   ```bash
   vercel list --prod --limit 5
   ```

2. **Execute Rollback**:

   ```bash
   # Promote previous deployment
   vercel promote [previous-deployment-url] --prod

   # Update production alias
   vercel alias [previous-deployment-url] mikeiu.com
   ```

3. **Verify Rollback**:
   ```bash
   curl https://mikeiu.com/api/health
   # Should return to previous state
   ```

### Migration Recovery Test

**Purpose**: Test database migration failure recovery

**Test Scenario**:

1. **Create Test Migration** (in development):

   ```bash
   # Create intentionally failing migration for testing
   pnpm db:start
   # Apply problematic migration locally
   pnpm db:diff
   ```

2. **Test Recovery**:

   ```bash
   # Reset local database
   pnpm db:reset && pnpm db:start

   # Create compensating migration
   pnpm db:diff
   ```

3. **Verify Fix**:
   ```bash
   # Apply corrected migration
   git add supabase/migrations/
   git commit -m "fix(db): compensating migration"
   ```

---

## Monitoring and Alerting Validation

### Health Check Monitoring

**Automated Health Checks**:

```bash
# Script to monitor all environments
#!/bin/bash

# Local (if running)
curl -f http://localhost:3000/api/health || echo "Local not running"

# Staging
curl -f https://staging.mikeiu.com/api/health || echo "Staging health check failed"

# Production
curl -f https://mikeiu.com/api/health || echo "Production health check failed"
```

### Performance Validation

**Response Time Monitoring**:

```bash
# Test response times
time curl https://mikeiu.com/api/health
time curl https://mikeiu.com/

# Expected: < 500ms for health endpoint, < 2s for homepage
```

---

## Validation Checklist

### ✅ Pre-Deployment Validation

- [ ] All GitHub secrets configured and verified
- [ ] Environment protection rules active
- [ ] Vercel environment variables aligned
- [ ] Database projects properly separated
- [ ] Local development environment operational

### ✅ Pipeline Validation

- [ ] PR workflow completes successfully
- [ ] Preview deployments accessible
- [ ] Main pipeline deploys to staging
- [ ] Smoke tests pass consistently
- [ ] Manual approval gate functions
- [ ] Production promotion works
- [ ] Same build promoted (verified)

### ✅ Security Validation

- [ ] No secrets exposed in logs
- [ ] Environment isolation maintained
- [ ] Manual approval required for production
- [ ] Rollback procedures functional
- [ ] Access controls verified

### ✅ Performance Validation

- [ ] Health endpoints respond < 500ms
- [ ] Build process completes < 5 minutes
- [ ] Deployment process completes < 10 minutes
- [ ] Smoke tests complete < 2 minutes

---

## Troubleshooting Guide

### Common Validation Issues

#### "GitHub Secrets Not Found"

**Solution**:

```bash
gh secret list
# Verify all 6 secrets present, re-add if missing
```

#### "Vercel Deployment Failed"

**Solution**:

```bash
vercel env ls
# Verify environment variables, check Vercel dashboard logs
```

#### "Smoke Tests Failing"

**Solution**:

```bash
# Run tests locally
PLAYWRIGHT_BASE_URL=https://staging.mikeiu.com pnpm e2e:smoke:debug
```

#### "Production Approval Not Required"

**Solution**:

```bash
# Verify environment protection
gh api repos/:owner/:repo/environments/production
```

---

## Success Metrics

### Pipeline Performance

| Metric                   | Target      | Current Status   |
| ------------------------ | ----------- | ---------------- |
| **PR Build Time**        | < 5 minutes | ✅ Ready to test |
| **Staging Deploy Time**  | < 3 minutes | ✅ Ready to test |
| **Smoke Test Duration**  | < 2 minutes | ✅ Ready to test |
| **Production Promotion** | < 1 minute  | ✅ Ready to test |

### Reliability Targets

| Metric                      | Target      | Current Status      |
| --------------------------- | ----------- | ------------------- |
| **Pipeline Success Rate**   | > 95%       | ✅ Ready to measure |
| **Deployment Success Rate** | > 99%       | ✅ Ready to measure |
| **Rollback Time**           | < 5 minutes | ✅ Ready to test    |

---

## Next Steps

### Immediate Validation

1. **Execute Level 2 Testing**: Run complete PR and main pipeline tests
2. **Verify Production Promotion**: Test manual approval and deployment
3. **Document Results**: Record any issues and resolutions

### Ongoing Monitoring

1. **Set Up Monitoring**: Implement health check monitoring
2. **Performance Tracking**: Monitor deployment times and success rates
3. **Regular Testing**: Schedule monthly full pipeline validation

**Validation Status**: 🟢 **READY FOR TESTING**  
**Last Updated**: 2025-08-16  
**Next Review**: After first production deployment
