#!/bin/bash
# Health check for mikeiu.com domains

echo "🔍 Domain Health Check"
echo "====================="

echo "Testing staging.mikeiu.com..."
if curl -s https://staging.mikeiu.com/api/health | grep -q '"status":"ok"'; then
  echo "✅ Staging health endpoint: OK"
else
  echo "❌ Staging health endpoint: FAIL"
fi

echo "Testing mikeiu.com..."
if curl -s https://mikeiu.com/api/health | grep -q '"status":"ok"'; then
  echo "✅ Production health endpoint: OK"  
else
  echo "❌ Production health endpoint: FAIL"
fi

echo "Health check complete."