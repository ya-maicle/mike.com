name: "Playwright Smoke Tests for Staging - Phase 0.22"
description: |

## Purpose

Implement Playwright end-to-end smoke tests that run against the staging environment after deployment, providing automated validation of critical application functionality and blocking production promotion on failures.

## Core Principles

1. **Smoke test focus**: Test critical paths, not comprehensive coverage
2. **Staging validation**: Run against real staging environment
3. **Production gatekeeper**: Block promotion on smoke test failures
4. **Fast execution**: Keep tests quick for rapid feedback
5. **Reliable assertions**: Test real user scenarios, not implementation details

---

## Goal

Set up Playwright for end-to-end testing with smoke tests that validate the health API and basic page rendering on staging.mikeiu.com, integrated into the main CI pipeline to prevent broken deployments from reaching production.

## Why

- **Production safety**: Catch integration issues before production deployment
- **User experience validation**: Ensure critical user paths work in staging
- **Deployment confidence**: Automated validation of staging environment
- **Regression prevention**: Early detection of breaking changes

## What

- Install and configure Playwright at the monorepo root
- Create smoke test specification for staging environment validation
- Test GET /api/health endpoint returns 200 with expected payload
- Test homepage renders basic content and structure
- Integrate smoke tests into main CI workflow after staging deployment
- Configure test failure to block production promotion

### Success Criteria

- [ ] Playwright installed and configured at repository root
- [ ] Smoke test spec created with health API and homepage tests
- [ ] Tests run successfully against staging.mikeiu.com
- [ ] Health endpoint test validates 200 status and response body
- [ ] Homepage test validates basic rendering and content
- [ ] Smoke tests integrated into main CI workflow
- [ ] Test failures block production promotion workflow
- [ ] Scripts available for local and CI execution

## All Needed Context

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- url: https://playwright.dev/docs/intro
  why: Official Playwright documentation for setup and configuration

- url: https://playwright.dev/docs/ci-intro
  why: CI integration patterns and best practices

- file: apps/web/src/app/api/health/route.ts
  why: Health API endpoint to understand expected response format

- file: apps/web/src/app/page.tsx
  why: Homepage component to understand structure for testing

- file: .github/workflows/main.yml
  why: Main workflow to integrate smoke tests after staging deployment

- file: docs/logs/phase-0-log.md
  why: Section 0.20 staging deployment workflow context

- docfile: PRPs/03prp_vercel_deployment_staging.md
  why: Staging deployment context and URL patterns

- docfile: docs/product_requirements_document.md
  why: PRD section 4.8 E2E testing strategy and requirements
```

### Current Codebase tree

```bash
mikeiu.com/
├── .github/
│   └── workflows/
│       └── main.yml                  # MODIFY: Add smoke test job
├── apps/
│   └── web/
│       └── src/
│           └── app/
│               ├── api/
│               │   └── health/
│               │       └── route.ts  # REFERENCE: Health endpoint
│               └── page.tsx          # REFERENCE: Homepage component
└── package.json                      # MODIFY: Add Playwright scripts
```

### Desired Codebase tree with files to be added

```bash
mikeiu.com/
├── .github/
│   └── workflows/
│       └── main.yml                  # MODIFY: Add smoke-tests job
├── tests/
│   └── smoke/
│       └── staging.spec.ts           # CREATE: Smoke test specification
├── playwright.config.ts              # CREATE: Playwright configuration
├── package.json                      # MODIFY: Add Playwright dependencies
└── .gitignore                        # MODIFY: Ignore test results
```

### Known Gotchas of our codebase & Playwright Quirks

```typescript
// CRITICAL: Playwright requires explicit base URL configuration
// Use staging.mikeiu.com for smoke tests, not localhost

// CRITICAL: Health API response format
// Verify actual response structure from /api/health endpoint
// Test both status code and response body content

// GOTCHA: CI environment configuration
// Install Playwright browsers in GitHub Actions
// Use headless mode for CI execution

// GOTCHA: Test timing and retries
// Add proper waits for page load and network requests
// Configure retries for flaky network conditions

// PATTERN: Page object pattern not needed for smoke tests
// Keep tests simple and direct for quick execution
// Focus on critical user paths, not comprehensive coverage

// PATTERN: Environment-specific configuration
// Use environment variables for staging URL
// Enable test debugging in local development
```

## Implementation Blueprint

### Data models and structure

```typescript
// Playwright Configuration Structure
PLAYWRIGHT_CONFIG = {
  baseURL: 'https://staging.mikeiu.com',
  timeout: 30000,
  retries: 2,
  use: {
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
}

// Test Structure
SMOKE_TESTS = {
  'Health API': {
    endpoint: '/api/health',
    expectedStatus: 200,
    expectedBody: { status: 'ok' }, // Adjust based on actual response
  },
  Homepage: {
    url: '/',
    expectedTitle: 'mikeiu.com', // Adjust based on actual title
    expectedContent: 'main content', // Adjust based on actual page
  },
}

// CI Integration Points
CI_JOBS = {
  'smoke-tests': {
    dependsOn: 'deploy-staging',
    blocksJobt: 'promote-production',
    timeout: '10 minutes',
  },
}
```

### List of tasks to be completed in order

```yaml
Task 1 - Install and Configure Playwright:
  MODIFY package.json:
    - ADD @playwright/test as dev dependency
    - ADD test scripts for smoke tests

  CREATE playwright.config.ts:
    - CONFIGURE base URL for staging environment
    - SET UP timeouts, retries, and browser options
    - CONFIGURE test output and reporting

Task 2 - Create Smoke Test Specification:
  CREATE tests/smoke/staging.spec.ts:
    - TEST health API endpoint functionality
    - TEST homepage basic rendering
    - IMPLEMENT proper assertions and error handling

  CREATE tests directory structure:
    - ORGANIZE smoke tests separately from unit tests
    - PREPARE for future E2E test expansion

Task 3 - Configure Health API Test:
  IMPLEMENT health endpoint validation:
    - TEST GET /api/health returns 200 status
    - VERIFY response body contains expected payload
    - HANDLE network errors and timeouts gracefully

Task 4 - Configure Homepage Smoke Test:
  IMPLEMENT basic page rendering test:
    - TEST homepage loads without errors
    - VERIFY basic content structure is present
    - CHECK for fundamental page elements

Task 5 - Add Local Development Scripts:
  MODIFY package.json:
    - ADD e2e:smoke script for local testing
    - ADD e2e:smoke:ci script for CI execution
    - CONFIGURE debug mode for development

Task 6 - Integrate into Main CI Workflow:
  MODIFY .github/workflows/main.yml:
    - ADD smoke-tests job after deploy-staging
    - CONFIGURE job to block promote-production on failure
    - INSTALL Playwright browsers in CI environment
```

### Per task pseudocode

```typescript
// Task 1: Playwright Configuration
// File: playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/smoke',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'https://staging.mikeiu.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
})

