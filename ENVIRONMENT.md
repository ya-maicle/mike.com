# Environment Variables

Contract for every env var the app reads. Local values live in `apps/web/.env.local`
(pull with `vercel env pull`); deployed values live in Vercel (Development / Preview /
Production). Never commit secrets. Only `NEXT_PUBLIC_*` vars are exposed to the browser.

## Web app (apps/web)

| Variable                        | Exposure               | Used by                              | Purpose                                                                         |
| ------------------------------- | ---------------------- | ------------------------------------ | ------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | client                 | `src/lib/supabase.ts`, API routes    | Supabase project URL                                                            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client                 | same                                 | Supabase anon key (RLS enforced)                                                |
| `NEXT_PUBLIC_SITE_URL`          | client                 | auth redirects                       | Canonical site origin; no trailing whitespace                                   |
| `GOOGLE_SITE_VERIFICATION`      | server                 | root metadata                        | Optional Google Search Console HTML-tag verification token                      |
| `YANDEX_SITE_VERIFICATION`      | server                 | root metadata                        | Optional Yandex Webmaster HTML-tag verification token                           |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | client                 | `src/sanity/client.ts`               | Sanity project id                                                               |
| `NEXT_PUBLIC_SANITY_DATASET`    | client                 | same                                 | Sanity dataset name                                                             |
| `NEXT_PUBLIC_AUTH_DEBUG`        | client                 | `auth-provider.tsx`                  | Set `1` to enable `[AUTH]` console logging                                      |
| `NEXT_PUBLIC_POSTHOG_KEY`       | client                 | `src/lib/analytics/client.ts`        | PostHog EU project token; client-safe, not a personal API key                   |
| `NEXT_PUBLIC_POSTHOG_HOST`      | client                 | deployment contract                  | Must be `https://eu.i.posthog.com` for the V1 EU ingestion boundary             |
| `NEXT_PUBLIC_POSTHOG_ENABLED`   | client                 | `src/lib/analytics/client.ts`        | Set `true` only on nominated Preview and Production deployments                 |
| `NEXT_PUBLIC_POSTHOG_ENV`       | client                 | `src/lib/analytics/client.ts`        | Event dimension: `preview` or `production`                                      |
| `SANITY_API_READ_TOKEN`         | server                 | `src/sanity/client.ts`, CI build     | Read token; required everywhere once the dataset is private                     |
| `SUPABASE_SERVICE_ROLE_KEY`     | server                 | `src/lib/portfolio-access-events.ts` | Service role for access-event logging; never expose                             |
| `PORTFOLIO_ACCESS_SECRET`       | server                 | `src/lib/portfolio-access.ts`        | HMAC secret for access cookies. Missing secret fails closed (all access denied) |
| `MUX_SIGNING_KEY_ID`            | server                 | `src/lib/mux-signing.ts`             | Mux signing-key id for signed playback of gated videos                          |
| `MUX_SIGNING_PRIVATE_KEY`       | server                 | same                                 | Mux signing private key (base64 or raw PEM). Unset = public-playback fallback   |
| `VERCEL_ENV`                    | server (set by Vercel) | `/debug/profile` gate                | Debug routes 404 when `production`                                              |

PostHog is loaded dynamically only after valid analytics consent. Local development is
disabled by default. A missing token or disabled flag is a silent no-op. V1 always sends to
the EU ingestion host, disables autocapture/session replay/flags, and honours Do Not Track.

## Studio / CLI / scripts (repo root)

| Variable                                                        | Used by                                           | Purpose                                                               |
| --------------------------------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------- |
| `SANITY_STUDIO_PROJECT_ID` / `SANITY_STUDIO_DATASET`            | `sanity.config.ts`                                | Studio CLI overrides (fall back to `NEXT_PUBLIC_SANITY_*`)            |
| `SANITY_STUDIO_MUX_TOKEN_ID` / `SANITY_STUDIO_MUX_TOKEN_SECRET` | sanity-plugin-mux-input, `scripts/mux-*.ts`       | Mux API credentials for uploads and admin scripts                     |
| `SANITY_API_WRITE_TOKEN`                                        | `scripts/mux-rotate-gated-to-signed.ts --execute` | Patches `mux.videoAsset` docs after playback-id rotation              |
| `SUPABASE_STAGING_PROJECT_REF` / `SUPABASE_PROD_PROJECT_REF`    | `db:link:*` scripts                               | Supabase project refs for linking                                     |
| `MUX_TOKEN_ID` / `MUX_TOKEN_SECRET`                             | `scripts/mux-*.ts`                                | Mux API credentials (scripts fall back to the `SANITY_STUDIO_*` pair) |

## CI (GitHub Actions secrets)

| Secret                            | Used by     | Purpose                                     |
| --------------------------------- | ----------- | ------------------------------------------- |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | smoke tests | Bypass Vercel deployment protection         |
| `SANITY_API_READ_TOKEN`           | build step  | Required once the Sanity dataset is private |

## Runbook: enabling signed Mux playback for gated case studies

The code path ships dormant — without signing keys, playback stays public. To activate:

1. Create a signing key in the Mux dashboard (Settings → Signing Keys).
2. Add `MUX_SIGNING_KEY_ID` and `MUX_SIGNING_PRIVATE_KEY` to Vercel (all environments)
   and to `apps/web/.env.local`. Redeploy.
3. Verify a gated case-study video still plays (it now sends tokens, assets still public).
4. Dry-run the rotation: `pnpm dlx dotenv-cli -e apps/web/.env.local -- pnpm tsx scripts/mux-rotate-gated-to-signed.ts`
5. Apply with `--execute` (needs `SANITY_API_WRITE_TOKEN`). This creates signed playback
   IDs, **deletes the public ones** (revoking any scraped URLs), and patches the Sanity
   asset docs. Gated videos break if step 2 was skipped.
6. Optional hardening: make the Sanity dataset private (`sanity dataset visibility set <dataset> private`)
   after confirming `SANITY_API_READ_TOKEN` is set in Vercel and GitHub Actions.
