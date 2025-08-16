# Environment Variables

This document outlines the environment variables required for each environment. For local development, copy `.env.example` to `.env.local` and populate it with values from the Vercel "Development" environment using `vercel env pull`.

## Common Variables

| Variable Name              | Local                    | Preview                         | Staging                      | Production               | Notes                         |
| -------------------------- | ------------------------ | ------------------------------- | ---------------------------- | ------------------------ | ----------------------------- |
| `NEXT_PUBLIC_SITE_URL`     | `http://localhost:3000`  | https://mike-com-web.vercel.app | `https://staging.mikeiu.com` | `https://mikeiu.com`     | Public URL of the deployment. |
| `NODE_ENV`                 | `development`            | `production`                    | `production`                 | `production`             | Managed by Next.js/Vercel.    |
| `SENTRY_DSN`               | (optional)               | Staging DSN                     | Staging DSN                  | Production DSN           | For error tracking.           |
| `NEXT_PUBLIC_POSTHOG_KEY`  | Staging Key              | Staging Key                     | Staging Key                  | Production Key           | For analytics (client-safe).  |
| `NEXT_PUBLIC_POSTHOG_HOST` | `https://eu.posthog.com` | `https://eu.posthog.com`        | `https://eu.posthog.com`     | `https://eu.posthog.com` | PostHog EU residency.         |

## Supabase

### Vercel Environment Variables

These are stored in Vercel and pulled locally via `vercel env pull`.

| Variable Name                   | Local        | Preview        | Staging        | Production        | Notes                                 |
| ------------------------------- | ------------ | -------------- | -------------- | ----------------- | ------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Local URL    | Staging URL    | Staging URL    | Production URL    | Public URL for Supabase project.      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Local Key    | Staging Key    | Staging Key    | Production Key    | Public anonymous key.                 |
| `SUPABASE_SERVICE_ROLE_KEY`     | Local Key    | Staging Key    | Staging Key    | Production Key    | **Server-side only.** Secret key.     |
| `DATABASE_URL`                  | Local DB URL | Staging DB URL | Staging DB URL | Production DB URL | **Server-side only.** For migrations. |

### Local-Only CLI Variables

These variables are used locally (e.g., in `.env.local` or exported in the shell) to link the Supabase CLI to the correct remote projects. They are **not** stored in Vercel.

| Variable Name                  | Value                  | Notes                                                    |
| ------------------------------ | ---------------------- | -------------------------------------------------------- |
| `SUPABASE_STAGING_PROJECT_REF` | Staging Project Ref    | From Supabase Dashboard. Used by `pnpm db:link:staging`. |
| `SUPABASE_PROD_PROJECT_REF`    | Production Project Ref | From Supabase Dashboard. Used by `pnpm db:link:prod`.    |

## Sanity

| Variable Name                   | Local         | Preview       | Staging       | Production   | Notes                                                                                                                           |
| ------------------------------- | ------------- | ------------- | ------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Project ID    | Project ID    | Project ID    | Project ID   | Sanity project identifier.                                                                                                      |
| `NEXT_PUBLIC_SANITY_DATASET`    | `development` | `development` | `development` | `production` | Dataset for the environment. Note: Sanity free plan limits to 2 datasets, so staging uses development dataset for safe testing. |
| `SANITY_API_READ_TOKEN`         | Read Token    | Read Token    | Read Token    | Read Token   | **Server-side only.** For fetching.                                                                                             |

## Vendors (Stripe, Mux, Resend, MailerLite, PostHog, Sentry)

These keys should use **test/sandbox** versions for all non-production environments.

| Variable Name                        | Local       | Preview     | Staging     | Production  | Notes                      |
| ------------------------------------ | ----------- | ----------- | ----------- | ----------- | -------------------------- |
| `STRIPE_SECRET_KEY`                  | Test Key    | Test Key    | Test Key    | Live Key    | **Server-side only.**      |
| `STRIPE_WEBHOOK_SECRET`              | Test Secret | Test Secret | Test Secret | Live Secret | **Server-side only.**      |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Test Key    | Test Key    | Test Key    | Live Key    | Public key for Stripe.js.  |
| `MUX_TOKEN_ID`                       | Test ID     | Test ID     | Test ID     | Live ID     | **Server-side only.**      |
| `MUX_TOKEN_SECRET`                   | Test Secret | Test Secret | Test Secret | Live Secret | **Server-side only.**      |
| `RESEND_API_KEY`                     | Test Key    | Test Key    | Test Key    | Live Key    | **Server-side only.**      |
| `MAILERLITE_API_KEY`                 | Test Key    | Test Key    | Test Key    | Live Key    | **Server-side only.**      |
| `NEXT_PUBLIC_POSTHOG_KEY`            | Test Key    | Test Key    | Test Key    | Live Key    | Client-safe analytics key. |
| `NEXT_PUBLIC_POSTHOG_HOST`           | EU Host     | EU Host     | EU Host     | EU Host     | PostHog EU instance.       |
| `NEXT_PUBLIC_SITE_URL`               | localhost   | Staging URL | Staging URL | Prod URL    | Site URL for redirects.    |
| `SENTRY_DSN`                         | Test DSN    | Test DSN    | Test DSN    | Prod DSN    | Error monitoring DSN.      |
