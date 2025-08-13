# Environment Variables

This document outlines the environment variables required for each environment. For local development, copy `.env.example` to `.env.local` and populate it with values from the Vercel "Development" environment using `vercel env pull`.

## Common Variables

| Variable Name          | Local                    | Preview                  | Staging                        | Production               | Notes                         |
| ---------------------- | ------------------------ | ------------------------ | ------------------------------ | ------------------------ | ----------------------------- |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000`  | Vercel URL               | `https://staging.maicle.co.uk` | `https://maicle.co.uk`   | Public URL of the deployment. |
| `NODE_ENV`             | `development`            | `production`             | `production`                   | `production`             | Managed by Next.js/Vercel.    |
| `SENTRY_DSN`           | (optional)               | Staging DSN              | Staging DSN                    | Production DSN           | For error tracking.           |
| `POSTHOG_KEY`          | Staging Key              | Staging Key              | Staging Key                    | Production Key           | For analytics.                |
| `POSTHOG_HOST`         | `https://eu.posthog.com` | `https://eu.posthog.com` | `https://eu.posthog.com`       | `https://eu.posthog.com` | PostHog EU residency.         |

## Supabase

| Variable Name                   | Local        | Preview        | Staging        | Production        | Notes                                 |
| ------------------------------- | ------------ | -------------- | -------------- | ----------------- | ------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Local URL    | Staging URL    | Staging URL    | Production URL    | Public URL for Supabase project.      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Local Key    | Staging Key    | Staging Key    | Production Key    | Public anonymous key.                 |
| `SUPABASE_SERVICE_ROLE_KEY`     | Local Key    | Staging Key    | Staging Key    | Production Key    | **Server-side only.** Secret key.     |
| `DATABASE_URL`                  | Local DB URL | Staging DB URL | Staging DB URL | Production DB URL | **Server-side only.** For migrations. |

## Sanity

| Variable Name                   | Local         | Preview    | Staging    | Production   | Notes                               |
| ------------------------------- | ------------- | ---------- | ---------- | ------------ | ----------------------------------- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Project ID    | Project ID | Project ID | Project ID   | Sanity project identifier.          |
| `NEXT_PUBLIC_SANITY_DATASET`    | `development` | `staging`  | `staging`  | `production` | Dataset for the environment.        |
| `SANITY_API_READ_TOKEN`         | Read Token    | Read Token | Read Token | Read Token   | **Server-side only.** For fetching. |

## Vendors (Stripe, Mux, Resend, MailerLite)

These keys should use **test/sandbox** versions for all non-production environments.

| Variable Name                        | Local       | Preview     | Staging     | Production  | Notes                     |
| ------------------------------------ | ----------- | ----------- | ----------- | ----------- | ------------------------- |
| `STRIPE_SECRET_KEY`                  | Test Key    | Test Key    | Test Key    | Live Key    | **Server-side only.**     |
| `STRIPE_WEBHOOK_SECRET`              | Test Secret | Test Secret | Test Secret | Live Secret | **Server-side only.**     |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Test Key    | Test Key    | Test Key    | Live Key    | Public key for Stripe.js. |
| `MUX_TOKEN_ID`                       | Test ID     | Test ID     | Test ID     | Live ID     | **Server-side only.**     |
| `MUX_TOKEN_SECRET`                   | Test Secret | Test Secret | Test Secret | Live Secret | **Server-side only.**     |
| `RESEND_API_KEY`                     | Test Key    | Test Key    | Test Key    | Live Key    | **Server-side only.**     |
| `MAILERLITE_API_KEY`                 | Test Key    | Test Key    | Test Key    | Live Key    | **Server-side only.**     |
