# Development Stability Plan (UI‑first)

This plan stabilizes local development by removing Dropbox interference, fixing the UI linked‑package dev gap, and hardening defaults and workflows.

## Goals
- Reduce dev server crashes/hangs and slow restarts.
- Make UI component development smooth with live reload.
- Keep production builds reliable and consistent.

## Prerequisites
- Node LTS (recommended: 20.17.0).
- pnpm installed.
- Docker only if using local Supabase.

---

## 1) Move the Repo Out of Dropbox (Do First)
- Why: Cloud sync interferes with file watchers (Next/Turbopack/SWC), causing frequent crashes/hangs.
- Action:
  - `mkdir -p ~/dev && mv ~/Library/CloudStorage/Dropbox/maicle.co.uk ~/dev/maicle.co.uk`
  - Reopen the project from `~/dev/maicle.co.uk`
- If you must stay in Dropbox, add `.dropboxignore` with:
  - `node_modules`, `.pnpm-store`, `.next`, `.turbo`, `dist`, `storybook-static`, `coverage`, `playwright-report/`, `test-results/`, `blob-report/`, `.vercel`, `supabase/.temp`

- [ ] Repo relocated or `.dropboxignore` in place

---

## 2) Pin the Runtime
- Add `.nvmrc` with `v20.17.0` and run `nvm use`.
- Optionally add `.tool-versions` for asdf (`nodejs 20.17.0`) and align CI.

- [ ] `.nvmrc` added and used locally
- [ ] CI/build agents aligned to Node 20.17.0

---

## 3) Default to Stable Dev (SWC)
- Make SWC the default for local dev; keep Turbopack as optional if desired.
- Root `package.json`:
  - Change `"dev"` to run `pnpm --filter apps/web dev:swc`.

- [ ] Root dev script points to SWC
- [ ] Turbopack kept as opt‑in (`pnpm dev:web`)

---

## 4) Fix UI Linked‑Package Dev Gap (Use Source in Dev)
- Goal: Use `packages/ui/src` in development so live reload works without rebuilding `dist`.
- `packages/ui/package.json` exports (concept):
  - Use source for development and types; keep `dist` as default for prod.
  - Example:
    - `"exports": { ".": { "types": "./src/index.ts", "development": "./src/index.ts", "default": "./dist/index.js" } }`
- `apps/web/next.config.ts` already has `transpilePackages: ['@maicle/ui']` (keep it).

- [ ] UI exports use source in dev
- [ ] apps/web transpiles `@maicle/ui`

---

## 5) Keep `dist` for Production
- Ensure UI builds for prod and publishing:
  - `packages/ui/package.json`:
    - `"build": "tsc -p tsconfig.json"`
    - `"prepublishOnly": "pnpm run build"` (optional if you ever publish)
- CI should run `pnpm -r build` so `dist` exists.

- [ ] UI `build` compiles `dist`
- [ ] CI builds UI before web

---

## 6) Optional: Dist‑Watch Alternative
- If you prefer to keep dist‑based imports during dev:
  - Add `"build:watch": "tsc -p tsconfig.json --watch --preserveWatchOutput"` in `packages/ui`.
  - Run in a split terminal while developing web.

- [ ] `build:watch` exists (only if sticking with dist)

---

## 7) Optional: Combined Dev Orchestrator
- Add `concurrently` at the root to run UI watch + web dev together (only for dist‑watch approach).
  - `"dev:ui+web": "concurrently -n ui,web -c green,cyan \"pnpm --filter @maicle/ui build:watch\" \"pnpm --filter apps/web dev:swc\""`

- [ ] Combined dev script added (if using dist‑watch)

---

## 8) Quick Recovery Scripts
- Root scripts:
  - `"clean": "rm -rf apps/web/.next packages/ui/dist"`
  - `"kill:3000": "pnpm dlx kill-port 3000"`
- Recovery sequence:
  - `pnpm kill:3000 && pnpm clean && pnpm --filter @maicle/ui build && pnpm dev:swc`

- [ ] Clean and kill‑port scripts added

---

## 9) Secrets Hygiene
- Remove tracked secrets and rotate:
  - `git rm --cached .env.local` then commit.
  - Rotate Supabase service_role, OAuth secrets, etc.
  - Continue using `vercel env pull .env.local` locally.
- `.gitignore` already ignores `.env*.local`.

- [ ] `.env.local` untracked
- [ ] Keys rotated in their providers
- [ ] Vercel envs set per env; local pulled

---

## 10) Optional: Pin Key Dependencies
- Reduce surprise upgrades:
  - Pin exact versions for `next`, `react`, `react-dom`, `tailwindcss`, `@tailwindcss/postcss`.
  - Keep them stable until you intentionally upgrade.

- [ ] Framework/library versions pinned

---

## 11) Update Documentation (Onboarding + Workflow)
- README changes:
  - Node setup: `nvm use`.
  - Dev start: `pnpm dev` (SWC default) or `pnpm dev:ui+web` if using dist‑watch.
  - UI dev flow: change UI source, HMR updates in web.
  - Recovery commands listed above.

- [ ] README updated with stable workflow

---

## Verification Checklist
- [ ] `pnpm dev` starts quickly without hangs.
- [ ] Editing `packages/ui/src` triggers live reload in `apps/web` instantly.
- [ ] Repeated edits no longer crash Next dev server.
- [ ] Production build: `pnpm build` succeeds and `apps/web` runs with `next start`.