// Task 2: Smoke Test Implementation
// File: tests/smoke/staging.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Staging Environment Smoke Tests', () => {
  test('health API returns 200 with ok status', async ({ request }) => {
    const response = await request.get('/api/health')

    expect(response.status()).toBe(200)

    const body = await response.json()
    expect(body).toHaveProperty('status', 'ok')
    // Add more specific assertions based on actual health response
  })

  test('homepage renders basic content', async ({ page }) => {
    await page.goto('/')

    // Wait for page load
    await page.waitForLoadState('networkidle')

    // Test page title
    await expect(page).toHaveTitle(/mikeiu/i)

    // Test main content area exists
    await expect(page.locator('main')).toBeVisible()

    // Add more specific assertions based on actual homepage content
  })

  test('basic navigation works', async ({ page }) => {
    await page.goto('/')

    // Test that basic page structure loads
    await expect(page.locator('body')).toBeVisible()

    // Verify no major JavaScript errors
    // Note: Add more navigation tests as the app grows
  })
})

// Task 6: CI Integration
// Addition to .github/workflows/main.yml
smoke-tests:
  name: "Run Staging Smoke Tests"
  runs-on: ubuntu-latest
  needs: deploy-staging
  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'pnpm'

    - name: Install dependencies
      run: pnpm install

    - name: Install Playwright browsers
      run: pnpm exec playwright install chromium

    - name: Run smoke tests
      run: pnpm run e2e:smoke:ci
      env:
        PLAYWRIGHT_BASE_URL: https://staging.mikeiu.com

    - name: Upload test results
      uses: actions/upload-artifact@v4
      if: failure()
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
```

### Integration Points

```yaml
CI_WORKFLOW_INTEGRATION:
  - depends_on: deploy-staging job completion
  - blocks: promote-production job on failure
  - provides: staging environment validation

STAGING_ENVIRONMENT:
  - base_url: https://staging.mikeiu.com
  - endpoints: /api/health, / (homepage)
  - validation: Real environment testing

REPORTING_INTEGRATION:
  - artifacts: Playwright HTML report on failures
  - screenshots: Captured on test failures
  - videos: Recorded for failed tests (optional)

DEVELOPMENT_INTEGRATION:
  - local_testing: Run smoke tests against staging
  - debugging: Playwright inspector and trace viewer
  - maintenance: Easy test updates as app evolves
```

## Validation Loop

### Level 1: Playwright Installation and Configuration

```bash
# Verify Playwright installation
pnpm exec playwright --version

# Install browsers for testing
pnpm exec playwright install chromium

# Validate configuration
pnpm exec playwright test --config=playwright.config.ts --dry-run

# Expected: Configuration loads without errors, tests discovered
```

### Level 2: Local Smoke Test Execution

```bash
# Run smoke tests against staging
pnpm run e2e:smoke

# Debug mode for development
pnpm exec playwright test --debug

# Generate and view test report
pnpm exec playwright show-report

# Expected: All smoke tests pass against staging environment
```

### Level 3: CI Integration Validation

```bash
# Simulate CI environment locally
CI=true pnpm run e2e:smoke:ci

# Test with failing scenario (temporarily break a test)
# Verify CI job would fail appropriately

# Check artifact generation on failure
ls -la playwright-report/

# Expected: Tests run in CI mode, artifacts generated on failure
```

## Final validation Checklist

- [ ] Playwright installed and configured at repository root
- [ ] Smoke test specification created and organized properly
- [ ] Health API test validates endpoint status and response
- [ ] Homepage test validates basic page rendering
- [ ] Local development scripts work for testing and debugging
- [ ] CI integration runs smoke tests after staging deployment
- [ ] Test failures block production promotion in workflow
- [ ] Test artifacts captured for debugging failed runs
- [ ] Configuration ready for future E2E test expansion

---

## Anti-Patterns to Avoid

- ❌ Don't create comprehensive E2E tests - keep smoke tests focused
- ❌ Don't test against localhost - use real staging environment
- ❌ Don't ignore test failures in CI - they must block promotion
- ❌ Don't hardcode test data that will break easily
- ❌ Don't skip browser installation in CI environment
- ❌ Don't create flaky tests - add proper waits and retries
- ❌ Don't test implementation details - focus on user behavior
