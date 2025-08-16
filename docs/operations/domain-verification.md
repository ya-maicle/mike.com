# Domain Verification Guide

This document provides comprehensive procedures for verifying domain configuration, DNS setup, and troubleshooting domain-related issues for the mikeiu.com infrastructure.

## Quick Domain Verification

For a complete automated domain verification:

```bash
./scripts/verify-domains.sh
```

This script performs comprehensive checks including:

- DNS resolution verification
- SSL certificate validation and expiration monitoring
- HTTP/HTTPS connectivity testing
- Vercel-specific header validation
- Performance monitoring

## Manual Verification Procedures

### 1. DNS Resolution Verification

Check that domains resolve to the correct infrastructure:

```bash
# Check basic DNS resolution
nslookup staging.mikeiu.com
nslookup mikeiu.com

# Expected: Both should resolve to Vercel IP addresses (76.76.x.x range)
```

For more detailed DNS information:

```bash
# Check CNAME records (if available)
dig staging.mikeiu.com CNAME +short
dig mikeiu.com CNAME +short

# Check A records
dig staging.mikeiu.com A +short
dig mikeiu.com A +short

# Check from multiple DNS servers
nslookup staging.mikeiu.com 8.8.8.8
nslookup mikeiu.com 8.8.8.8
```

### 2. SSL Certificate Verification

Verify SSL certificates are valid and properly configured:

```bash
# Check certificate details
openssl s_client -connect staging.mikeiu.com:443 -servername staging.mikeiu.com 2>/dev/null | openssl x509 -noout -text

# Check certificate expiration
openssl s_client -connect mikeiu.com:443 -servername mikeiu.com 2>/dev/null | openssl x509 -noout -dates

# Quick certificate check
echo | openssl s_client -connect staging.mikeiu.com:443 -servername staging.mikeiu.com 2>/dev/null | openssl x509 -noout -subject -dates
```

### 3. HTTP/HTTPS Connectivity Testing

Verify both HTTP and HTTPS connectivity:

```bash
# Test HTTPS connectivity
curl -I https://staging.mikeiu.com
curl -I https://mikeiu.com

# Test HTTP redirect to HTTPS
curl -I http://staging.mikeiu.com
curl -I http://mikeiu.com

# Expected: HTTP should redirect (301/302) to HTTPS
```

### 4. Vercel Infrastructure Verification

Confirm domains are properly served by Vercel:

```bash
# Check for Vercel server headers
curl -I https://mikeiu.com | grep -i server

# Check Vercel-specific headers
curl -I https://staging.mikeiu.com | grep -i "x-vercel"

# Expected headers:
# server: Vercel
# x-vercel-cache: HIT/MISS/PRERENDER
# x-vercel-id: deployment-specific-id
```

## Domain Configuration Requirements

### DNS Configuration (Cloudflare)

Both domains should be configured with:

| Domain             | Type  | Target               | Proxy Status |
| ------------------ | ----- | -------------------- | ------------ |
| staging.mikeiu.com | CNAME | cname.vercel-dns.com | ☁️ Proxied   |
| mikeiu.com         | CNAME | cname.vercel-dns.com | ☁️ Proxied   |

**Note:** If using A records instead of CNAME, they should point to Vercel's IP addresses (typically in 76.76.x.x range).

### Vercel Domain Configuration

In the Vercel dashboard (`mike-com-web` project):

- `staging.mikeiu.com` should be configured for automatic aliasing to latest main deployments
- `mikeiu.com` should be configured for manual promotion only
- Both domains should have valid SSL certificates

### Expected SSL Certificate Properties

Valid SSL certificates should have:

- **Subject**: CN=mikeiu.com (or staging.mikeiu.com)
- **Issuer**: Let's Encrypt (via Vercel)
- **Validity**: Current date within notBefore and notAfter range
- **Subject Alternative Names**: Both www and non-www variants (if configured)

## Troubleshooting Common Issues

### DNS Resolution Issues

**Problem**: Domain doesn't resolve or resolves to wrong IP

```bash
# Symptoms
nslookup mikeiu.com
# Returns: can't find mikeiu.com: Non-existent domain
```

**Solutions**:

1. Check Cloudflare DNS configuration
2. Verify domain is pointing to correct nameservers
3. Clear local DNS cache: `sudo dscacheutil -flushcache` (macOS)
4. Test from different DNS servers: `nslookup mikeiu.com 8.8.8.8`

### SSL Certificate Issues

**Problem**: SSL certificate invalid or expired

```bash
# Symptoms
curl https://mikeiu.com
# Returns: SSL certificate verify failed
```

**Solutions**:

1. Wait 5-10 minutes for automatic certificate provisioning
2. Check domain configuration in Vercel dashboard
3. Verify DNS records are correct
4. Re-verify domain in Vercel if needed

**Problem**: Certificate doesn't match domain

```bash
# Symptoms
curl -I https://mikeiu.com
# Returns warnings about certificate mismatch
```

**Solutions**:

1. Check if domain is correctly configured in Vercel
2. Verify Subject Alternative Names include the domain
3. Ensure domain verification is complete in Vercel

### Connectivity Issues

**Problem**: HTTP doesn't redirect to HTTPS

