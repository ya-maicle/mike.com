name: "Testing Baseline with Vitest + React Testing Library - Phase 0.21"
description: |

## Purpose

Establish comprehensive testing infrastructure using Vitest and React Testing Library across the monorepo, implementing unit testing for both the Next.js application and UI components with proper CI integration to enforce testing standards.

## Core Principles

1. **Testing pyramid foundation**: Unit tests as the base layer for reliable testing
2. **Component isolation**: Test UI components independently with proper mocking
3. **Fast feedback**: Vitest for speed and developer experience
4. **CI enforcement**: Tests must pass for merge, fail on missing coverage
5. **Pattern consistency**: Establish testing patterns for future development

---

## Goal

Set up Vitest testing framework in both apps/web and packages/ui with sample tests, integrate into CI pipeline, and establish testing standards that will enforce minimum quality gates for all future development.

## Why

- **Quality assurance**: Prevent regressions and ensure code reliability
- **Developer confidence**: Enable safe refactoring and feature development
- **CI/CD safety**: Block broken code from reaching production
- **Team standards**: Establish testing patterns for consistent development

## What

- Install and configure Vitest in apps/web and packages/ui workspaces
- Set up React Testing Library with jest-dom for component testing
- Create sample tests for homepage and Button component
- Add test scripts to package.json files and root workspace
- Integrate tests into PR CI workflow with failure blocking
- Configure test coverage reporting and thresholds

### Success Criteria

- [ ] Vitest configured in both apps/web and packages/ui workspaces
- [ ] React Testing Library and jest-dom properly installed and configured
- [ ] Sample test for apps/web homepage component passes
- [ ] Sample test for packages/ui Button component passes
- [ ] Test scripts available at workspace and root levels
- [ ] PR CI workflow runs tests and blocks on failures
- [ ] Test coverage reporting configured with reasonable thresholds
- [ ] Missing tests cause CI failures to enforce testing standards

## All Needed Context

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- url: https://vitest.dev/guide/
  why: Official Vitest documentation for setup and configuration

- url: https://testing-library.com/docs/react-testing-library/intro/
  why: React Testing Library patterns and best practices

- url: https://github.com/testing-library/jest-dom
  why: Custom matchers for DOM testing assertions

- file: apps/web/src/app/page.tsx
  why: Homepage component to create test for

- file: packages/ui/src/components/Button.tsx
  why: Button component to create test for

- file: .github/workflows/pr.yml
  why: Existing PR workflow to integrate tests into

- file: package.json
  why: Root workspace scripts and dependency management

- file: apps/web/package.json
  why: Web app scripts and testing configuration

- file: packages/ui/package.json
  why: UI package scripts and testing configuration

- docfile: docs/product_requirements_document.md
  why: PRD section 4.8 testing strategy requirements
```

### Current Codebase tree

```bash
mikeiu.com/
├── .github/
│   └── workflows/
│       └── pr.yml                    # MODIFY: Add test step
├── apps/
│   └── web/
│       ├── src/
│       │   └── app/
│       │       └── page.tsx          # REFERENCE: Component to test
│       ├── package.json              # MODIFY: Add test dependencies
│       └── tsconfig.json             # REFERENCE: TypeScript config
├── packages/
│   └── ui/
│       ├── src/
│       │   └── components/
│       │       └── Button.tsx        # REFERENCE: Component to test
│       ├── package.json              # MODIFY: Add test dependencies
│       └── tsconfig.json             # REFERENCE: TypeScript config
└── package.json                      # MODIFY: Add root test scripts
```

### Desired Codebase tree with files to be added

```bash
mikeiu.com/
├── .github/
│   └── workflows/
│       └── pr.yml                    # MODIFY: Add test execution
├── apps/
│   └── web/
│       ├── src/
│       │   ├── app/
│       │   │   └── page.tsx          # EXISTING: Component to test
│       │   └── __tests__/
│       │       └── page.test.tsx     # CREATE: Homepage test
│       ├── vitest.config.ts          # CREATE: Vitest configuration
│       ├── package.json              # MODIFY: Add test dependencies
│       └── setupTests.ts             # CREATE: Test setup file
├── packages/
│   └── ui/
│       ├── src/
│       │   └── components/
│       │       ├── Button.tsx        # EXISTING: Component to test
│       │       └── Button.test.tsx   # CREATE: Button component test
│       ├── vitest.config.ts          # CREATE: Vitest configuration
│       ├── package.json              # MODIFY: Add test dependencies
│       └── setupTests.ts             # CREATE: Test setup file
└── package.json                      # MODIFY: Add root test scripts
```

### Known Gotchas of our codebase & Testing Library Quirks

```typescript
// CRITICAL: Vitest configuration for Next.js compatibility
// Use @vitejs/plugin-react for JSX transformation
// Configure path mapping for @/* imports

