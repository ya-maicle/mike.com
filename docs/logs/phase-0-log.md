# Phase 0 — Project Setup & Infrastructure: Build Log

Owner: maicle.co.uk  
Start date: 2025-08-12

This document records every completed step in Phase 0 with outcomes and the next planned action, ensuring full traceability.

---

## 0.0 Environment verification (completed)

- Checked installed versions:
  - Node: v23.2.0
  - pnpm: 10.6.5
  - Git: 2.39.5 (Apple Git-154)
- Outcome: Satisfies prerequisites (Node ≥ 18, pnpm installed, Git available).

Next planned step: Initialize Git repository structure and commit baseline configuration.

---

## 0.1 Create Phase 0 build log (this document) (completed)

- Created `docs/logs/phase-0-log.md` to track steps, decisions, and next actions for Phase 0.
- Outcome: Logging framework in place.

Next planned step: Initialize Git repository (`git init -b main`) and commit the logging document as the first commit.

---

## 0.2 Git repository initialization (completed)

- Initialized an empty Git repository in the current working directory.
- Created a new `main` branch.
- Outcome: Git repository is ready for version control.

Next planned step: Scaffold the monorepo baseline structure and configuration files.

---

## 0.3 Monorepo baseline scaffolding (completed)

- Created core directories: `.vscode`, `docs/logs`, `apps`, `packages/ui`, `packages/config`.
- Created root configuration files:
  - `.gitignore`: Standard ignores for Node/Next.js, pnpm, env files, OS, and Storybook.
  - `README.md`: Project overview, structure, local development instructions, and Git/CI notes.
  - `pnpm-workspace.yaml`: Defined `apps/*` and `packages/*` as workspace directories.
  - `package.json`: Root package with monorepo scripts (`dev`, `build`, `lint`, `typecheck`, `test`), `pnpm` as package manager, `husky` prepare script, `lint-staged` config, and core dev dependencies (ESLint, Prettier, TypeScript).
  - `.prettierrc.json`: Prettier configuration for consistent code formatting (no semicolons, single quotes, 100 char print width, trailing commas).
  - `.editorconfig`: Editor configuration for consistent indentation (2 spaces), line endings, and final newlines.
  - `.vscode/extensions.json`: Recommended VSCode extensions for the project (Prettier, ESLint, Tailwind CSS, Spell Checker).
- Outcome: Basic monorepo structure and development conventions are established.

Next planned step: Initialize Husky, scaffold the Next.js app, and install workspace dependencies.

---

## 0.4 Husky, Next.js app scaffolding, and dependency installation (completed)

- Created a new Git branch `feat/phase-0-setup` for Phase 0 work.
- Initialized Husky in `.husky` directory and configured a `pre-commit` hook to run `pnpm exec lint-staged`.
- Scaffolded the Next.js application in `apps/web` using `create-next-app`:
  - Used TypeScript (`--ts`).
  - Configured ESLint (`--eslint`).
  - Integrated Tailwind CSS (`--tailwind`).
  - Used the App Router (`--app`).
  - Set up import alias to `@/*` (`--import-alias "@/*"`).
  - Specified `pnpm` as the package manager (`--use-pnpm`).
  - Selected `src/` directory for code and disabled Turbopack during interactive prompts.
- Installed all workspace dependencies at the monorepo root using `pnpm install`.
- Outcome: Next.js app is scaffolded, pre-commit hooks are active, and all initial dependencies are installed.

Next planned step: Commit the current state of the repository to the `feat/phase-0-setup` branch.

---

## 0.5 Shared ESLint, TypeScript, Tailwind, and UI Package Scaffolding (completed)

- **Initial Git Commit:** Committed all baseline files to `feat/phase-0-setup` branch.
- **Configured Shared ESLint and TypeScript (`packages/config`):**
  - Created `packages/config/package.json` for the `@maicle/config` workspace package.
  - Created `packages/config/eslint/index.mjs` with a base ESLint configuration extending `next/core-web-vitals` and `next/typescript`.
  - Created `packages/config/tsconfig/base.json` with a strict base TypeScript configuration.
- **Integrated Shared Configs (`apps/web`):**
  - Updated `apps/web/eslint.config.mjs` to extend `@maicle/config/eslint`.
  - Updated `apps/web/tsconfig.json` to extend `@maicle/config/tsconfig/base`.
  - Added `@maicle/config` and `@maicle/ui` as workspace dependencies in `apps/web/package.json`.
- **Configured Tailwind CSS for Design Tokens:**
  - Created `packages/ui/styles/tokens.css` with core CSS variables for colors, radii, and spacing.
  - Updated `apps/web/src/app/globals.css` to import `@maicle/ui/styles/tokens.css` and map the CSS variables to Tailwind's `@theme inline` directive.
