#!/bin/bash
set -e

# Health Check Script for mikeiu.com domains
STAGING_URL="https://staging.mikeiu.com"
PRODUCTION_URL="https://mikeiu.com"
EXIT_CODE=0

echo "🔍 Domain Health Check"
echo "====================="

check_domain() {
  local url=$1
  local name=$2
  
  echo "Checking $name..."
  
  # Health endpoint check
  local response=$(curl -s -w "%{http_code}" "$url/api/health" -o /tmp/health_$name)
  local health_data=$(cat /tmp/health_$name)
  
  if [ "$response" = "200" ]; then
    echo "✅ $name health endpoint: OK"
    if echo "$health_data" | grep -q '"status":"ok"'; then
      echo "   Response format: Valid"
    else
      echo "   Response format: Unexpected"
      EXIT_CODE=1
    fi
  else
    echo "❌ $name health endpoint: FAILED (HTTP $response)"
    EXIT_CODE=1
  fi
  
  # SSL check
  local ssl_info=$(openssl s_client -connect "${url#https://}:443" -servername "${url#https://}" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || echo "")
  if echo "$ssl_info" | grep -q "notAfter"; then
    echo "✅ $name SSL certificate: Valid"
  else
    echo "❌ $name SSL certificate: Failed"
    EXIT_CODE=1
  fi
  
  echo ""
}

# Run checks
check_domain "$STAGING_URL" "Staging"
check_domain "$PRODUCTION_URL" "Production"

# Cleanup
rm -f /tmp/health_*

if [ $EXIT_CODE -eq 0 ]; then
  echo "🎉 All health checks passed!"
else
  echo "⚠️  Some health checks failed"
fi

exit $EXIT_CODE