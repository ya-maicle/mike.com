name: "Sanity Client Validation - Phase 0.18 Component"
description: |

## Purpose

Validate that the existing Sanity client configuration in apps/web/src/sanity/client.ts properly implements server-side only patterns and add a test function to verify GROQ connectivity as required by Phase 0.18 acceptance criteria.

## Core Principles

1. **Validation over recreation**: Client is well-implemented, just needs validation
2. **Server-only enforcement**: Verify no token leakage to client-side
3. **Environment readiness**: Ensure client works with environment variables
4. **Testing capability**: Add minimal GROQ test for manual verification

---

## Goal

Validate and enhance the existing Sanity client to meet Phase 0.18 acceptance criteria with minimal changes, focusing on adding a test function for manual GROQ verification.

## Why

- **Compliance**: Meet Phase 0.18 acceptance criteria for Sanity baseline
- **Validation**: Ensure server-only token usage is properly implemented
- **Testing**: Enable manual verification of Sanity connectivity

## What

- Review existing client implementation for security compliance
- Add test function for manual GROQ verification
- Ensure environment variable usage is correct
- Validate server-only token handling

### Success Criteria

- [ ] Existing client.ts reviewed and confirms server-only token usage
- [ ] Test function added for manual GROQ verification
- [ ] Environment variables properly referenced
- [ ] No client-side token exposure confirmed
- [ ] Manual test can be run to validate connectivity

## All Needed Context

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- file: apps/web/src/sanity/client.ts
  why: Existing implementation to validate and enhance

- file: docs/logs/phase-0-log.md
  why: Phase 0.18 acceptance criteria for Sanity client

- url: https://github.com/sanity-io/next-sanity
  why: Best practices for server-side usage patterns
```

### Current Codebase tree

```bash
mikeiu.com/
├── apps/
│   └── web/
│       └── src/
│           └── sanity/
│               └── client.ts          # EXISTING: Well-implemented client
```

### Desired Codebase tree with files to be added

```bash
mikeiu.com/
├── apps/
│   └── web/
│       └── src/
│           └── sanity/
│               ├── client.ts          # VALIDATE: Existing implementation
│               └── test-connection.ts # ADD: Test utility for validation
```

### Known Gotchas of current implementation

```typescript
// ✅ GOOD: Current implementation already has:
// - 'server-only' import for safety
// - Proper environment variable usage
// - Server-only token handling
// - Good patterns for ISR and caching

// NEED TO ADD: Test function for manual verification
```

## Implementation Blueprint

### List of tasks to be completed in order

```yaml
Task 1 - Review Existing Implementation:
  VALIDATE apps/web/src/sanity/client.ts:
    - CONFIRM 'server-only' import present
    - VERIFY environment variable usage
    - CHECK token is server-only
    - REVIEW caching and ISR patterns

Task 2 - Add Test Connection Utility:
  CREATE apps/web/src/sanity/test-connection.ts:
    - IMPORT existing sanityFetch function
    - CREATE simple test query function
    - ADD error handling and logging
    - EXPORT for manual verification

Task 3 - Add Test Script to Package.json:
  MODIFY apps/web/package.json:
    - ADD test script for manual Sanity verification
    - ENABLE easy manual testing per Phase 0.18 acceptance
```

### Per task pseudocode

```typescript
// Task 2: Test Connection Utility
// File: apps/web/src/sanity/test-connection.ts
import { sanityFetch } from './client'

export async function testSanityConnection(): Promise<boolean> {
  try {
    console.log('Testing Sanity connection...')
    console.log('Project ID:', process.env.NEXT_PUBLIC_SANITY_PROJECT_ID)
    console.log('Dataset:', process.env.NEXT_PUBLIC_SANITY_DATASET)

    // Simple query to test connectivity
    const result = await sanityFetch<any[]>('*[_type == "page"][0..0]', {})

    console.log('✅ Sanity connection successful')
    console.log('Query result:', result)
    return true
  } catch (error) {
    console.error('❌ Sanity connection failed:', error)
    return false
  }
}

// Enable direct execution for manual testing
if (require.main === module) {
  testSanityConnection().catch(console.error)
}
```

### Integration Points

```yaml
PACKAGE_JSON:
  - add to: apps/web/package.json scripts
    pattern: "test:sanity": "tsx src/sanity/test-connection.ts"

VALIDATION:
  - command: "pnpm --filter apps/web run test:sanity"
  - expected: Connection success or informative error
```

## Validation Loop

### Level 1: Implementation Review

```bash
# Review existing client implementation
cat apps/web/src/sanity/client.ts

# Verify server-only import present
grep "server-only" apps/web/src/sanity/client.ts

# Expected: 'server-only' import found
```

### Level 2: Test Function Creation

```bash
# Create and test the connection utility
cd apps/web
npx tsx src/sanity/test-connection.ts

# Expected: Either successful connection or informative error about missing env vars
```

### Level 3: Package Script Integration

```bash
# Test via package script
pnpm --filter apps/web run test:sanity

# Expected: Test runs and provides clear feedback
```

## Final validation Checklist

- [ ] Existing client.ts reviewed and validated for security
- [ ] 'server-only' import confirmed present
- [ ] Environment variable usage validated
- [ ] Test connection utility created and working
- [ ] Package script added for easy manual testing
- [ ] Manual test provides clear success/failure feedback
- [ ] No client-side token exposure confirmed

---

## Anti-Patterns to Avoid

- ❌ Don't recreate existing well-implemented code
- ❌ Don't remove the 'server-only' import
- ❌ Don't expose tokens to client-side in test functions
- ❌ Don't skip validation of existing implementation
- ❌ Don't create complex test queries that require content