// CRITICAL: React Testing Library setup
// Need @testing-library/jest-dom for DOM matchers
// Import setup in vitest.config.ts setupFiles

// GOTCHA: Monorepo workspace testing
// Each workspace needs its own vitest.config.ts
// Root level scripts should run tests across workspaces

// GOTCHA: Next.js App Router testing
// Use next/navigation mocks for useRouter, usePathname
// Test server components differently from client components

// PATTERN: Component testing structure
// Arrange (render), Act (user interactions), Assert (expectations)
// Use screen.getByRole() for accessibility-focused queries

// PATTERN: Test file naming
// Co-locate: Button.tsx -> Button.test.tsx
// Or __tests__ directory: __tests__/Button.test.tsx
```

## Implementation Blueprint

### Data models and structure

```typescript
// Testing Configuration Structure
VITEST_CONFIG = {
  environment: 'jsdom', // For DOM testing
  setupFiles: ['./setupTests.ts'], // Jest-dom setup
  globals: true, // For describe, it, expect globals
}

// Test Dependencies Required
DEPENDENCIES = {
  vitest: '^2.0.0',
  '@testing-library/react': '^16.0.0',
  '@testing-library/jest-dom': '^6.0.0',
  '@testing-library/user-event': '^14.0.0',
  jsdom: '^25.0.0',
  '@vitejs/plugin-react': '^4.0.0',
}

// Test Script Structure
SCRIPTS = {
  test: 'vitest run',
  'test:watch': 'vitest',
  'test:ui': 'vitest --ui',
  'test:coverage': 'vitest run --coverage',
}
```

### List of tasks to be completed in order

```yaml
Task 1 - Install Testing Dependencies:
  MODIFY apps/web/package.json:
    - ADD vitest and testing library dependencies
    - ADD test scripts for development and CI

  MODIFY packages/ui/package.json:
    - ADD vitest and testing library dependencies
    - ADD test scripts for component testing

