# Supabase Database Management

This folder holds local database tooling and versioned SQL migrations for Supabase (Postgres + Auth) across our two-environment deployment model.

## Environment Architecture

| Environment     | Database Project | Project Reference      | Purpose                                 |
| --------------- | ---------------- | ---------------------- | --------------------------------------- |
| **Development** | mike-staging     | `qijxfigergpnuqbaxtjv` | Local development + Preview deployments |
| **Production**  | mike-prod        | `pzgczflyltjyxwqyteuj` | Live production application             |

## Migration Workflow

```
Local Development → Staging (CI) → Production (Manual Promotion)
     ↓                   ↓                    ↓
Docker Supabase    mike-staging         mike-prod
(Schema changes)   (Auto migration)     (Same migration)
```

**Security Principles:**

- ✅ Only commit SQL migrations and non-secret config
- ❌ Never commit secrets, service role keys, or passwords
- ✅ All remote migrations executed via CI/CD, not manually

---

## 1) Install Supabase CLI

macOS (Homebrew):

- brew install supabase/tap/supabase

Verify:

- supabase --version

If you prefer not to install globally, see: https://supabase.com/docs/guides/cli

---

## 2) Remote Projects (Already Created)

Two managed projects exist in the Supabase Dashboard:

| Project         | Name         | Reference              | Region  | Status    |
| --------------- | ------------ | ---------------------- | ------- | --------- |
| **Development** | mike-staging | `qijxfigergpnuqbaxtjv` | EU West | ✅ Active |
| **Production**  | mike-prod    | `pzgczflyltjyxwqyteuj` | EU West | ✅ Active |

**Credentials Location:**

- 🔒 API URLs, anon keys, service role keys stored in Vercel environment variables
- 🔒 Project references stored in GitHub repository secrets (for CI/CD)
- 🔒 Local project references in `.env.local` (for CLI linking)

**Usage:**

- **mike-staging**: Used by preview deployments and local CLI linking
- **mike-prod**: Used by production deployments only

---

## 3) Initialize local Supabase and start services

At repo root:

- supabase init
- supabase start

This will generate a local `config.toml` and start Postgres, Auth, Storage, and Studio in Docker.

Notes:

- The CLI scaffolds files under `supabase/` as needed.
- You can stop services with `supabase stop`.

---

## 4) Migration Workflow

### Available Scripts

Use these npm scripts from the repo root (see package.json):

| Script                 | Command                      | Purpose                                |
| ---------------------- | ---------------------------- | -------------------------------------- |
| `pnpm db:start`        | `supabase start`             | Start local Supabase Docker containers |
| `pnpm db:stop`         | `supabase stop`              | Stop local Supabase services           |
| `pnpm db:reset`        | `supabase reset`             | Reset local DB (⚠️ destroys data)      |
| `pnpm db:diff`         | `supabase db diff`           | Generate migration from schema changes |
| `pnpm db:link:staging` | Link to mike-staging project | For testing migrations remotely        |
| `pnpm db:link:prod`    | Link to mike-prod project    | For emergency operations only          |

### Local Development Workflow

**Step-by-step process for schema changes:**

1. **Start Local Environment**

   ```bash
   pnpm db:start
   # Access Supabase Studio at http://localhost:54323
   ```

2. **Make Schema Changes**
   - Use Supabase Studio UI for table/column creation
   - Or connect directly with psql/SQL client
   - Or write raw SQL in Studio SQL editor

3. **Generate Migration**

   ```bash
   pnpm db:diff
   # Creates timestamped migration file in supabase/migrations/
   ```

4. **Review and Test Migration**

   ```bash
   # Reset local DB to test migration from scratch
   pnpm db:reset
   pnpm db:start
   # Verify migration applies cleanly
   ```

5. **Commit Migration**
   ```bash
   git add supabase/migrations/
   git commit -m "feat(db): add user_profiles table"
   ```

### CI/CD Migration Workflow

**Automatic process when code is pushed:**

#### Staging Deployment (Automatic)

When code is pushed to `main` branch:

1. **Quality Checks**: TypeScript, linting, tests pass
2. **Migration to Staging**:
   ```bash
   # GitHub Actions runs:
   supabase link --project-ref qijxfigergpnuqbaxtjv
   supabase db push --dry-run  # Validate first
   supabase db push            # Apply to mike-staging
   ```
