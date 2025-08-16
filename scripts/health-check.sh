#!/bin/bash
# Simple health check for mikeiu.com domains

echo "🔍 Health Check"
echo "==============="

echo "Staging:"
curl -s https://staging.mikeiu.com/api/health | grep -q '"status":"ok"' && echo "✅ OK" || echo "❌ FAIL"

echo "Production:"
curl -s https://mikeiu.com/api/health | grep -q '"status":"ok"' && echo "✅ OK" || echo "❌ FAIL"

echo "Complete."