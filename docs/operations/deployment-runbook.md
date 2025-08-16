# Deployment Runbook

This runbook provides step-by-step procedures for deploying, monitoring, and troubleshooting the maicle.co.uk application across the two-environment model.

## Environment Overview

| Environment     | Purpose                  | Domain                                                        | Database                                        | Sanity Dataset | Deployment       |
| --------------- | ------------------------ | ------------------------------------------------------------- | ----------------------------------------------- | -------------- | ---------------- |
| **Development** | Testing, content staging | Local: `localhost:3000`<br>Preview: `mike-com-web.vercel.app` | Local: Docker Supabase<br>Preview: mike-staging | `development`  | Auto (PRs)       |
| **Production**  | Live application         | `mikeiu.com`                                                  | mike-prod                                       | `production`   | Manual promotion |

## Deployment Workflows

### 1. Local Development Deployment

**Purpose**: Local development and testing

**Prerequisites**:

- Docker Desktop running
- Node.js ≥18 and pnpm installed
- Environment variables in `.env.local`

**Steps**:

```bash
# 1. Start local database
pnpm db:start
# ✅ Supabase Studio available at http://localhost:54323

# 2. Start development server
pnpm dev
# ✅ Application available at http://localhost:3000

# 3. Verify health endpoint
curl http://localhost:3000/api/health
# Expected: {"status":"ok","service":"web","timestamp":"..."}
```

**Rollback**:

- Stop services: `pnpm db:stop && Ctrl+C` on dev server
- Reset database if needed: `pnpm db:reset`

---

### 2. Preview Deployment (Automatic)

**Purpose**: Testing features on pull requests

**Trigger**: Opening/updating a pull request to main branch

**Automatic Process**:

1. **Quality Checks**: TypeScript, ESLint, tests, build
2. **Vercel Deployment**: Auto-deploy to `mike-com-web.vercel.app` subdomain
3. **Preview URL**: Available in PR comments and Vercel dashboard

**Verification**:

```bash
# Check preview deployment health
curl https://mike-com-web-git-[branch-name]-mikeiu-com.vercel.app/api/health

# Expected response
{
  "status": "ok",
  "service": "web",
  "timestamp": "2025-01-XX:XX:XX.XXXZ"
}
```

**Environment Configuration**:

- Database: mike-staging (`qijxfigergpnuqbaxtjv`)
- Sanity: development dataset
- Vendor keys: Test/sandbox mode

**Troubleshooting**:

- **Preview fails to deploy**: Check Vercel dashboard for build logs
- **Database connection issues**: Verify Supabase credentials in Vercel
- **Build failures**: Check PR workflow logs in GitHub Actions

---

### 3. Staging Deployment (Main Branch)

**Purpose**: Pre-production validation with database migrations

**Trigger**: Push to main branch (typically after PR merge)

**Automatic Process**:

#### Stage 1: Quality Checks

```yaml
- Dependency installation and caching
- TypeScript checking: pnpm typecheck
- ESLint validation: pnpm lint
- Application build: pnpm build
- Storybook build: pnpm --filter @maicle/ui build-storybook
- Artifact upload for deployment
```

#### Stage 2: Staging Deployment

```yaml
- Supabase migration application:
    - Link to mike-staging project
    - Dry-run validation: supabase db push --dry-run
    - Migration application: supabase db push
- Vercel deployment to staging
- Domain aliasing to staging.mikeiu.com
```

#### Stage 3: Smoke Testing

```yaml
- Health endpoint validation
- Homepage rendering verification
- Static asset loading checks
- Console error monitoring
- Environment configuration validation
```

**Manual Monitoring**:

```bash
# Check GitHub Actions progress
gh run list --workflow="Main Pipeline" --limit 1

# Monitor staging deployment
curl https://staging.mikeiu.com/api/health

# View smoke test results
gh run view [run-id] --log
```

**Success Criteria**:

- ✅ All quality checks pass
- ✅ Database migration successful (no conflicts)
- ✅ Staging deployment accessible
- ✅ All smoke tests pass
- ✅ Manual approval gate activated

**Failure Scenarios & Actions**:

