# Health Check Procedures

This document outlines the health check procedures for the mikeiu.com deployment infrastructure, covering both automated and manual verification processes.

## Quick Health Check

For a fast automated health check of both staging and production environments:

```bash
./scripts/health-check.sh
```

This script validates:

- HTTP connectivity and response codes
- Health endpoint functionality and response format
- SSL certificate validity and expiration
- Response time monitoring

## Manual Health Check Steps

### 1. Basic Connectivity

Verify both domains are accessible:

```bash
# Check HTTP response codes
curl -I https://staging.mikeiu.com
curl -I https://mikeiu.com

# Expected: HTTP/2 200 OK for both domains
```

### 2. Health Endpoint Validation

Test the application health endpoints:

```bash
# Staging health check
curl https://staging.mikeiu.com/api/health

# Production health check
curl https://mikeiu.com/api/health

# Expected response format:
# {"status":"ok","service":"web","timestamp":"2025-08-16T11:38:43.571Z"}
```

### 3. SSL Certificate Verification

Check SSL certificate status and expiration:

```bash
# Check staging SSL
openssl s_client -connect staging.mikeiu.com:443 -servername staging.mikeiu.com 2>/dev/null | openssl x509 -noout -dates

# Check production SSL
openssl s_client -connect mikeiu.com:443 -servername mikeiu.com 2>/dev/null | openssl x509 -noout -dates

# Look for notBefore and notAfter dates
```

### 4. DNS Resolution Verification

Verify DNS records are resolving correctly:

```bash
# Check DNS resolution
nslookup staging.mikeiu.com
nslookup mikeiu.com

# Both should resolve to Vercel infrastructure (76.76.21.21)
```

## Expected Response Values

### Health Endpoint Response

Healthy response should include:

- `status: "ok"` - Service is operational
- `service: "web"` - Identifies the service type
- `timestamp` - Current ISO timestamp

Example:

```json
{
  "status": "ok",
  "service": "web",
  "timestamp": "2025-08-16T11:38:43.571Z"
}
```

### HTTP Response Headers

Key headers to verify:

- `server: Vercel` - Confirms Vercel hosting
- `x-vercel-cache: HIT|MISS|PRERENDER` - Cache status
- `strict-transport-security` - HTTPS enforcement
- Status code `200` for successful responses

### SSL Certificate

Valid certificates should show:

- Valid date range (notBefore to notAfter)
- Subject matches domain (staging.mikeiu.com or mikeiu.com)
- Issuer from trusted CA (Let's Encrypt via Vercel)

## Error Conditions and Troubleshooting

### Common Issues

| Issue                   | Symptoms                     | Resolution                          |
| ----------------------- | ---------------------------- | ----------------------------------- |
| DNS Resolution Failure  | `nslookup` returns no answer | Check Cloudflare DNS configuration  |
| SSL Certificate Invalid | Browser security warnings    | Verify Vercel domain configuration  |
| Health Endpoint Error   | 404 or 500 responses         | Check application deployment status |
| Slow Response Times     | >2s response times           | Investigate Vercel function logs    |

### HTTP Error Codes

- **404 Not Found**: Check deployment status, route may not exist
- **500 Internal Server Error**: Application error, check Vercel function logs
- **502 Bad Gateway**: Deployment initialization issue, wait 1-2 minutes
- **503 Service Unavailable**: Temporary outage, check Vercel status

### SSL Certificate Issues

- **Certificate Expired**: Contact Vercel support or re-verify domain
- **Certificate Mismatch**: Domain configuration issue in Vercel
- **Connection Timeout**: Network connectivity issue or firewall blocking

## Monitoring and Alerting

### Automated Monitoring

The health check script can be integrated into monitoring systems:

```bash
# Return exit code 0 for success, 1 for failure
./scripts/health-check.sh

# Use in monitoring systems
if ! ./scripts/health-check.sh; then
  echo "Health check failed, sending alert"
  # Trigger alert mechanism
fi
```

### Key Metrics to Monitor

1. **Response Time**: Target <1s for health endpoint
2. **Availability**: Target 99.9% uptime
3. **SSL Certificate Expiration**: Alert 30 days before expiry
4. **Error Rate**: Alert on >1% 5xx error rate

### Alert Thresholds

- **Critical**: Health endpoint returning 5xx errors
- **Warning**: Response time >2s consistently
- **Info**: SSL certificate expiring within 30 days

## Integration with CI/CD

The health check script is integrated into the deployment pipeline:

1. **Post-Deploy Validation**: Runs automatically after staging deployment
2. **Pre-Promotion Check**: Validates staging before production promotion
3. **Production Verification**: Confirms production deployment success

See [deployment-pipeline.md](deployment-pipeline.md) for full CI/CD integration details.

## Emergency Procedures

If health checks fail consistently:

1. **Immediate Response**:
   - Check Vercel dashboard for deployment errors
   - Verify no ongoing Vercel incidents
   - Test from multiple locations/networks

2. **Escalation**:
   - If staging fails: Investigate latest deployment
   - If production fails: Consider immediate rollback
   - If both fail: Check Vercel status and DNS configuration

3. **Communication**:
   - Document issue in incident log
   - Notify team of status and resolution timeline
   - Update stakeholders on user impact

For rollback procedures, see [deployment-rollback.md](deployment-rollback.md).
