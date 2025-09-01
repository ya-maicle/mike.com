# maicle.co.uk — Monorepo

Personal website and application for maicle.co.uk following the PRD stack: Next.js (App Router), Tailwind with design tokens, Supabase, Sanity, Stripe, Mux, Resend, MailerLite, PostHog, Vercel hosting.

## Structure

- apps/
  - web: Next.js app (to be scaffolded in Phase 0)
- packages/
  - ui: Design system package (scaffolded in Phase 0 with Storybook baseline)
  - config: Shared configs (eslint, tsconfig) [planned]
- docs/
  - logs/: Phase 0 build log and future logs

## Development (local)

Prereqs: Node LTS (≥18), pnpm, Git. Optional CLIs for later phases: Vercel, Supabase, Sanity, Stripe.

Bootstrap:

- `pnpm i`
- `pnpm db:start` (runs local Supabase in Docker)
- `pnpm dev`

See `supabase/README.md` for detailed instructions on setting up the Supabase CLI, linking to remote projects, and managing database migrations.

## Git & Branching Strategy

### **Two-Environment Branching Model**

```
Feature Branches → Preview Branch → Main Branch
     ↓                   ↓              ↓
Feature Previews → Staging Deploy → Production Deploy
```

- **Default Branch**: `preview` (feature branches target this)
- **Production Branch**: `main` (requires manual promotion from preview)
- **Feature Branches**: `feat/*`, `fix/*`, `chore/*` (merge to preview)

### **Quality Gates**

- **Feature PRs**: TypeScript, ESLint, build, Storybook + PR review
- **Preview Branch**: Auto-deploy to staging after merge
- **Main Branch**: Manual approval required for production

## 🚀 Deployment & Operations

### **Environment Mapping**

| Environment    | Git Branch | Domain               | Purpose            | Deployment |
| -------------- | ---------- | -------------------- | ------------------ | ---------- |
| **Local**      | any        | `localhost:3000`     | Development        | Manual     |
| **Preview**    | `preview`  | `staging.mikeiu.com` | Staging validation | Auto       |
| **Production** | `main`     | `mikeiu.com`         | Live application   | Manual     |

### **Developer Workflow**

1. **Create Feature Branch**: `git checkout -b feat/my-feature`
2. **Target Preview**: Feature branches automatically target `preview` branch
3. **Feature Preview**: Get dynamic preview URLs for testing changes
4. **Merge to Preview**: PR review required, triggers staging deployment
5. **Promote to Production**: Create PR from `preview` to `main`, requires approval

### **Pipeline Status**: ✅ **READY**

- ✅ GitHub environments configured (Preview, Production)
- ✅ Vercel projects mapped (stagining → staging, mike-com-web → production)
- ✅ Quality checks enforced at all levels
- ✅ Manual approval gates for production
- ✅ Database migration workflows operational

### Quick Commands

```bash
# Local development
pnpm dev                    # Start development server
pnpm build                  # Build all packages
pnpm typecheck              # Run TypeScript checks
pnpm lint                   # Run ESLint

# Database operations
pnpm db:start              # Start local Supabase
pnpm db:stop               # Stop local Supabase
pnpm db:reset              # Reset local database

# Testing (placeholders)
pnpm e2e:smoke             # Run smoke tests locally
pnpm e2e:smoke:ci          # Run smoke tests in CI
```

### Manual Operations

- **Trigger deployment**: Push to `main` or use GitHub Actions UI
- **Approve production**: Review and approve in GitHub Actions workflow
- **Emergency rollback**: See [docs/operations/deployment-rollback.md](docs/operations/deployment-rollback.md)

### Documentation

- [Deployment Pipeline](docs/operations/deployment-pipeline.md) - Complete pipeline documentation
- [Phase 0 Log](docs/logs/phase-0-log.md) - Infrastructure setup history
- [PRD](docs/product_requirements_document.md) - Complete product requirements
- [Development Stability Plan](docs/development/dev-stabilization.md) - Steps to stabilize local/UI dev

### Protecting routes and sections (auth)

The web app uses Supabase Auth. To gate content for signed-in users, use the `Protected` wrapper.

Basic usage (page-level):

```tsx
// apps/web/src/app/some-protected/page.tsx
'use client'
import { Protected } from '@/components/protected'

export default function SomeProtectedPage() {
  return (
    <Protected
      onUnauthed="modal"
      fallback={<div className="p-6">Sign in to access this page.</div>}
    >
      <div>Your protected content here…</div>
    </Protected>
  )
}
```

