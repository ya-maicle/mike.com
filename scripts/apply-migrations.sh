#!/bin/bash
set -e

PROJECT_REF="$1"
DRY_RUN="${2:-false}"

if [ -z "$PROJECT_REF" ]; then
  echo "Usage: $0 <project-ref> [dry-run]"
  exit 1
fi

echo "🔗 Linking to Supabase project: $PROJECT_REF"
supabase link --project-ref "$PROJECT_REF"

if [ "$DRY_RUN" = "true" ]; then
  echo "🧪 Running migration dry-run..."
  supabase db push --dry-run
else
  echo "📊 Applying migrations..."
  supabase db push
  echo "✅ Migrations applied successfully"
fi