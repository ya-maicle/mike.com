#!/bin/bash
set -e

# Domain Verification Script for mikeiu.com infrastructure
# Comprehensive DNS, SSL, and connectivity verification

STAGING_DOMAIN="staging.mikeiu.com"
PRODUCTION_DOMAIN="mikeiu.com"
EXIT_CODE=0

echo "🔍 Starting comprehensive domain verification..."
echo "=============================================="

# DNS resolution verification
verify_dns() {
  local domain=$1
  local name=$2
  
  echo "🌐 Verifying DNS resolution for $name..."
  
  # Check A record resolution
  local ip_address=$(nslookup "$domain" | grep "Address:" | tail -1 | cut -d' ' -f2)
  
  if [ -n "$ip_address" ] && [ "$ip_address" != "192.168.1.1#53" ]; then
    echo "✅ $name resolves to: $ip_address"
    
    # Verify it's Vercel infrastructure (typical range)
    if echo "$ip_address" | grep -E "^76\.76\." >/dev/null; then
      echo "   ✅ IP address is in Vercel range"
    else
      echo "   ⚠️  IP address may not be Vercel infrastructure"
    fi
  else
    echo "❌ $name DNS resolution failed"
    EXIT_CODE=1
  fi
  
  # Check for CNAME record if available
  if command -v dig >/dev/null 2>&1; then
    local cname=$(dig "$domain" CNAME +short)
    if [ -n "$cname" ]; then
      echo "   ℹ️  CNAME record: $cname"
    fi
  fi
  
  echo ""
}

# SSL certificate comprehensive check
verify_ssl() {
  local domain=$1
  local name=$2
  
  echo "🔒 Verifying SSL certificate for $name..."
  
  # Get certificate information with timeout
  local cert_info=""
  if command -v timeout >/dev/null 2>&1; then
    cert_info=$(timeout 15s openssl s_client -connect "$domain:443" -servername "$domain" 2>/dev/null | openssl x509 -noout -text 2>/dev/null || echo "")
  else
    cert_info=$(openssl s_client -connect "$domain:443" -servername "$domain" 2>/dev/null | openssl x509 -noout -text 2>/dev/null || echo "")
  fi
  
  if [ -n "$cert_info" ]; then
    # Check subject matches domain
    local subject=$(echo "$cert_info" | grep "Subject:" | grep -o "CN=[^,]*" | cut -d'=' -f2 || echo "")
    local san=$(echo "$cert_info" | grep -A1 "Subject Alternative Name" | tail -1 | grep -o "DNS:[^,]*" | cut -d':' -f2 || echo "")
    
    echo "✅ SSL certificate retrieved successfully"
    echo "   Subject CN: $subject"
    if [ -n "$san" ]; then
      echo "   Subject Alt Names: $san"
    fi
    
    # Verify domain matches certificate
    if echo "$cert_info" | grep -q "$domain"; then
      echo "   ✅ Certificate matches domain"
    else
      echo "   ❌ Certificate does not match domain"
      EXIT_CODE=1
    fi
    
    # Check certificate dates
    local dates=$(echo "$cert_info" | grep -A2 "Validity" | grep "Not")
    if [ -n "$dates" ]; then
      echo "   Certificate validity:"
      echo "$dates" | sed 's/^/     /'
      
      # Check expiration (basic check)
      local not_after=$(echo "$cert_info" | grep "Not After" | cut -d':' -f2- | xargs)
      if [ -n "$not_after" ]; then
        if command -v date >/dev/null 2>&1; then
          local expiry_epoch=$(date -d "$not_after" +%s 2>/dev/null || date -j -f "%b %d %T %Y %Z" "$not_after" +%s 2>/dev/null || echo "0")
          local current_epoch=$(date +%s)
          local days_until_expiry=$(( (expiry_epoch - current_epoch) / 86400 ))
          
          if [ "$days_until_expiry" -gt 0 ]; then
            echo "   ✅ Certificate expires in $days_until_expiry days"
            if [ "$days_until_expiry" -lt 30 ]; then
              echo "   ⚠️  Certificate expires soon!"
            fi
          else
            echo "   ❌ Certificate has expired!"
            EXIT_CODE=1
          fi
        fi
      fi
    fi
    
    # Check issuer
    local issuer=$(echo "$cert_info" | grep "Issuer:" | cut -d':' -f2- | xargs)
    if [ -n "$issuer" ]; then
      echo "   Issuer: $issuer"
      if echo "$issuer" | grep -q "Let's Encrypt"; then
        echo "   ✅ Certificate from Let's Encrypt (expected for Vercel)"
      fi
    fi
    
  else
    echo "❌ Could not retrieve SSL certificate for $name"
    EXIT_CODE=1
  fi
  
  echo ""
}