3. **Deployment**: Vercel deploys to preview with staging database
4. **Smoke Tests**: Verify application works with new schema
5. **Approval Gate**: Manual approval required for production

#### Production Promotion (Manual)

After manual approval:

1. **Same Migration Applied**: Identical migration runs against mike-prod
2. **Zero-Downtime**: Same tested artifacts promoted
3. **Health Checks**: Verify production application functionality

### Migration Safety Rules

#### ✅ Safe Operations (OK for production)

- Adding new tables
- Adding new columns (with defaults)
- Adding indexes
- Creating new functions/triggers
- Adding constraints that don't conflict with existing data

#### ⚠️ Dangerous Operations (Requires careful planning)

- Renaming columns/tables
- Dropping columns/tables
- Changing column types
- Adding constraints that might fail on existing data

#### 🚫 Emergency Procedures

If a migration breaks production:

1. **Immediate Rollback**: Revert deployment in Vercel
2. **Database Rollback**: Apply compensating migration
3. **Fix and Redeploy**: Create fix migration and redeploy

### Remote Migration Commands (Manual Override)

⚠️ **Use only in emergencies** when CI/CD is unavailable:

```bash
# Link to staging project
pnpm db:link:staging

# Apply migration manually to staging
supabase db push --dry-run  # Always dry-run first
supabase db push

# Link to production project (EMERGENCY ONLY)
pnpm db:link:prod
supabase db push --dry-run
supabase db push
```

**Security Note**: Manual production migrations should be avoided. Always use CI/CD pipeline for consistency and safety.

---

## 5) Link CLI to Remote Projects

### Prerequisites

Ensure you have project references in your `.env.local` file:

```bash
# These should already be in your .env.local from vercel env pull
SUPABASE_STAGING_PROJECT_REF=qijxfigergpnuqbaxtjv
SUPABASE_PROD_PROJECT_REF=pzgczflyltjyxwqyteuj
```

### Linking Commands

Link your local CLI to remote projects for testing and emergency operations:

```bash
# Link to staging project (for migration testing)
pnpm db:link:staging

# Link to production project (emergency use only)
pnpm db:link:prod
```

### What Linking Does

- ✅ Stores remote project configuration in local `.supabase/` directory
- ✅ Enables `supabase db push` to apply migrations remotely
- ✅ Allows `supabase db pull` to sync schema from remote
- ❌ Does NOT commit any secrets to repository

### When to Use Manual Linking

| Scenario              | Command                | Purpose                                       |
| --------------------- | ---------------------- | --------------------------------------------- |
| **Migration Testing** | `pnpm db:link:staging` | Test migrations against staging before CI/CD  |
| **Schema Sync**       | `supabase db pull`     | Sync remote schema to local development       |
| **Emergency Fix**     | `pnpm db:link:prod`    | Apply hotfix migration when CI/CD unavailable |

**⚠️ Important**: Production migrations should normally go through CI/CD pipeline, not manual linking.

---

## 6) Environment Variables Configuration

### Current State (✅ Already Configured)

Vercel environment variables are already set up for the two-environment model:

| Variable                        | Development (Preview)    | Production            | Notes           |
| ------------------------------- | ------------------------ | --------------------- | --------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | mike-staging URL         | mike-prod URL         | Client-safe     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | mike-staging anon key    | mike-prod anon key    | Client-safe     |
| `SUPABASE_SERVICE_ROLE_KEY`     | mike-staging service key | mike-prod service key | **Server-only** |
| `DATABASE_URL`                  | mike-staging DB URL      | mike-prod DB URL      | **Server-only** |

### Local Development Setup

Pull environment variables for local development:

```bash
# Pull Vercel environment variables to .env.local
vercel env pull

# Verify you have the required variables
grep SUPABASE .env.local
```

