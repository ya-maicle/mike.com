#!/bin/bash
set -e

# Health Check Script for mikeiu.com domains
# Validates both staging and production deployments

STAGING_URL="https://staging.mikeiu.com"
PRODUCTION_URL="https://mikeiu.com"
EXIT_CODE=0

echo "🔍 Starting domain health checks..."
echo "=========================="

# Health endpoint check
check_health() {
  local url=$1
  local name=$2
  
  echo "🏥 Checking $name health endpoint..."
  
  local response=$(curl -s -w "%{http_code}" "$url/api/health" -o /tmp/health_response_$(echo $name | tr ' ' '_'))
  local health_data=$(cat /tmp/health_response_$(echo $name | tr ' ' '_'))
  
  if [ "$response" = "200" ]; then
    echo "✅ $name health check passed (HTTP $response)"
    echo "   Response: $health_data"
    
    # Validate response contains expected fields
    if echo "$health_data" | grep -q '"status":"ok"' && echo "$health_data" | grep -q '"service":"web"'; then
      echo "   ✅ Response format valid"
    else
      echo "   ⚠️  Response format unexpected"
      EXIT_CODE=1
    fi
  else
    echo "❌ $name health check failed (HTTP $response)"
    echo "   Response: $health_data"
    EXIT_CODE=1
  fi
  echo ""
}

# SSL certificate check
check_ssl() {
  local domain=$1
  local name=$2
  
  echo "🔒 Checking $name SSL certificate..."
  
  # Use timeout to prevent hanging
  if command -v timeout >/dev/null 2>&1; then
    local ssl_info=$(timeout 10s openssl s_client -connect "$domain:443" -servername "$domain" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || echo "SSL check failed")
  else
    # Fallback for systems without timeout command
    local ssl_info=$(openssl s_client -connect "$domain:443" -servername "$domain" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || echo "SSL check failed")
  fi
  
  if echo "$ssl_info" | grep -q "notAfter"; then
    local expiry=$(echo "$ssl_info" | grep notAfter | cut -d= -f2)
    echo "✅ $name SSL certificate valid"
    echo "   Expires: $expiry"
    
    # Check if certificate expires within 30 days
    if command -v date >/dev/null 2>&1; then
      local expiry_epoch=$(date -d "$expiry" +%s 2>/dev/null || date -j -f "%b %d %T %Y %Z" "$expiry" +%s 2>/dev/null || echo "0")
      local current_epoch=$(date +%s)
      local days_until_expiry=$(( (expiry_epoch - current_epoch) / 86400 ))
      
      if [ "$days_until_expiry" -lt 30 ] && [ "$days_until_expiry" -gt 0 ]; then
        echo "   ⚠️  Certificate expires in $days_until_expiry days"
        EXIT_CODE=1
      elif [ "$days_until_expiry" -le 0 ]; then
        echo "   ❌ Certificate has expired!"
        EXIT_CODE=1
      fi
    fi
  else
    echo "❌ $name SSL certificate check failed"
    echo "   Error: $ssl_info"
    EXIT_CODE=1
  fi
  echo ""
}

# Basic connectivity check
check_connectivity() {
  local url=$1
  local name=$2
  
  echo "🌐 Checking $name basic connectivity..."
  
  local response=$(curl -s -w "%{http_code}" "$url" -o /dev/null)
  
  if [ "$response" = "200" ]; then
    echo "✅ $name is accessible (HTTP $response)"
  else
    echo "❌ $name connectivity failed (HTTP $response)"
    EXIT_CODE=1
  fi
  echo ""
}

# Run all checks
echo "🔍 Running checks for STAGING environment..."
echo "----------------------------------------"
check_connectivity "$STAGING_URL" "Staging"
check_health "$STAGING_URL" "Staging"
check_ssl "staging.mikeiu.com" "Staging"

echo "🔍 Running checks for PRODUCTION environment..."
echo "--------------------------------------------"
check_connectivity "$PRODUCTION_URL" "Production"
check_health "$PRODUCTION_URL" "Production"
check_ssl "mikeiu.com" "Production"

# Cleanup temporary files
rm -f /tmp/health_response_*

echo "=========================="
if [ $EXIT_CODE -eq 0 ]; then
  echo "🎉 All health checks completed successfully!"
else
  echo "⚠️  Some health checks failed. Please review the output above."
fi
echo "=========================="

exit $EXIT_CODE