| Issue                  | Symptoms                 | Action                                                                                                              |
| ---------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| **Migration Failure**  | Supabase CLI errors      | 1. Review migration syntax<br>2. Test locally: `pnpm db:reset && pnpm db:start`<br>3. Create compensating migration |
| **Build Failure**      | TypeScript/ESLint errors | 1. Fix code issues<br>2. Push correction to main<br>3. New pipeline triggers automatically                          |
| **Smoke Test Failure** | Test assertions fail     | 1. Check staging.mikeiu.com manually<br>2. Review Playwright logs<br>3. Fix issues and redeploy                     |

---

### 4. Production Promotion (Manual)

**Purpose**: Deploy validated staging build to production

**Trigger**: Manual approval after staging validation passes

**Prerequisites**:

- ✅ Staging deployment successful
- ✅ All smoke tests passed
- ✅ Manual review completed

**Manual Approval Process**:

1. **Navigate to GitHub Actions**:

   ```bash
   # Open the pending workflow
   gh run list --workflow="Main Pipeline" --limit 1
   gh run view [run-id] --web
   ```

2. **Review Staging**:
   - Visit https://staging.mikeiu.com
   - Test critical functionality manually
   - Review smoke test results

3. **Approve Production Deployment**:
   - Click "Review deployments" in GitHub Actions UI
   - Select "production" environment
   - Click "Approve and deploy"

**Automatic Production Process**:

```yaml
- Same build artifact promotion (no rebuild)
- Vercel promotion to mikeiu.com
- Production domain alias update
- Post-deployment health checks
```

**Verification**:

```bash
# Verify production deployment
curl https://mikeiu.com/api/health

# Check production environment specific config
# Should use mike-prod database and production Sanity dataset
```

**Success Indicators**:

- ✅ Production health check passes
- ✅ Same build version as staging
- ✅ Production environment variables active
- ✅ No deployment errors in logs

---

## Emergency Procedures

### Production Rollback

**When to Use**: Critical production issues requiring immediate reversion

**Steps**:

1. **Immediate Rollback via Vercel**:

   ```bash
   # List recent deployments
   vercel list --prod

   # Promote previous stable deployment
   vercel promote [previous-deployment-url] --prod

   # Update production alias
   vercel alias [previous-deployment-url] mikeiu.com
   ```

2. **Database Rollback** (if migration caused issues):

   ```bash
   # Create compensating migration
   # NEVER drop data - create rollback logic
   pnpm db:diff  # Generate rollback migration

   # Apply via emergency CI/CD or manual:
   pnpm db:link:prod
   supabase db push --dry-run  # Validate first
   supabase db push           # Apply rollback
   ```

3. **Verify Rollback**:
   ```bash
   curl https://mikeiu.com/api/health
   # Test critical functionality manually
   ```

**Communication**:

- Update team in designated communication channel
- Document incident for post-mortem
- Monitor error rates and user reports

### Migration Recovery

**When to Use**: Database migration failures or conflicts

**Recovery Steps**:

1. **Assess Damage**:

   ```bash
   # Check current migration status
   pnpm db:link:staging  # or :prod for production
   supabase migration list
   ```

2. **Create Fix Migration**:

   ```sql
   -- Example compensating migration
   -- Fix migration: 20250116123456_fix_column_type.sql

   -- Rollback problematic change safely
   ALTER TABLE users ALTER COLUMN created_at SET DEFAULT now();

   -- Add missing constraint
   ALTER TABLE profiles ADD CONSTRAINT fk_user_id
     FOREIGN KEY (user_id) REFERENCES users(id);
   ```

3. **Test and Apply**:

   ```bash
   # Test locally
   pnpm db:reset && pnpm db:start

   # Apply to staging via CI/CD
   git add supabase/migrations/ && git commit -m "fix(db): resolve migration conflict"
   git push origin main
   ```

---

## Monitoring and Health Checks

### Automated Monitoring

**Health Endpoints**:

- Local: `http://localhost:3000/api/health`
- Staging: `https://staging.mikeiu.com/api/health`
- Production: `https://mikeiu.com/api/health`

**Expected Response**:

```json
{
  "status": "ok",
  "service": "web",
  "timestamp": "2025-01-16T12:34:56.789Z"
}
```

**CI/CD Pipeline Monitoring**:

```bash
# Monitor active workflows
gh run list --workflow="Main Pipeline"

# Watch specific run
gh run watch [run-id]

# View detailed logs
gh run view [run-id] --log
```

### Manual Health Checks

**Pre-Deployment Checklist**:

- [ ] Local development environment working
- [ ] All tests passing locally
- [ ] Database migrations tested
- [ ] No console errors in browser
- [ ] Critical user paths functional

**Post-Deployment Verification**:

- [ ] Health endpoint responds correctly
- [ ] Homepage loads without errors
- [ ] Database connectivity confirmed
- [ ] Static assets loading
- [ ] Environment-specific configuration active

---

## Troubleshooting Guide

### Common Issues

#### 1. "GitHub Secrets Not Found"

**Symptoms**: CI/CD pipeline fails with authentication errors

**Solution**:

1. Verify required secrets in GitHub repository settings
2. Follow [GitHub Pipeline Setup Guide](./github-pipeline-setup.md)
3. Required secrets:
   - `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
   - `SUPABASE_ACCESS_TOKEN`, `SUPABASE_STAGING_PROJECT_REF`, `SUPABASE_PROD_PROJECT_REF`

#### 2. "Migration Conflict"

**Symptoms**: `supabase db push` fails with schema conflicts

**Solution**:

```bash
# Pull latest remote schema
supabase db pull --linked

# Reset local and reapply
pnpm db:reset && pnpm db:start

# Regenerate migration
pnpm db:diff
```

#### 3. "Vercel Deployment Failed"

**Symptoms**: Build succeeds but deployment fails

**Solution**:

1. Check Vercel dashboard for detailed error logs
2. Verify environment variables are set correctly
3. Ensure build artifacts are properly uploaded
4. Check for resource limits or quotas

#### 4. "Smoke Tests Failing"

**Symptoms**: Playwright tests fail against staging

**Solution**:

```bash
# Run tests locally against staging
PLAYWRIGHT_BASE_URL=https://staging.mikeiu.com pnpm e2e:smoke:debug

# Check specific failures
pnpm exec playwright show-report
```

#### 5. "Production Health Check Failed"

**Symptoms**: `/api/health` returns errors after promotion

**Solution**:

1. **Immediate**: Rollback to previous deployment
2. **Investigation**: Check environment variables alignment
3. **Fix**: Identify root cause and create hotfix
4. **Redeploy**: Through normal staging → production flow

---

## Performance & Security

### Performance Monitoring

- **Target Metrics**: TTFB < 300ms, LCP < 2.5s
- **Monitoring**: Vercel Analytics + PostHog (when configured)
- **Alerts**: Set up for response time degradation

### Security Checks

- ✅ All secrets in Vercel environment variables
- ✅ No secrets committed to repository
- ✅ Environment isolation maintained
- ✅ Production requires manual approval
- ✅ RLS policies (when implemented in Phase 1)

---

## Contacts & Resources

### Documentation

- [Environment Variables](../ENVIRONMENT.md)
- [GitHub Pipeline Setup](./github-pipeline-setup.md)
- [Supabase Migration Guide](../../supabase/README.md)
- [Phase 0 Log](../logs/phase-0-log.md)

### Quick Commands Reference

```bash
# Local development
pnpm dev                     # Start dev server
pnpm db:start               # Start local database

# Testing
pnpm e2e:smoke              # Run smoke tests locally
pnpm typecheck && pnpm lint # Quality checks

# Deployment monitoring
gh run list --workflow="Main Pipeline"
vercel list --prod

# Emergency
vercel promote [url] --prod  # Rollback production
```

### Status Indicators

| Status                     | Meaning                             | Action Required                              |
| -------------------------- | ----------------------------------- | -------------------------------------------- |
| 🟢 All systems operational | Normal deployment flow available    | None                                         |
| 🟡 Staging issues          | Can deploy locally, staging blocked | Fix staging issues before production         |
| 🔴 Production down         | Critical service interruption       | Immediate rollback and investigation         |
| ⚠️ Manual intervention     | CI/CD pipeline needs attention      | Review workflow logs and fix blocking issues |

**Last Updated**: 2025-01-16  
**Version**: 1.0 (Two-Environment Model)