# HTTP/HTTPS connectivity verification
verify_http() {
  local domain=$1
  local name=$2
  
  echo "🌐 Verifying HTTP/HTTPS connectivity for $name..."
  
  # Test HTTPS redirect
  local http_response=$(curl -s -w "%{http_code}:%{redirect_url}" "http://$domain" -o /dev/null)
  local http_code=$(echo "$http_response" | cut -d':' -f1)
  local redirect_url=$(echo "$http_response" | cut -d':' -f2-)
  
  if [ "$http_code" = "301" ] || [ "$http_code" = "302" ]; then
    if echo "$redirect_url" | grep -q "https://"; then
      echo "✅ HTTP redirects to HTTPS ($http_code)"
    else
      echo "⚠️  HTTP redirects but not to HTTPS ($http_code -> $redirect_url)"
    fi
  else
    echo "⚠️  HTTP response: $http_code"
  fi
  
  # Test HTTPS connectivity
  local https_response=$(curl -s -w "%{http_code}:%{time_total}" "https://$domain" -o /dev/null)
  local https_code=$(echo "$https_response" | cut -d':' -f1)
  local response_time=$(echo "$https_response" | cut -d':' -f2)
  
  if [ "$https_code" = "200" ]; then
    echo "✅ HTTPS connectivity successful (${response_time}s)"
    
    # Check response time
    if command -v bc >/dev/null 2>&1; then
      if (( $(echo "$response_time > 3.0" | bc -l) )); then
        echo "   ⚠️  Response time is slow (>3s)"
      fi
    fi
  else
    echo "❌ HTTPS connectivity failed ($https_code)"
    EXIT_CODE=1
  fi
  
  echo ""
}

# Vercel-specific verification
verify_vercel_headers() {
  local domain=$1
  local name=$2
  
  echo "🔧 Verifying Vercel-specific headers for $name..."
  
  local headers=$(curl -s -I "https://$domain" | tr -d '\r')
  
  # Check for Vercel server header
  if echo "$headers" | grep -q "server: Vercel"; then
    echo "✅ Served by Vercel"
  else
    echo "⚠️  Server header does not indicate Vercel"
  fi
  
  # Check for Vercel-specific headers
  local vercel_cache=$(echo "$headers" | grep -i "x-vercel-cache:" | cut -d':' -f2 | xargs)
  if [ -n "$vercel_cache" ]; then
    echo "✅ Vercel cache status: $vercel_cache"
  fi
  
  local vercel_id=$(echo "$headers" | grep -i "x-vercel-id:" | cut -d':' -f2 | xargs)
  if [ -n "$vercel_id" ]; then
    echo "✅ Vercel deployment ID: $vercel_id"
  fi
  
  # Check security headers
  if echo "$headers" | grep -q "strict-transport-security:"; then
    echo "✅ HSTS header present"
  else
    echo "⚠️  HSTS header missing"
  fi
  
  echo ""
}

# Performance check
verify_performance() {
  local domain=$1
  local name=$2
  
  echo "⚡ Performance verification for $name..."
  
  # Multiple requests to check consistency
  local total_time=0
  local request_count=3
  
  for i in $(seq 1 $request_count); do
    local response_time=$(curl -s -w "%{time_total}" "https://$domain/api/health" -o /dev/null)
    if command -v bc >/dev/null 2>&1; then
      total_time=$(echo "$total_time + $response_time" | bc)
    fi
    echo "   Request $i: ${response_time}s"
  done
  
  if command -v bc >/dev/null 2>&1; then
    local avg_time=$(echo "scale=3; $total_time / $request_count" | bc)
    echo "✅ Average response time: ${avg_time}s"
    
    if (( $(echo "$avg_time > 2.0" | bc -l) )); then
      echo "   ⚠️  Average response time is high (>2s)"
    fi
  fi
  
  echo ""
}

# Run all verification checks
echo "🔍 Verifying STAGING domain ($STAGING_DOMAIN)..."
echo "==============================================="
verify_dns "$STAGING_DOMAIN" "Staging"
verify_ssl "$STAGING_DOMAIN" "Staging"
verify_http "$STAGING_DOMAIN" "Staging"
verify_vercel_headers "$STAGING_DOMAIN" "Staging"
verify_performance "$STAGING_DOMAIN" "Staging"

echo "🔍 Verifying PRODUCTION domain ($PRODUCTION_DOMAIN)..."
echo "====================================================="
verify_dns "$PRODUCTION_DOMAIN" "Production"
verify_ssl "$PRODUCTION_DOMAIN" "Production"
verify_http "$PRODUCTION_DOMAIN" "Production"
verify_vercel_headers "$PRODUCTION_DOMAIN" "Production"
verify_performance "$PRODUCTION_DOMAIN" "Production"

# Summary
echo "=============================================="
if [ $EXIT_CODE -eq 0 ]; then
  echo "🎉 All domain verification checks passed!"
  echo "   Both staging and production domains are correctly configured."
else
  echo "⚠️  Some domain verification checks failed."
  echo "   Please review the output above for specific issues."
fi
echo "=============================================="

exit $EXIT_CODE