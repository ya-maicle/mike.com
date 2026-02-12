# AGENTS.md — Project Memory

> This file is maintained by AI agents and human developers. It captures
> patterns, conventions, and gotchas discovered during development.
> Keep it under ~60 lines to avoid polluting agent context windows.

## Project Overview

- **Monorepo**: pnpm workspaces — `apps/web`, `packages/ui`, `packages/config`
- **Web app**: Next.js App Router (RSC-first, minimal `"use client"`)
- **CMS**: Sanity (GROQ queries, server-only token, `next-sanity`)
- **Database**: Supabase (Postgres, RLS deny-by-default)
- **Styling**: Tailwind CSS with tokens from `packages/ui`
- **Design system**: `@maicle/ui` — Primitives → Patterns → Layouts

## Key Directories

| Path                   | Purpose                           |
| ---------------------- | --------------------------------- |
| `apps/web/src/app/`    | Routes (App Router)               |
| `apps/web/src/sanity/` | Sanity clients + GROQ queries     |
| `packages/ui/src/`     | Design system components          |
| `packages/ui/styles/`  | CSS tokens (primitives, semantic) |
| `packages/config/`     | Shared ESLint / TS config         |
| `scripts/ralph/`       | Ralph loop scripts + PRD          |

## Conventions

- Imports: `@/*` alias in the web app (tsconfig-based)
- Files ≤ 200–300 LOC; refactor once exceeding
- Conventional Commits: `feat()`, `fix()`, `chore()`
- No secrets in repo; use Vercel env vars
- Client-exposed env vars must be prefixed `NEXT_PUBLIC_`

## Quality Gates

```bash
pnpm typecheck          # tsc --noEmit
pnpm lint               # ESLint 9
pnpm build              # Next.js production build
pnpm test               # Vitest + React Testing Library
pnpm --filter @maicle/ui storybook  # Visual checks
```

## Discovered Patterns

<!-- AI agents: Add patterns here as you discover them -->
<!-- Format: "- [area]: [pattern description]" -->
<!-- Only add genuinely reusable knowledge, not story-specific details -->
