# Health Check Procedures

## Quick Health Check

Run automated health checks for both domains:

```bash
./scripts/health-check.sh
```

## Manual Health Checks

Test individual endpoints:

```bash
# Staging
curl https://staging.mikeiu.com/api/health

# Production
curl https://mikeiu.com/api/health
```

Expected response:

```json
{ "status": "ok", "service": "web", "timestamp": "2025-08-16T11:38:43.571Z" }
```

## Troubleshooting

- **404 Not Found**: Check deployment status
- **500 Error**: Check Vercel function logs
- **SSL Issues**: Wait 5-10 minutes for certificate provisioning
- **Slow Response**: Check for cold starts in logs
