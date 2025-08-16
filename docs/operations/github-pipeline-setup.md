# GitHub Pipeline Setup Guide

This guide provides step-by-step instructions to configure GitHub repository secrets and environment protection rules required for the CI/CD pipeline to function.

## Overview

The current CI/CD pipeline is **BLOCKED** because critical GitHub secrets are not configured. This document provides the exact steps needed to enable automated deployments.

## Required Repository Secrets

These secrets must be added to the GitHub repository to enable CI/CD functionality.

### 1. Vercel Integration Secrets

**Purpose**: Enable automatic deployments to Vercel from GitHub Actions.

| Secret Name         | How to Obtain                                       | Example Value                      |
| ------------------- | --------------------------------------------------- | ---------------------------------- |
| `VERCEL_TOKEN`      | Vercel Dashboard → Settings → Tokens → Create Token | `vercel_12345...`                  |
| `VERCEL_ORG_ID`     | Vercel Project → Settings → General → Team ID       | `team_12345...`                    |
| `VERCEL_PROJECT_ID` | Vercel Project → Settings → General → Project ID    | `prj_wN2kD7lvIqP0BjopkvC9yd9Xl17f` |

#### Steps to Get Vercel Secrets:

1. **Get VERCEL_TOKEN**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Navigate to Settings → Tokens
   - Click "Create Token"
   - Name: "GitHub Actions CI/CD"
   - Expiration: No expiration (or set to desired duration)
   - Scope: Full Account
   - Copy the generated token

2. **Get VERCEL_ORG_ID and VERCEL_PROJECT_ID**:
   - Go to your Vercel project dashboard
   - Navigate to Settings → General
   - Copy "Team ID" (this is your ORG_ID)
   - Copy "Project ID"

### 2. Supabase Integration Secrets

**Purpose**: Enable database migrations and project linking from CI/CD.

| Secret Name                    | Value                  | How to Obtain                                |
| ------------------------------ | ---------------------- | -------------------------------------------- |
| `SUPABASE_ACCESS_TOKEN`        | Personal access token  | Supabase Dashboard → Account → Access tokens |
| `SUPABASE_STAGING_PROJECT_REF` | `qijxfigergpnuqbaxtjv` | mike-staging project reference               |
| `SUPABASE_PROD_PROJECT_REF`    | `pzgczflyltjyxwqyteuj` | mike-prod project reference                  |

#### Steps to Get Supabase Secrets:

1. **Get SUPABASE_ACCESS_TOKEN**:
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Click on your profile → Account settings
   - Navigate to "Access tokens"
   - Click "Generate new token"
   - Name: "GitHub Actions CI/CD"
   - Copy the generated token

2. **Project References** (already known):
   - `SUPABASE_STAGING_PROJECT_REF`: `qijxfigergpnuqbaxtjv`
   - `SUPABASE_PROD_PROJECT_REF`: `pzgczflyltjyxwqyteuj`

## Adding Secrets to GitHub Repository

### Via GitHub Web Interface:

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add each secret with the exact name and value from the tables above

### Via GitHub CLI:

```bash
# Vercel secrets
gh secret set VERCEL_TOKEN --body "your_vercel_token_here"
gh secret set VERCEL_ORG_ID --body "your_vercel_org_id_here"
gh secret set VERCEL_PROJECT_ID --body "prj_wN2kD7lvIqP0BjopkvC9yd9Xl17f"

# Supabase secrets
gh secret set SUPABASE_ACCESS_TOKEN --body "your_supabase_access_token_here"
gh secret set SUPABASE_STAGING_PROJECT_REF --body "qijxfigergpnuqbaxtjv"
gh secret set SUPABASE_PROD_PROJECT_REF --body "pzgczflyltjyxwqyteuj"
```

## GitHub Environment Protection Rules

### Current State

- ✅ **Preview** environment exists (no protection needed)
- ✅ **Production** environment exists
- ❌ **Production environment protection rules** missing

### Required Production Environment Configuration

#### Via GitHub Web Interface:

1. Go to repository **Settings** → **Environments**
2. Click on **"Production"** environment
3. Configure protection rules:

   **Protection Rules:**
   - ☑️ **Required reviewers**: 1 reviewer
   - ☑️ **Deployment branches**: Limit to `main` branch only
   - ☑️ **Wait timer**: 0 minutes (manual approval sufficient)

   **Environment secrets** (if different from repository-level):
   - Not needed - use repository secrets

4. **Reviewers**: Add yourself or team members who can approve production deployments

#### Via GitHub CLI:

```bash
# Configure production environment protection
gh api -X PUT repos/:owner/:repo/environments/production \
  --field protection_rules='[
    {
      "type": "required_reviewers",
      "reviewers": [{"type": "User", "id": YOUR_USER_ID}]
    },
    {
      "type": "branch_policy",
      "branch_policy": {"protected_branches": true, "custom_branch_policies": false}
    }
  ]'
```

## Environment Protection Summary

| Environment    | Auto Deploy  | Manual Approval   | Branch Restrictions | Purpose          |
| -------------- | ------------ | ----------------- | ------------------- | ---------------- |
| **Preview**    | ✅ Yes (PRs) | ❌ No             | Any branch          | Testing, review  |
| **Production** | ❌ No        | ✅ Yes (required) | `main` only         | Live application |

## Verification Commands

After configuring all secrets and protection rules, verify the setup:

```bash
# Verify secrets are configured
gh secret list

# Verify environment configuration
gh api repos/:owner/:repo/environments

# Test secret access (this should show masked values)
gh run list --workflow="Main Pipeline" --limit 1
```

## Expected Output After Configuration

### Secrets List:

```
SUPABASE_ACCESS_TOKEN    Updated YYYY-MM-DD
SUPABASE_PROD_PROJECT_REF Updated YYYY-MM-DD
SUPABASE_STAGING_PROJECT_REF Updated YYYY-MM-DD
VERCEL_ORG_ID           Updated YYYY-MM-DD
VERCEL_PROJECT_ID       Updated YYYY-MM-DD
VERCEL_TOKEN            Updated YYYY-MM-DD
```

### Environment List:

```json
{
  "environments": [
    {
      "name": "Preview",
      "protection_rules": []
    },
    {
      "name": "Production",
      "protection_rules": [
        {"type": "required_reviewers", "reviewers": [...]}
      ]
    }
  ]
}
```

## Pipeline Flow After Configuration

1. **PR Created**: Automatic preview deployment to `mike-com-web.vercel.app`
2. **PR Merged to Main**:
   - Quality checks (typecheck, lint, build)
   - Deploy to staging (`mike-com-web.vercel.app` with alias)
   - Apply Supabase migrations to staging
   - Run smoke tests against staging
   - **WAIT** for manual approval
3. **Manual Approval**: Production deployment promotion to `mikeiu.com`
4. **Post-deployment**: Health checks and verification

## Security Notes

- ✅ All secrets are masked in GitHub Actions logs
- ✅ Secrets are only accessible to authorized workflows
- ✅ Production environment requires manual approval
- ✅ Branch restrictions prevent unauthorized deployments
- ⚠️ **Do not** commit secrets to repository code
- ⚠️ **Rotate tokens** if compromised

## Troubleshooting

### Common Issues:

1. **"Secret not found" errors**:
   - Verify secret names match exactly (case-sensitive)
   - Ensure secrets are set at repository level, not environment level

2. **"Insufficient permissions" errors**:
   - Verify Vercel token has correct permissions
   - Verify Supabase token has project access

3. **Production deployment blocked**:
   - Check if protection rules are configured correctly
   - Verify required reviewers are available

4. **Migration failures**:
   - Verify Supabase project references are correct
   - Check if migrations are compatible with target database version

## Next Steps

After completing this setup:

1. ✅ Test PR workflow with a small change
2. ✅ Test main pipeline deployment to staging
3. ✅ Test manual production promotion approval
4. ✅ Verify end-to-end deployment flow
5. ✅ Document any additional operational procedures

**Status**: 🔴 **BLOCKED** - Secrets not configured  
**Action Required**: Follow this guide to configure all required secrets and protection rules