```bash
# Symptoms
curl -I http://mikeiu.com
# Returns: 200 OK instead of 301/302 redirect
```

**Solutions**:

1. Check Vercel redirect configuration
2. Verify Cloudflare SSL/TLS settings (should be "Full" or "Strict")
3. Check if custom redirects are configured correctly

**Problem**: Slow response times

```bash
# Symptoms
curl -w "%{time_total}" https://mikeiu.com/api/health
# Returns: response time > 3 seconds consistently
```

**Solutions**:

1. Check Vercel function logs for cold starts
2. Verify no issues with Vercel infrastructure (status.vercel.com)
3. Test from multiple geographic locations
4. Check Cloudflare caching configuration

### Vercel-Specific Issues

**Problem**: Missing Vercel headers

```bash
# Symptoms
curl -I https://mikeiu.com | grep server
# Doesn't return "server: Vercel"
```

**Solutions**:

1. Check if domain is properly configured in Vercel
2. Verify deployment is active and not using custom server
3. Check if Cloudflare proxy is interfering with headers

**Problem**: Wrong deployment being served

```bash
# Symptoms
curl https://mikeiu.com/api/health
# Returns unexpected version or 404
```

**Solutions**:

1. Check current deployment alias in Vercel dashboard
2. Verify production promotion was successful
3. Check if deployment has health endpoint
4. Review deployment logs for errors

## DNS Propagation and Caching

### Checking DNS Propagation

Use online tools or command line to check DNS propagation globally:

```bash
# Check from multiple locations
for server in 8.8.8.8 1.1.1.1 208.67.222.222; do
  echo "Checking with $server:"
  nslookup mikeiu.com $server
  echo "---"
done
```

### Cloudflare Cache Management

If changes aren't reflecting immediately:

1. **Purge Cloudflare Cache**:
   - Go to Cloudflare dashboard
   - Select domain
   - Go to "Caching" → "Configuration"
   - Click "Purge Everything"

2. **Check Cloudflare Cache Headers**:
   ```bash
   curl -I https://mikeiu.com | grep -i "cf-"
   ```

### TTL Considerations

- **DNS TTL**: Typically 300 seconds (5 minutes) for quick updates
- **Cloudflare Cache**: Varies by resource type
- **Browser Cache**: Affected by Cache-Control headers

## Monitoring and Alerting Setup

### Automated Monitoring

Set up regular domain verification checks:

```bash
# Cron job example (runs every 15 minutes)
*/15 * * * * /path/to/scripts/verify-domains.sh > /tmp/domain-check.log 2>&1

# Alert on failures
*/15 * * * * /path/to/scripts/verify-domains.sh || echo "Domain verification failed" | mail -s "Domain Alert" admin@example.com
```

### Key Metrics to Monitor

1. **DNS Resolution Time**: Should be < 100ms
2. **SSL Certificate Expiration**: Alert 30 days before
3. **HTTP Response Time**: Should be < 2s for health endpoints
4. **SSL Handshake Time**: Should be < 500ms
5. **Uptime**: Target 99.9% availability

### Alerting Thresholds

- **Critical**: DNS resolution fails or SSL certificate expired
- **Warning**: Response time > 3s or certificate expires within 7 days
- **Info**: Performance degradation or certificate expires within 30 days

## Integration with CI/CD

Domain verification is integrated into the deployment pipeline:

1. **Pre-deployment**: Verify staging domain configuration
2. **Post-deployment**: Validate deployment is accessible via correct domain
3. **Pre-promotion**: Ensure staging tests pass before production promotion
4. **Post-promotion**: Verify production domain serves new deployment

See [deployment-pipeline.md](deployment-pipeline.md) for CI/CD integration details.

## Emergency Procedures

### Complete Domain Failure

If both domains are inaccessible:

1. **Immediate Actions**:
   - Check Vercel status page
   - Verify Cloudflare dashboard for issues
   - Test direct Vercel deployment URLs

2. **Escalation Steps**:
   - Contact Vercel support if infrastructure issue
   - Contact Cloudflare support if DNS issue
   - Implement emergency fallback if available

3. **Communication**:
   - Notify stakeholders immediately
   - Post status updates every 15 minutes
   - Document timeline and resolution steps

### Partial Domain Failure

If only one domain (staging or production) fails:

1. **Staging Failure**: Generally lower priority, investigate during business hours
2. **Production Failure**: High priority, follow emergency rollback procedures

See [deployment-rollback.md](deployment-rollback.md) for production emergency procedures.

## Regular Maintenance Tasks

### Weekly Tasks

- [ ] Run domain verification script and review results
- [ ] Check SSL certificate expiration dates
- [ ] Review DNS configuration for any unauthorized changes
- [ ] Verify both domains are serving expected content

### Monthly Tasks

- [ ] Test rollback procedures using domain verification
- [ ] Review and update monitoring thresholds
- [ ] Check for any new Cloudflare or Vercel features that could improve setup
- [ ] Audit access to domain management accounts

### Quarterly Tasks

- [ ] Review and update documentation
- [ ] Test emergency procedures end-to-end
- [ ] Evaluate domain performance and optimization opportunities
- [ ] Review SSL certificate management and renewal processes
