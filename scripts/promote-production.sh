#!/bin/bash
set -e

echo "🚀 Starting production promotion..."

# Get latest staging deployment
STAGING_URL=$(vercel list --token "$VERCEL_TOKEN" --limit 1 --format json | jq -r '.[0].url')

if [ -z "$STAGING_URL" ] || [ "$STAGING_URL" = "null" ]; then
  echo "❌ Could not find staging deployment"
  exit 1
fi

echo "📦 Promoting deployment: $STAGING_URL"

# Promote to production
vercel promote "$STAGING_URL" --token "$VERCEL_TOKEN"

# Update production alias
vercel alias "$STAGING_URL" mikeiu.com --token "$VERCEL_TOKEN"

echo "✅ Production promotion completed"
echo "🌐 Live at: https://mikeiu.com"

# Post-deployment health check
echo "🏥 Running post-deployment health check..."
sleep 30  # Allow time for deployment to propagate

for i in {1..10}; do
  if curl -f https://mikeiu.com/api/health > /dev/null 2>&1; then
    echo "✅ Production health check passed"
    exit 0
  fi
  echo "Attempt $i: Health check failed, retrying in 30 seconds..."
  sleep 30
done

echo "❌ Production health check failed after 10 attempts"
exit 1