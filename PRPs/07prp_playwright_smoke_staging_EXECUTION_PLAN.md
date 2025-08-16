# Execution Plan — Playwright Smoke Tests for Staging (PRP 07)

Name: Playwright Smoke Tests for Staging — Detailed Execution TODO  
Owner: Engineering  
Status: Planned  
Target branch: `feat/tests-playwright-smoke-staging`  
CI Gate: Block production promotion when smoke tests fail

---

## Objective

Implement Playwright end-to-end smoke tests that run against the staging environment immediately after staging deployment. The job must block production promotion on failure.

This plan is the end-to-end checklist from branching off `main` to PR submission and merge, aligned with our trunk-based workflow, Conventional Commits, and Phase 0 requirements.

---

## Scope

- Install and configure Playwright at the monorepo root
- Add a minimal smoke spec for:
  - GET `/api/health` → status 200 and expected JSON body
  - Homepage `/` → basic rendering and structure
- Add root-level scripts to run smoke tests locally and in CI
- Integrate a `smoke-tests` job in the main CI workflow after `deploy-staging`, and make `promote-production` depend on it
- Ensure CI artifacts are captured on failure (HTML report, screenshots, videos/traces as configured)

Out of scope (for this PRP/phase):

- Comprehensive E2E coverage
- Page Object Model
- Auth flows or deep user journeys

---

## Pre‑flight checks

- Confirm staging URL (default): `https://staging.mikeiu.com`
- Confirm CI job names:
  - Staging deploy job: `deploy-staging` (adjust if named differently)
  - Production promotion job: `promote-production` (adjust if named differently)
- Inspect current endpoints and content:
  - `apps/web/src/app/api/health/route.ts` — returns:
    ```ts
    {
      status: 'ok',
      service: 'web',
      timestamp: string (ISO)
    }
    ```
  - `apps/web/src/app/page.tsx` — for basic homepage assertions (title, main content)

---

## Files to add/modify

- ADD `playwright.config.ts` (root)
- ADD `tests/smoke/staging.spec.ts`
- MODIFY `.gitignore` to ignore test artifacts (if missing)
- MODIFY `package.json` (root) to add devDependencies and scripts
- MODIFY or CREATE `.github/workflows/main.yml` to add `smoke-tests` job after deploy to staging and gate promotion

---

## Step‑by‑step TODO

1. Create feature branch (trunk‑based workflow)

- [x] Sync and branch:
  ```bash
  git checkout main
  git pull --rebase origin main
  git switch -c feat/tests-playwright-smoke-staging
  git push -u origin feat/tests-playwright-smoke-staging
  ```

2. Add Playwright to the repo root

- [x] Add dev dependency `@playwright/test`
- [x] Add root scripts for local/CI execution
- [x] Install dependencies:
  ```bash
  pnpm install
  ```

3. Create Playwright configuration

- [x] Create `playwright.config.ts` with conservative CI settings and staging base URL. Example:

  ```ts
  // playwright.config.ts
  import { defineConfig } from '@playwright/test'

  export default defineConfig({
    testDir: './tests/smoke',
    timeout: 30_000,
    expect: {
      timeout: 5_000,
    },
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined, // reduce flakiness against live env
    reporter: 'html',
    outputDir: 'test-results',
    use: {
      baseURL: process.env.PLAYWRIGHT_BASE_URL || 'https://staging.mikeiu.com',
      headless: true,
      trace: 'on-first-retry',
      screenshot: 'only-on-failure',
      video: 'retain-on-failure',
    },
  })
  ```

4. Add the smoke test spec

- [x] Create `tests/smoke/staging.spec.ts`:

  ```ts
  import { test, expect } from '@playwright/test'

  test.describe('Staging Smoke', () => {
    test('Health API returns 200 and expected body', async ({ request }) => {
      const res = await request.get('/api/health')
      expect(res.status()).toBe(200)

      const body = await res.json()
      expect(body).toHaveProperty('status', 'ok')
      expect(body).toHaveProperty('service', 'web')
      expect(typeof body.timestamp).toBe('string')
      // Optional: basic timestamp shape check:
      expect(() => new Date(body.timestamp)).not.toThrow()
    })

    test('Homepage renders basic content', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Title defaults can vary; use a regex fallback to avoid flakiness
      await expect(page).toHaveTitle(/mikeiu|mikeiu\.com|mike/i)

      // Basic structure should include a main content area
      await expect(page.locator('main')).toBeVisible()
    })
  })
  ```

5. Add scripts in `package.json` (root)

- [x] Add/ensure:
  ```json
  {
    "scripts": {
      "e2e:install-browsers": "playwright install --with-deps chromium",
      "e2e:smoke": "playwright test --config=playwright.config.ts",
      "e2e:smoke:debug": "PWDEBUG=1 playwright test --config=playwright.config.ts",
      "e2e:smoke:ci": "playwright test --config=playwright.config.ts --reporter=html"
    },
    "devDependencies": {
      "@playwright/test": "^1.49.0"
    }
  }
  ```

6. Ignore test artifacts

- [x] Update `.gitignore`:
  ```
  # Playwright
  playwright-report/
  test-results/
  blob-report/
  .playwright-cache/
  ```

7. Local validation loop (against staging)

