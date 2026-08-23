# AGENTS.md — Project Memory

> This file is maintained by AI agents and human developers. It captures
> patterns, conventions, and gotchas discovered during development.
> Keep it under ~60 lines to avoid polluting agent context windows.

## Project Overview

- **Monorepo**: pnpm workspaces — `apps/web`, `packages/ui`, `packages/config`
- **Web app**: Next.js App Router (RSC-first, minimal `"use client"`)
- **CMS**: Sanity (GROQ queries, server-only token, `next-sanity`)
- **Database**: Supabase (Postgres, RLS deny-by-default; auth uses PKCE flow)
- **Styling**: Tailwind CSS v4 with tokens from `packages/ui/styles`
- **Design system**: `apps/web/src/components/ui` (shadcn-style) — `packages/ui` holds CSS tokens ONLY

## Key Directories

| Path                          | Purpose                                       |
| ----------------------------- | --------------------------------------------- |
| `apps/web/src/app/`           | Routes (App Router)                           |
| `apps/web/src/components/ui/` | Design system components (each needs a story) |
| `apps/web/src/sanity/`        | Sanity clients + GROQ queries + schemas       |
| `apps/web/src/lib/`           | Pure logic + server utilities (unit-tested)   |
| `packages/ui/styles/`         | CSS tokens (primitives, semantic)             |
| `packages/config/`            | Shared ESLint / TS config                     |
| `scripts/ralph/`              | Ralph loop scripts + PRD                      |

## Conventions

- Imports: `@/*` alias in the web app (tsconfig-based)
- Always import design-system components from `@/components/ui/*` — NEVER create lookalikes;
  the web Storybook is the owner's verification catalog, every `components/ui` file has a story
- Files ≤ 200–300 LOC; refactor once exceeding
- Conventional Commits: `feat()`, `fix()`, `chore()`
- No secrets in repo; use Vercel env vars (`NEXT_PUBLIC_` prefix = client-exposed)
- API route inputs are validated with Zod; access logic fails closed

## Quality Gates

```bash
pnpm typecheck          # tsc --noEmit
pnpm lint               # ESLint 9 (eslint ., flat config)
pnpm test               # Vitest unit tests (also runs in CI)
pnpm build              # Next.js production build
pnpm storybook:web      # Visual checks (the only Storybook)
```

## Discovered Patterns

<!-- AI agents: Add patterns here as you discover them -->
<!-- Format: "- [area]: [pattern description]" -->

- [CI/CD]: Use `gh pr checks <PR_NUMBER>` to monitor the status of checks for a pull request.
- [Sanity]: root `sanity.config.ts` is a re-export of `apps/web/src/app/studio/sanity.config.ts` — edit the embedded one.
- [Access]: recruiter gating = HMAC cookies + `?k=` link tokens + signed Mux playback; teasers/covers stay public by design.
- [Testing]: keep crypto/logic in pure modules (no `server-only`/`next/headers`) so Vitest can import them.
- [Dev]: Dropbox can corrupt `.next` via conflicted copies; set `NEXT_DIST_DIR` to a relative path outside the sync root.
- [SEO]: `src/lib/constants.ts` is the canonical public-identity source; `src/lib/seo.ts` builds canonical/search/social metadata for every indexable page.
<!-- Only add genuinely reusable knowledge, not story-specific details -->