- **Scaffolded `packages/ui`:**
  - Created `packages/ui/package.json` for the `@maicle/ui` workspace package.
  - Created `packages/ui/tsconfig.json` extending `@maicle/config/tsconfig/base`.
  - Created `packages/ui/.storybook/main.ts` for Storybook setup.

Next planned step: Install Storybook dependencies, create UI source directory, run root `pnpm install`, update build log, and commit changes.

---

## 0.6 UI Storybook dependencies and src scaffolding (completed)

- Installed Storybook devDependencies in `packages/ui`:
  - `storybook`, `@storybook/react-vite`, `@storybook/addon-essentials`, `@storybook/addon-interactions`, `@storybook/addon-a11y`, `@storybook/test`, plus `vite` and type packages.
- Created `packages/ui/src` with an `index.ts` entrypoint (skeleton export) to enable TS builds.
- Ran `pnpm install` at repo root to link and install workspace dependencies.
  - Notes: peer dependency warnings observed (eslint 9 vs. some plugins expecting 8; tailwindcss peer warning from eslint-plugin-tailwindcss). Will address during linting config consolidation in a later step.
- Outcome: `@maicle/ui` Storybook baseline is in place with required dev dependencies; the UI package has a proper `src` entry and can be built.

Next planned step: Verify Storybook runs locally and add a placeholder story to validate Docs and a11y addons.

---

## 0.7 Storybook Verification and Placeholder Component (completed)

- **Added Placeholder Button Component:** Created a basic, unstyled `Button` component in `packages/ui/src/components/Button.tsx` to serve as a test case for Storybook.
- **Added Button Story:** Created `packages/ui/src/components/Button.stories.tsx` with primary and secondary variants to test Storybook's autodocs and a11y addons.
- **Configured Storybook:**
  - Created `packages/ui/.storybook/preview.ts` to import global token styles and configure addon parameters.
  - Updated `packages/ui/tsconfig.json` to include `react-jsx` and `node` types, resolving build errors.
  - Added `@storybook/react` and `@types/node` as dev dependencies to `packages/ui`.
- **Verified Build:** Ran `pnpm --filter @maicle/ui build-storybook` and confirmed that the Storybook static build completes successfully.
- **Outcome:** Storybook is correctly configured for the `@maicle/ui` package, and the build process is verified.

## 0.8 CI Workflow Scaffolding (completed)

- **Created PR Workflow:** Added a new GitHub Actions workflow at `.github/workflows/pr.yml`.
- **Workflow Steps:** The workflow triggers on pull requests to `main` and includes jobs for:
  - Checking out the repository.
  - Setting up Node.js and pnpm.
  - Installing dependencies.
  - Running `typecheck`, `lint`, and `build` scripts across the monorepo.
  - Building the Storybook for the `@maicle/ui` package.
- **Outcome:** A baseline CI process is in place to validate code quality and build integrity for all future pull requests.

## 0.9 Environment Documentation (completed)

- **Created `ENVIRONMENT.md`:** Added a new file to document all required environment variables across different environments (Local, Preview, Staging, Production).
- **Created `.env.example`:** Added a new file at the root to provide a template for local development, listing all required variables.
- **Verified `.gitignore`:** Confirmed that `.env.*.local` is present in the root `.gitignore` file to prevent accidental commits of local secrets.
- **Outcome:** The project now has clear documentation for environment variable management, fulfilling a key deliverable of Phase 0.

## 0.10 Git Remote Push & PR Readiness (completed)

- **Committed All Changes:** All work from steps 0.5 to 0.9 was committed into logical, conventional commits on the `feat/phase-0-setup` branch.
- **Pushed to Remote:** Added the GitHub remote `origin` (`https://github.com/ya-maicle/mike.com.git`) and pushed the `feat/phase-0-setup` branch successfully.
- **Outcome:** The local repository is now synced with the remote, and the project is ready for its first pull request to verify the CI pipeline.

## Next Steps Summary:

1.  **Open a draft Pull Request** from `feat/phase-0-setup` to `main` on GitHub to verify the CI workflow runs as expected.
2.  **Set up Vercel Project:** Create a new project on Vercel, connect it to the GitHub repository, and configure the domains (`maicle.co.uk` and `staging.maicle.co.uk`).
3.  **Set up Supabase Projects:** Create two projects on Supabase (`maicle-staging` and `maicle-prod`) and retrieve the API URL and anon keys.
4.  **Configure Local Supabase CLI:** Use the project credentials to link the local environment to the remote Supabase projects and prepare for database migrations.