- [x] Install Playwright browsers (local one-time):
  ```bash
  pnpm run e2e:install-browsers
  ```
- [x] Dry-run config and discover tests:
  ```bash
  pnpm exec playwright test --config=playwright.config.ts --list
  ```
- [x] Run smoke tests locally:
  ```bash
  pnpm run e2e:smoke
  ```
- [ ] If needed, debug:
  ```bash
  pnpm run e2e:smoke:debug
  ```
- [ ] View report:
  ```bash
  pnpm exec playwright show-report
  ```

8. CI integration

- [x] Edit or create `.github/workflows/main.yml`:
  - Add a `smoke-tests` job that:
    - `needs: deploy-staging`
    - Installs Node + PNPM and dependencies
    - Installs Playwright browsers
    - Runs smoke tests with `PLAYWRIGHT_BASE_URL` set to staging
    - Uploads artifacts on failure
  - Gate production promotion on smoke-tests success:
    - Ensure `promote-production` has `needs: [smoke-tests]` (and any other required jobs)

  Minimal job example:

  ```yaml
  smoke-tests:
    name: Run Staging Smoke Tests
    runs-on: ubuntu-latest
    needs: deploy-staging
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Setup PNPM
        uses: pnpm/action-setup@v3
        with:
          version: 9

      - name: Install deps
        run: pnpm install

      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps chromium

      - name: Run smoke tests
        run: pnpm run e2e:smoke:ci
        env:
          PLAYWRIGHT_BASE_URL: https://staging.mikeiu.com

      - name: Upload report on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
  ```

  Example promotion gating:

  ```yaml
  promote-production:
    needs: [build, deploy-staging, smoke-tests] # adjust as needed
    if: ${{ needs.smoke-tests.result == 'success' }}
    runs-on: ubuntu-latest
    steps:
      # ...
  ```

9. Simulate CI locally (optional but recommended)

- [ ] Validate CI-mode behavior:
  ```bash
  CI=true PLAYWRIGHT_BASE_URL=https://staging.mikeiu.com pnpm run e2e:smoke:ci
  ```
- [ ] Temporarily force a failing assertion to confirm artifact generation, then revert.

10. Commit with Conventional Commits

- [ ] Commit changes in logical chunks:
  ```bash
  git add -A
  git commit -m "feat(tests): add Playwright smoke tests and root configuration"
  git commit -m "ci: run smoke tests after staging deploy and gate prod promotion"
  git push
  ```

11. Open PR and complete template

- [ ] Open a PR against `main` with:
  - Problem: Need staging smoke checks to block broken promotions
  - Approach: Root Playwright config + minimal smoke spec + CI gating
  - Test Plan: Local runs green; CI job green in PR
  - Risks: Low; staging-only; no secrets
  - Security notes: No PII or secrets; uses public staging URL
  - Env changes: Introduces optional `PLAYWRIGHT_BASE_URL` in CI
- [ ] Ensure required checks pass: typecheck, lint, unit/integration tests, e2e smoke, build

12. Review → Merge

- [ ] Keep branch fresh with rebase:
  ```bash
  git fetch origin
  git rebase origin/main
  # resolve, re-run tests
  git push --force-with-lease
  ```
- [ ] After approval and green checks, merge per policy (squash or rebase).

13. Post-merge verification

- [ ] Verify next staging deployment triggers `smoke-tests`
- [ ] Confirm failure blocks promotion to production
- [ ] Confirm artifacts available for debugging when failures occur
- [ ] Update `docs/logs/phase-0-log.md` if tracking Phase 0 milestones

---

## Success Criteria (PRP-aligned)

- [ ] Playwright installed and configured at repository root
- [ ] Smoke spec created for health and homepage
- [ ] Tests pass against `staging.mikeiu.com`
- [ ] Health test validates 200 status and expected JSON body
- [ ] Homepage test validates basic rendering and structure
- [ ] CI runs smoke tests after staging deploy
- [ ] Failures block production promotion
- [ ] Artifacts captured for failures (HTML report, screenshots, traces/video)
- [ ] Scripts available for local and CI execution

---

## Risks & Mitigations

- Flaky network against live staging
  - Retries on CI; limited workers; conservative timeouts
- Title/content drift on homepage
  - Use regex-based title assertion; keep assertions minimal and resilient
- Browser dependencies in CI
  - Always install with `--with-deps` on Linux
- Secrets/ENV handling
  - No secrets introduced; optional `PLAYWRIGHT_BASE_URL` only; do not overwrite `.env.local`

---

## Rollback

- Revert CI job section (`smoke-tests` and promotion gating)
- Remove Playwright-specific scripts and dependencies
- Remove `playwright.config.ts` and `tests/smoke/*`

---

## Time/Effort Estimate

- Setup and tests: 1–2 hours
- CI wiring and validation: 1 hour
- PR review and polish: 0.5–1 hour

---

## Reference Links

- Playwright Docs: https://playwright.dev/docs/intro
- Playwright CI: https://playwright.dev/docs/ci-intro
- Health API: `apps/web/src/app/api/health/route.ts`
- Homepage: `apps/web/src/app/page.tsx`
- Main workflow: `.github/workflows/main.yml`
- Phase 0 log: `docs/logs/phase-0-log.md`
- PRD (E2E strategy): `docs/product_requirements_document.md`
