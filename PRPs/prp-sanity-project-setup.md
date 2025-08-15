name: "Sanity Project and Datasets Setup - Phase 0.18"
description: |

## Purpose

Set up Sanity CMS project with proper datasets and server-side configuration for mikeiu.com Next.js app, enabling content management across development, staging, and production environments.

## Core Principles

1. **Server-only tokens**: Sanity API tokens must never be exposed to client-side
2. **Dataset separation**: Development, staging, production datasets for proper isolation
3. **Environment consistency**: Proper env var mapping across Vercel environments
4. **Security first**: Server-only access patterns, no draft content leaks

---

## Goal

Create and configure a Sanity project with proper datasets and environment variables to enable CMS-driven content for mikeiu.com, following the established security patterns and environment separation.

## Why

- **Business value**: Enables content management without code deployments
- **Integration**: Prepares foundation for Phase 2 Sanity content integration
- **Problems solved**: Provides content creators with CMS while maintaining security

## What

- Create Sanity project "mikeiu" with development/staging/production datasets
- Generate server-only read token
- Seed Vercel environments with proper Sanity configuration
- Configure apps/web/src/sanity/client.ts for server-side usage
- Update environment documentation

### Success Criteria

- [ ] Sanity project created with 3 datasets (development, staging, production)
- [ ] Vercel environments contain proper Sanity variables for all envs
- [ ] Local `vercel env pull` updates .env.local with development dataset
- [ ] Minimal GROQ fetch works locally using server client
- [ ] No Sanity tokens exposed to client-side code
- [ ] Environment documentation updated

## All Needed Context

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- url: https://www.sanity.io/docs
  why: Official Sanity documentation for project setup and API tokens

- url: https://github.com/sanity-io/next-sanity
  why: Next.js integration patterns and server-side usage

- file: docs/logs/phase-0-log.md
  why: Context for Phase 0.18 requirements and acceptance criteria

- file: ENVIRONMENT.md
  why: Current environment variable patterns and structure

- file: .env.example
  why: Current environment variable template structure

- file: apps/web/src/sanity/client.ts
  why: Existing Sanity client stub that needs proper configuration

- doc: https://www.sanity.io/docs/api-tokens
  section: API tokens and security best practices
  critical: Server-only tokens should never be exposed to client
```

### Current Codebase tree

```bash
mikeiu.com/
├── apps/
│   └── web/
│       └── src/
│           └── sanity/
│               └── client.ts          # Existing stub
├── docs/
│   └── logs/
│       └── phase-0-log.md            # Task 0.18 requirements
├── ENVIRONMENT.md                    # Env var documentation
├── .env.example                      # Env var template
└── README.md                         # Project overview
```

### Desired Codebase tree with files to be added/modified

```bash
mikeiu.com/
├── apps/
│   └── web/
│       └── src/
│           └── sanity/
│               └── client.ts          # CONFIGURE: Server-side client
├── ENVIRONMENT.md                    # UPDATE: Add Sanity variables
├── .env.example                      # UPDATE: Add Sanity placeholders
└── README.md                         # UPDATE: Sanity setup instructions
```

### Known Gotchas of our codebase & Sanity Quirks

```typescript
// CRITICAL: Sanity tokens must be server-only
// ❌ NEVER expose tokens to client-side
export const client = createClient({
  token: process.env.SANITY_API_READ_TOKEN, // Server-only!
})

// ✅ CORRECT: Server-side usage only
import { client } from '@/sanity/client'
// Use in API routes, server components, server actions

// GOTCHA: Dataset names must match environment
// development → development dataset
// staging → staging dataset
// production → production dataset

// GOTCHA: Vercel Preview environment uses development dataset
// Preview/PR → development (read-only for testing)
```

## Implementation Blueprint

### Data models and structure

```typescript
// Sanity Project Structure
Project: "mikeiu"
├── Dataset: "development"    # For local dev + PR previews
├── Dataset: "staging"        # For staging.mikeiu.com
└── Dataset: "production"     # For mikeiu.com

// Environment Variable Mapping
NEXT_PUBLIC_SANITY_PROJECT_ID: "mikeiu"
NEXT_PUBLIC_SANITY_DATASET: varies by env
SANITY_API_READ_TOKEN: server-only token
```

### List of tasks to be completed in order

```yaml
Task 1 - Create Sanity Project:
  MANUAL_STEP: Create project via Sanity dashboard
  - Go to sanity.io/manage
  - Create new project: "mikeiu"
  - Create datasets: development, staging, production
  - Generate read-only API token