Task 2 - Configure Vitest for Apps/Web:
  CREATE apps/web/vitest.config.ts:
    - CONFIGURE environment as jsdom for DOM testing
    - SET UP path mapping for @/* imports
    - INCLUDE React plugin for JSX transformation

  CREATE apps/web/setupTests.ts:
    - IMPORT @testing-library/jest-dom matchers
    - ADD any global test setup needed

Task 3 - Configure Vitest for Packages/UI:
  CREATE packages/ui/vitest.config.ts:
    - CONFIGURE for React component testing
    - SET UP proper TypeScript and JSX handling

  CREATE packages/ui/setupTests.ts:
    - IMPORT jest-dom for enhanced DOM assertions
    - CONFIGURE component testing environment

Task 4 - Create Sample Tests:
  CREATE apps/web/src/__tests__/page.test.tsx:
    - TEST homepage component rendering
    - VERIFY basic content and structure
    - DEMONSTRATE Next.js component testing patterns

  CREATE packages/ui/src/components/Button.test.tsx:
    - TEST Button component variants and props
    - VERIFY accessibility and user interactions
    - DEMONSTRATE UI component testing patterns

Task 5 - Add Root Workspace Scripts:
  MODIFY package.json:
    - ADD test scripts that run across workspaces
    - INCLUDE test:ci script for continuous integration
    - CONFIGURE coverage collection and reporting

Task 6 - Integrate Tests into CI Pipeline:
  MODIFY .github/workflows/pr.yml:
    - ADD test execution step after lint
    - ENSURE test failures block merge
    - CONFIGURE test result reporting
```

### Per task pseudocode

```typescript
// Task 2: Vitest Configuration for Apps/Web
// File: apps/web/vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./setupTests.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

// Task 4: Sample Homepage Test
// File: apps/web/src/__tests__/page.test.tsx
import { render, screen } from '@testing-library/react'
import Home from '../app/page'

describe('Home Page', () => {
  it('renders homepage content', () => {
    render(<Home />)

    // Test for main content or headings
    expect(screen.getByRole('main')).toBeInTheDocument()

    // Add specific assertions based on homepage content
    // This is a minimal example - expand based on actual page content
  })

  it('has proper document structure', () => {
    render(<Home />)

    // Test accessibility and structure
    expect(document.title).toBeDefined()
  })
})

// Task 4: Sample Button Test
// File: packages/ui/src/components/Button.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)

    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>Click me</Button>)

    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies variant classes correctly', () => {
    render(<Button variant="primary">Primary Button</Button>)

    const button = screen.getByRole('button')
    // Add assertions based on your Button component implementation
    expect(button).toHaveClass('primary') // Adjust based on actual classes
  })
})
```

### Integration Points

```yaml
CI_INTEGRATION:
  - workflow: .github/workflows/pr.yml
  - step: Run tests after lint, before build
  - blocking: Test failures prevent merge

MONOREPO_INTEGRATION:
  - root_scripts: Run tests across all workspaces
  - workspace_scripts: Individual package testing
  - coverage: Aggregate coverage reporting

DEVELOPMENT_INTEGRATION:
  - watch_mode: Vitest watch for TDD workflow
  - vscode: Test runner integration
  - debugging: Browser-based test debugging with --ui
```

## Validation Loop

### Level 1: Test Configuration Verification

```bash
# Verify Vitest installation and configuration
cd apps/web && pnpm vitest --version
cd packages/ui && pnpm vitest --version

# Test configuration syntax
cd apps/web && pnpm vitest --config vitest.config.ts --reporter=verbose --run
cd packages/ui && pnpm vitest --config vitest.config.ts --reporter=verbose --run

# Expected: Vitest runs without configuration errors
```

### Level 2: Sample Test Execution

```bash
# Run individual workspace tests
pnpm --filter apps/web test
pnpm --filter packages/ui test

# Run all tests from root
pnpm test

# Expected: All sample tests pass successfully
```

### Level 3: CI Integration Test

```bash
# Simulate CI test execution
pnpm test:ci

# Create failing test to verify CI blocking
# Add intentionally failing assertion and verify CI fails
echo "expect(true).toBe(false)" >> apps/web/src/__tests__/page.test.tsx
pnpm test

# Expected: Tests fail and CI would block merge
# Remember to revert failing test after verification
```

## Final validation Checklist

- [ ] Vitest configured and working in apps/web workspace
- [ ] Vitest configured and working in packages/ui workspace
- [ ] React Testing Library properly set up with jest-dom matchers
- [ ] Sample homepage test passes and demonstrates patterns
- [ ] Sample Button component test passes and demonstrates UI testing
- [ ] Root workspace test scripts run tests across all packages
- [ ] PR CI workflow includes test execution step
- [ ] Test failures properly block CI pipeline
- [ ] Test coverage reporting configured and working
- [ ] Missing tests can be detected and enforced in future

---

## Anti-Patterns to Avoid

- ❌ Don't skip test setup files - jest-dom matchers are essential
- ❌ Don't use different testing frameworks across workspaces
- ❌ Don't ignore test failures in CI - they must block merges
- ❌ Don't test implementation details - focus on user behavior
- ❌ Don't create tests without assertions - every test must verify something
- ❌ Don't skip accessibility in component tests - use proper queries
- ❌ Don't hardcode test data that couples tests to implementation
