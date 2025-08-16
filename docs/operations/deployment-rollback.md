# Deployment Rollback Procedures

This document provides step-by-step procedures for rolling back deployments in case of production issues, covering both emergency rollbacks and planned rollbacks.

## Emergency Rollback (5-minute procedure)

When production is experiencing critical issues and immediate rollback is required:

### 1. Access Vercel Dashboard

```bash
# Open Vercel dashboard in browser
open https://vercel.com/mikeiu-com/mike-com-web
```

Or navigate manually:

- Go to [vercel.com](https://vercel.com)
- Select the `mike-com-web` project
- Click on "Deployments" tab

### 2. Identify Previous Stable Deployment

In the Deployments view:

- Look for the last deployment marked as "Production" (before the current one)
- Verify the deployment has:
  - ✅ Status: "Ready"
  - ✅ Recent timestamp (within expected timeframe)
  - ✅ Commit hash from a known stable state
  - ✅ No error indicators

**Key indicators of a stable deployment:**

- Green "Ready" status
- No build errors or warnings
- Successful health checks in the logs
- Commit from main branch

### 3. Promote Previous Deployment

To rollback to the previous stable deployment:

1. Click on the stable deployment row
2. In the deployment details page, click "Promote to Production"
3. Confirm the promotion action in the modal dialog
4. Wait for confirmation message "Deployment promoted to production"

**Timeline: This typically takes 30-60 seconds**

### 4. Verify Rollback Success

Immediately after promotion, run verification checks:

```bash
# Automated verification
./scripts/health-check.sh

# Manual verification
curl https://mikeiu.com/api/health
curl https://mikeiu.com/

# Expected: Both should return 200 OK responses
```

**Verification checklist:**

- [ ] Health endpoint returns 200 OK
- [ ] Main site loads correctly
- [ ] No 5xx errors in Vercel function logs
- [ ] Response times are normal (<2s)

### 5. Post-Rollback Monitoring

Monitor the rolled-back deployment for stability:

1. **Watch Vercel function logs** for 10 minutes
2. **Check user-facing functionality** (key user flows)
3. **Monitor error rates** in Vercel analytics
4. **Communicate status** to team and stakeholders

```bash
# Monitor logs in real-time
vercel logs --follow mike-com-web

# Or check via dashboard
open https://vercel.com/mikeiu-com/mike-com-web/functions
```

## Planned Rollback Procedure

For non-emergency rollbacks (testing, planned changes, etc.):

### 1. Document Current State

Before rolling back, document the current deployment:

```bash
# Get current deployment info
CURRENT_DEPLOYMENT=$(curl -s https://mikeiu.com | grep -o 'deployment-[a-zA-Z0-9]*' | head -1)
echo "Current deployment: $CURRENT_DEPLOYMENT" >> rollback-log.txt
date >> rollback-log.txt

# Run health check and save results
./scripts/health-check.sh > "health-before-rollback-$(date +%Y%m%d-%H%M).txt"
```

### 2. Identify Target Deployment

Choose the deployment to rollback to:

- **By commit**: Find deployment from specific commit hash
- **By date**: Find deployment from specific time period
- **By version**: Find deployment from specific release tag

### 3. Perform Staged Rollback

Test the rollback first on staging:

1. Promote target deployment to staging.mikeiu.com alias
2. Run full health checks on staging
3. Validate functionality works as expected
4. Only then promote to production

### 4. Execute Production Rollback

Follow the same steps as emergency rollback but with additional verification:

- [ ] Stakeholder notification sent
- [ ] Staging validation completed
- [ ] Rollback window scheduled
- [ ] Team members available for monitoring

## Rollback Verification Checklist

After any rollback, complete this verification checklist:

### Technical Verification

- [ ] Health endpoint returns correct response
- [ ] Main site loads without errors
- [ ] SSL certificates are valid
- [ ] DNS resolution is correct
- [ ] Response times are within normal range
- [ ] No errors in Vercel function logs

### Functional Verification

- [ ] User authentication works (if applicable)
- [ ] API endpoints respond correctly
- [ ] Static assets load properly
- [ ] Forms and interactive elements function
- [ ] Database connectivity is stable (via health endpoint)

### Monitoring Verification

- [ ] Error rates have decreased to acceptable levels
- [ ] Performance metrics are within normal range
- [ ] No alerts are firing
- [ ] User reports of issues have stopped

## Troubleshooting Common Rollback Issues

### Issue: Rollback Deployment Not Available

**Symptoms:** Target deployment not found in Vercel dashboard
**Resolution:**

1. Check if deployment was deleted or expired
2. Look for the deployment in older pages of deployment history
3. If not found, deploy from the target commit hash manually

```bash
# Deploy from specific commit
git checkout <target-commit-hash>
vercel deploy --prod
```

### Issue: Rollback Completes but Site Still Broken

**Symptoms:** Rollback shows success but health checks still fail
**Resolution:**

1. Clear CDN cache if using Cloudflare proxy
2. Wait 2-3 minutes for DNS propagation
3. Check if the issue existed in the target deployment too
4. Consider rolling back to an earlier deployment

### Issue: SSL Certificate Issues After Rollback

**Symptoms:** HTTPS errors or certificate warnings
**Resolution:**

1. Wait 5 minutes for automatic certificate provisioning
2. Check domain configuration in Vercel dashboard
3. Verify DNS records are pointing to Vercel correctly

### Issue: Rollback Fails to Complete

**Symptoms:** "Promote to Production" action fails or times out
**Resolution:**

1. Refresh the Vercel dashboard and try again
2. Check Vercel status page for ongoing incidents
3. Contact Vercel support if the issue persists
4. Consider manual deployment as fallback

## Communication Procedures

### During Emergency Rollback

**Immediate communication (within 2 minutes):**

- Post in team chat: "🚨 Production issue detected, initiating emergency rollback"
- Include brief description of the issue
- Mention expected resolution time (5-10 minutes)

**Progress updates:**

- "✅ Rollback initiated, verifying..."
- "✅ Rollback completed, monitoring stability"
- "✅ All clear, issue resolved"

### Stakeholder Notification Template

```
Subject: Production Rollback Completed - [Brief Description]

A production issue was detected at [TIME] requiring an emergency rollback.

Issue: [Brief description of the problem]
Action: Rolled back to deployment [DEPLOYMENT_ID] from [DATE]
Status: ✅ Resolved - Service is operational
Impact: [Duration and scope of impact]

The site is now stable and all health checks are passing.
Next steps: [Investigation plan for the original issue]

Team: [Names of people involved in resolution]
```

## Prevention and Best Practices

### Deployment Safety

- Always test deployments on staging before promoting to production
- Use feature flags for risky changes
- Deploy during low-traffic periods when possible
- Keep rollback procedures well-documented and tested

### Monitoring

- Set up alerts for error rate increases
- Monitor key metrics continuously
- Have health checks as part of deployment process
- Maintain deployment history for quick identification

### Team Preparedness

- Ensure multiple team members know rollback procedures
- Practice rollback procedures during low-risk times
- Keep Vercel access credentials secure but accessible
- Document lessons learned from each incident

## Integration with CI/CD Pipeline

Our deployment pipeline includes automated rollback capabilities:

1. **Automatic Health Checks**: Pipeline runs health checks after production promotion
2. **Rollback Triggers**: Failed health checks can trigger automatic rollback
3. **Manual Override**: Team can trigger rollback via GitHub Actions
4. **Deployment History**: All deployments are tracked with metadata for easy identification

See [deployment-pipeline.md](deployment-pipeline.md) for detailed CI/CD integration.

## Testing Rollback Procedures

Regularly test rollback procedures to ensure they work when needed:

### Monthly Rollback Drill

1. Choose a low-traffic time
2. Promote current deployment to a temporary staging alias
3. Practice rolling back to previous deployment
4. Verify all procedures work as documented
5. Roll forward to current deployment
6. Document any issues or improvements needed

This ensures rollback procedures remain reliable and team members stay familiar with the process.