Task 2 - Configure Vercel Environment Variables:
  MODIFY Vercel project environments:
  - Add NEXT_PUBLIC_SANITY_PROJECT_ID to all envs
  - Add NEXT_PUBLIC_SANITY_DATASET per env mapping
  - Add SANITY_API_READ_TOKEN (server-only) to all envs
  - Ensure staging → staging dataset
  - Ensure production → production dataset
  - Ensure preview → development dataset

Task 3 - Update Sanity Client Configuration:
  MODIFY apps/web/src/sanity/client.ts:
  - REPLACE stub with proper createClient config
  - VERIFY server-only token usage
  - ADD dataset environment mapping
  - PRESERVE existing import patterns

Task 4 - Update Environment Documentation:
  MODIFY .env.example:
  - ADD Sanity environment variables
  - PRESERVE existing structure
  - INCLUDE helpful comments

  MODIFY ENVIRONMENT.md:
  - ADD Sanity variables section
  - DOCUMENT env → dataset mapping
  - PRESERVE existing format

Task 5 - Test Local Configuration:
  ACTION: Run vercel env pull
  - VERIFY .env.local gets Sanity variables
  - TEST minimal GROQ query locally
  - VALIDATE server-only token usage
```

### Per task pseudocode

```typescript
// Task 3: Sanity Client Configuration
// File: apps/web/src/sanity/client.ts
import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01', // Use current date
  useCdn: process.env.NODE_ENV === 'production',
  // CRITICAL: Token is server-only
  token: process.env.SANITY_API_READ_TOKEN,
})

// VALIDATION: Test query function
export async function testSanityConnection() {
  try {
    const result = await client.fetch('*[_type == "page"][0..0]')
    console.log('Sanity connection successful:', result)
    return true
  } catch (error) {
    console.error('Sanity connection failed:', error)
    return false
  }
}
```

### Integration Points

```yaml
VERCEL_ENVIRONMENTS:
  - add to: Production environment
    pattern:
      NEXT_PUBLIC_SANITY_PROJECT_ID: 'mikeiu'
      NEXT_PUBLIC_SANITY_DATASET: 'production'
      SANITY_API_READ_TOKEN: '[generated-read-token]'

  - add to: Preview environment
    pattern:
      NEXT_PUBLIC_SANITY_PROJECT_ID: 'mikeiu'
      NEXT_PUBLIC_SANITY_DATASET: 'development'
      SANITY_API_READ_TOKEN: '[generated-read-token]'

ENVIRONMENT_DOCS:
  - update: .env.example
    pattern: 'NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id'

  - update: ENVIRONMENT.md
    section: 'Add Sanity CMS section with env mappings'
```

## Validation Loop

### Level 1: Configuration Validation

```bash
# Verify environment variables are set
echo $NEXT_PUBLIC_SANITY_PROJECT_ID
echo $NEXT_PUBLIC_SANITY_DATASET
echo $SANITY_API_READ_TOKEN

# Expected: All variables should have values
```

### Level 2: Connection Test

```typescript
// CREATE apps/web/src/sanity/test.ts for validation
import { testSanityConnection } from './client'

async function validate() {
  const isConnected = await testSanityConnection()
  if (!isConnected) {
    throw new Error('Sanity connection failed')
  }
  console.log('✅ Sanity connection validated')
}

validate().catch(console.error)
```

```bash
# Run connection test
cd apps/web && npx tsx src/sanity/test.ts

# Expected: "✅ Sanity connection validated"
```

### Level 3: Environment Mapping Test

```bash
# Test different environment datasets
NEXT_PUBLIC_SANITY_DATASET=development npx tsx src/sanity/test.ts
NEXT_PUBLIC_SANITY_DATASET=staging npx tsx src/sanity/test.ts
NEXT_PUBLIC_SANITY_DATASET=production npx tsx src/sanity/test.ts

# Expected: All should connect successfully
```

## Final validation Checklist

- [ ] Sanity project "mikeiu" created with 3 datasets
- [ ] Vercel environments configured with proper variables
- [ ] Local `vercel env pull` works and populates .env.local
- [ ] Connection test passes: `npx tsx src/sanity/test.ts`
- [ ] No client-side token exposure verified
- [ ] Environment documentation updated
- [ ] No secrets committed to repository

---

## Anti-Patterns to Avoid

- ❌ Don't expose SANITY_API_READ_TOKEN to client-side code
- ❌ Don't use the same dataset for all environments
- ❌ Don't skip environment variable validation
- ❌ Don't hardcode project ID or dataset names
- ❌ Don't commit .env.local or actual tokens to git
- ❌ Don't mix development and production data