Your `.env.local` should contain:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321  # Local Docker
NEXT_PUBLIC_SUPABASE_ANON_KEY=<local-anon-key>  # From local Docker
SUPABASE_SERVICE_ROLE_KEY=<local-service-key>   # From local Docker
SUPABASE_STAGING_PROJECT_REF=qijxfigergpnuqbaxtjv
SUPABASE_PROD_PROJECT_REF=pzgczflyltjyxwqyteuj
```

### Environment Mapping Summary

```
┌─────────────────┬──────────────────┬──────────────────┐
│   Environment   │    Database      │     Dataset      │
├─────────────────┼──────────────────┼──────────────────┤
│ Local           │ Docker Supabase  │ development      │
│ Preview (PRs)   │ mike-staging     │ development      │
│ Production      │ mike-prod        │ production       │
└─────────────────┴──────────────────┴──────────────────┘
```

---

## 7) Security and RLS Guidelines

### Current Security Status

- ✅ **Environment Separation**: Staging and production use separate databases
- ✅ **Secret Management**: All credentials stored in Vercel, not in repository
- ✅ **CI/CD Security**: Migrations applied via secure GitHub Actions
- ⏳ **RLS Implementation**: To be implemented in Phase 1 when tables are created

### Security Rules

#### ✅ Always Do

- Use separate credentials for each environment
- Store service role keys server-side only
- Apply migrations via CI/CD pipeline
- Test RLS policies in staging before production
- Use `anon` role for client-side database access

#### ❌ Never Do

- Commit secrets, passwords, or service keys to repository
- Use production credentials in development/staging
- Expose `service_role` key to client-side code
- Apply production migrations manually without testing
- Share database credentials between environments

### RLS Implementation (Phase 1)

When implementing Row Level Security:

1. **Default Deny**: Start with deny-all policies
2. **Test in Staging**: Verify policies work with real data
3. **Gradual Rollout**: Enable RLS table by table
4. **Monitor**: Watch for permission errors after deployment

```sql
-- Example RLS policy (Phase 1)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);
```

---

## 8) Troubleshooting

### Common Issues

#### `supabase: command not found`

**Cause**: CLI not installed or not in PATH  
**Solution**:

```bash
# Install via Homebrew (macOS)
brew install supabase/tap/supabase

# Verify installation
supabase --version
```

#### `Docker not running` / `Cannot connect to Docker daemon`

**Cause**: Docker Desktop not started  
**Solution**:

```bash
# Start Docker Desktop application
# Then retry:
pnpm db:start
```

#### `No migrations found` / `Migrations not detected`

**Cause**: No migration files generated or committed  
**Solution**:

```bash
# Generate migration from schema changes
pnpm db:diff

# Commit the migration file
git add supabase/migrations/
git commit -m "feat(db): add new migration"
```

#### `Link project failed` / `Invalid project reference`

**Cause**: Missing or incorrect project references  
**Solution**:

```bash
# Verify project references in .env.local
grep SUPABASE_.*_PROJECT_REF .env.local

# Should show:
# SUPABASE_STAGING_PROJECT_REF=qijxfigergpnuqbaxtjv
# SUPABASE_PROD_PROJECT_REF=pzgczflyltjyxwqyteuj
```

#### `Permission denied` / `Unauthorized access`

**Cause**: Incorrect access token or project permissions  
**Solution**:

1. Verify Supabase access token in GitHub secrets
2. Check project permissions in Supabase dashboard
3. Ensure token has access to both mike-staging and mike-prod projects

#### `Migration failed` / `Schema conflict`

**Cause**: Migration conflicts with existing schema  
**Solution**:

```bash
# Test migration locally first
pnpm db:reset
pnpm db:start
# Verify migration applies cleanly

# Check for conflicting changes in remote
supabase db pull --linked
```

### CI/CD Pipeline Issues

#### GitHub Actions failing with "Secret not found"

**Cause**: Missing GitHub repository secrets  
**Solution**: Follow the [GitHub Pipeline Setup Guide](../operations/github-pipeline-setup.md) to configure all required secrets.

#### Staging migration successful but production fails

**Cause**: Schema differences between staging and production  
**Solution**:

1. **Never** apply migrations manually to production
2. Always test migrations in staging first via CI/CD
3. Use compensating migrations to fix production issues

### Getting Help

- **Supabase CLI Docs**: https://supabase.com/docs/guides/cli
- **Migration Guide**: https://supabase.com/docs/guides/database/migrations
- **GitHub Actions**: Check workflow logs in Actions tab
- **Project Status**: See `docs/logs/phase-0-log.md` for setup history