- `onUnauthed="modal"` opens the login modal automatically when unauthenticated.
- `fallback` renders while unauthenticated (until the user signs in).

Section-level gating:

```tsx
'use client'
import { Protected } from '@/components/protected'

function Card() {
  return (
    <div>
      <h2>Public area</h2>
      <Protected fallback={null}>
        <button className="rounded-md border px-3 py-1">Members Action</button>
      </Protected>
    </div>
  )
}
```

Providers (already set in `apps/web/src/app/layout.tsx`):

```tsx
<AuthProvider>
  <LoginModalProvider>
    <ThemeProvider ...>
      <HeaderWithNavLayout>{children}</HeaderWithNavLayout>
    </ThemeProvider>
  </LoginModalProvider>
</AuthProvider>
```

Example in this repo:

- `apps/web/src/app/stories/page.tsx` uses `Protected` to require sign-in.

## Authentication: Login & Logout (Supabase)

This app uses a single Supabase browser client configured for the implicit flow. It supports both Google OAuth and passwordless Magic Link and keeps sessions in sync across tabs.

Key points

- Client: one implicit-flow client with `autoRefreshToken`, `persistSession`, `detectSessionInUrl`, and `multiTab` enabled (see `apps/web/src/lib/supabase.ts`).
- Returns: the `AuthProvider` handles all return shapes and cleans the URL afterwards (see `apps/web/src/components/providers/auth-provider.tsx`).
  - `#access_token=…` (common for magic links) → session is set via `detectSessionInUrl`.
  - `?token_hash=…&type=…` (magic link variant) → verified with `verifyOtp`.
  - `?code=…` (some providers) → falls back to `exchangeCodeForSession`.
- Google button and Magic Link send live in `apps/web/src/components/login-form.tsx`.
- Logout is instant (clears local session immediately) and revokes globally in the background; other tabs are notified via storage events.

Environment

- `NEXT_PUBLIC_SUPABASE_URL`: your project URL (e.g. `https://<ref>.supabase.co`).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon key for the same project.
- `NEXT_PUBLIC_SITE_URL`: the site origin used for redirects (must match the domain you’re on). Avoid trailing spaces/newlines.

Supabase settings (per environment)

- Auth → URL Configuration
  - Site URL: your canonical domain for that env (`http://localhost:3000`, `https://preview.mikeiu.com`, `https://maicle.co.uk`).
  - Redirect URLs: add every domain you will redirect back to (localhost, preview, prod, www variants).
- Auth → Providers → Google
  - Enable and set Client ID/Secret.
  - Google “Authorized redirect URI”: `https://<ref>.supabase.co/auth/v1/callback`.
- Auth → Email
  - Enable Magic Link. Increase expiration time if prefetchers cause `otp_expired`.

Known gotchas

- Email link prefetch: Some email clients/security scanners “open” links which can consume one-time tokens (`otp_expired`). Resend the link and open directly in the browser. We can add a “Resend link” banner if desired.
- Domain mismatch: Always open the site with the same host configured in Supabase. `127.0.0.1` vs `localhost` will fail allowlists.
- Trailing newline: Ensure `NEXT_PUBLIC_SITE_URL` has no trailing whitespace (causes redirect_to mismatches).

Debug logging

- Enable in browser (no redeploy):
  - `localStorage.setItem('auth-debug', '1')` then hard refresh.
- Or set `NEXT_PUBLIC_AUTH_DEBUG=1` (and redeploy).
- Logs are prefixed with `[AUTH]` (e.g., “Exchanging code…”, “Verifying magic link…”, “SIGNED_IN”).

Logout behavior

- Immediate local sign-out to avoid UI hangs.
- Background global revoke (non-blocking).
- Broadcast to other tabs via `localStorage` to keep headers in sync.

Default profile data

- On first sign-in, we upsert a `profiles` row with a default avatar and name if missing; we also attempt to mirror the name to `user.user_metadata` for UI consistency (see `apps/web/src/lib/profile.ts`).
- Ensure RLS for `public.profiles` allows users to select/insert/update their own row.

Troubleshooting checklist

- Google fails with 400 on return: verify `NEXT_PUBLIC_SITE_URL` and redirect allowlists; confirm the authorized redirect URI in Google Cloud is `https://<ref>.supabase.co/auth/v1/callback`.
- Magic link opens in new tab but doesn’t sign in: check for `[AUTH]` lines mentioning hash tokens; if the email client consumed the link, click “Resend magic link”.
