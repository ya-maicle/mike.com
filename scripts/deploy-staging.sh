#!/bin/bash
set -e

echo "🚀 Starting staging deployment..."

# Deploy to Vercel
echo "📦 Deploying to Vercel..."
vercel --token "$VERCEL_TOKEN" --force

# Get the latest deployment URL
DEPLOYMENT_URL=$(vercel list --token "$VERCEL_TOKEN" --limit 1 --format json | jq -r '.[0].url')

if [ -z "$DEPLOYMENT_URL" ] || [ "$DEPLOYMENT_URL" = "null" ]; then
  echo "❌ Could not find deployment URL"
  exit 1
fi

echo "🔗 Latest deployment: $DEPLOYMENT_URL"

# Alias to staging domain
echo "🌐 Aliasing to staging.mikeiu.com..."
vercel alias "$DEPLOYMENT_URL" staging.mikeiu.com --token "$VERCEL_TOKEN"

echo "✅ Staging deployment completed"
echo "🌐 Available at: https://staging.mikeiu.com"