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

## Next Steps Summary:

1.  **Initial Git Commit:** Commit all the newly created and modified files to the `feat/phase-0-setup` branch.
2.  **Configure Shared ESLint and TypeScript:** Set up shared ESLint and TypeScript configurations in `packages/config`.
3.  **Integrate Shared Configs:** Update `apps/web` to utilize these new shared configurations.
4.  **Configure Tailwind CSS:** Adjust Tailwind CSS in `apps/web` for design tokens using CSS variables.
5.  **Scaffold `packages/ui`:** Create the basic structure for the `packages/ui` design system, including `package.json`, `tsconfig.json`, and Storybook setup.
6.  **Update Build Log (again):** Document these configuration steps in `docs/logs/phase-0-log.md`.
7.  **Commit Configuration Changes:** Commit these configuration changes to the `feat/phase-0-setup` branch.
