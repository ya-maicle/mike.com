# Health Check Procedures

Quick automated health check for both staging and production:

```bash
./scripts/health-check.sh
```

This validates:

- HTTP connectivity and response codes
- Health endpoint functionality and response format
- SSL certificate validity and expiration

## Manual Health Checks

```bash
# Test health endpoints
curl https://staging.mikeiu.com/api/health
curl https://mikeiu.com/api/health

# Expected response:
# {"status":"ok","service":"web","timestamp":"2025-08-16T..."}
```

## Expected Response Values

Healthy response should include:

- `status: "ok"` - Service is operational
- `service: "web"` - Identifies the service type
- `timestamp` - Current ISO timestamp

## Error Troubleshooting

- **404 Not Found**: Check deployment status
- **500 Internal Server Error**: Check Vercel function logs
- **SSL Certificate Issues**: Wait 5-10 minutes for auto-provisioning
- **Slow Response**: Check for cold starts in Vercel logs
