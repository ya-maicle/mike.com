# Environment Variables

This document outlines the environment variables required for the **two-environment model**: Development and Production. For local development, copy `.env.example` to `.env.local` and populate it with values from the Vercel "Development" environment using `vercel env pull`.

## Environment Architecture

| Environment     | Purpose                                       | Components                                                 |
| --------------- | --------------------------------------------- | ---------------------------------------------------------- |
| **Development** | Feature development, testing, content staging | Local (localhost:3000) + Preview (mike-com-web.vercel.app) |
| **Production**  | Live public application                       | Live (mikeiu.com)                                          |

## Environment Configuration Mapping

| Component          | Development                                                              | Production                         | Notes                           |
| ------------------ | ------------------------------------------------------------------------ | ---------------------------------- | ------------------------------- |
| **Domain**         | Local: `localhost:3000`<br>Preview: `mike-com-web.vercel.app`            | `mikeiu.com`                       | Preview auto-deploys from PRs   |
| **Database**       | Local: Docker Supabase<br>Preview: mike-staging (`qijxfigergpnuqbaxtjv`) | mike-prod (`pzgczflyltjyxwqyteuj`) | EU region for both projects     |
| **Sanity Dataset** | `development`                                                            | `production`                       | Free plan limited to 2 datasets |
| **Vendor Keys**    | Test/sandbox keys                                                        | Live production keys               | Stripe, Mux, MailerLite, etc.   |
| **Deployment**     | Auto from PRs (preview)<br>Manual from main (staging validation)         | Manual promotion after approval    | Same build promoted to prod     |

## Common Variables

| Variable Name              | Development (Local)      | Development (Preview)             | Production               | Notes                         |
| -------------------------- | ------------------------ | --------------------------------- | ------------------------ | ----------------------------- |
| `NEXT_PUBLIC_SITE_URL`     | `http://localhost:3000`  | `https://mike-com-web.vercel.app` | `https://mikeiu.com`     | Public URL of the deployment. |
| `NODE_ENV`                 | `development`            | `production`                      | `production`             | Managed by Next.js/Vercel.    |
| `SENTRY_DSN`               | (optional)               | Development DSN                   | Production DSN           | For error tracking.           |
| `NEXT_PUBLIC_POSTHOG_KEY`  | Development Key          | Development Key                   | Production Key           | For analytics (client-safe).  |
| `NEXT_PUBLIC_POSTHOG_HOST` | `https://eu.posthog.com` | `https://eu.posthog.com`          | `https://eu.posthog.com` | PostHog EU residency.         |

## Supabase

### Database Project Mapping

| Environment     | Project Name | Project Reference      | Purpose                                 |
| --------------- | ------------ | ---------------------- | --------------------------------------- |
| **Development** | mike-staging | `qijxfigergpnuqbaxtjv` | Local development + Preview deployments |
| **Production**  | mike-prod    | `pzgczflyltjyxwqyteuj` | Live production application             |

### Vercel Environment Variables

These are stored in Vercel and pulled locally via `vercel env pull`.

| Variable Name                   | Development (Local) | Development (Preview)    | Production            | Notes                                 |
| ------------------------------- | ------------------- | ------------------------ | --------------------- | ------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Local Docker URL    | mike-staging URL         | mike-prod URL         | Public URL for Supabase project.      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Local Docker Key    | mike-staging Anon Key    | mike-prod Anon Key    | Public anonymous key.                 |
| `SUPABASE_SERVICE_ROLE_KEY`     | Local Docker Key    | mike-staging Service Key | mike-prod Service Key | **Server-side only.** Secret key.     |
| `DATABASE_URL`                  | Local Docker URL    | mike-staging DB URL      | mike-prod DB URL      | **Server-side only.** For migrations. |

### Local-Only CLI Variables

These variables are used locally (e.g., in `.env.local` or exported in the shell) to link the Supabase CLI to the correct remote projects. They are **not** stored in Vercel.

| Variable Name                  | Value                  | Notes                                                 |
| ------------------------------ | ---------------------- | ----------------------------------------------------- |
| `SUPABASE_STAGING_PROJECT_REF` | `qijxfigergpnuqbaxtjv` | mike-staging project. Used by `pnpm db:link:staging`. |
| `SUPABASE_PROD_PROJECT_REF`    | `pzgczflyltjyxwqyteuj` | mike-prod project. Used by `pnpm db:link:prod`.       |

## Sanity

### CMS Configuration

| Environment     | Sanity Dataset | Purpose                                     |
| --------------- | -------------- | ------------------------------------------- |
| **Development** | `development`  | Content staging, preview, local development |
| **Production**  | `production`   | Live published content                      |

### Environment Variables

| Variable Name                   | Development (Local) | Development (Preview) | Production   | Notes                                                         |
| ------------------------------- | ------------------- | --------------------- | ------------ | ------------------------------------------------------------- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | `nf3mt1vl`          | `nf3mt1vl`            | `nf3mt1vl`   | Sanity project identifier (same across environments).         |
| `NEXT_PUBLIC_SANITY_DATASET`    | `development`       | `development`         | `production` | Dataset for the environment. Free plan limited to 2 datasets. |
| `SANITY_API_READ_TOKEN`         | Read Token          | Read Token            | Read Token   | **Server-side only.** For fetching content.                   |

## Vendors (Stripe, Mux, Resend, MailerLite, PostHog, Sentry)

These keys should use **test/sandbox** versions for development environments and **live** keys only in production.

| Variable Name                        | Development (Local)      | Development (Preview)    | Production               | Notes                      |
| ------------------------------------ | ------------------------ | ------------------------ | ------------------------ | -------------------------- |
| `STRIPE_SECRET_KEY`                  | Test Key                 | Test Key                 | Live Key                 | **Server-side only.**      |
| `STRIPE_WEBHOOK_SECRET`              | Test Secret              | Test Secret              | Live Secret              | **Server-side only.**      |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Test Key                 | Test Key                 | Live Key                 | Public key for Stripe.js.  |
| `MUX_TOKEN_ID`                       | Test ID                  | Test ID                  | Live ID                  | **Server-side only.**      |
| `MUX_TOKEN_SECRET`                   | Test Secret              | Test Secret              | Live Secret              | **Server-side only.**      |
| `RESEND_API_KEY`                     | Test Key                 | Test Key                 | Live Key                 | **Server-side only.**      |
| `MAILERLITE_API_KEY`                 | Test Key                 | Test Key                 | Live Key                 | **Server-side only.**      |
| `NEXT_PUBLIC_POSTHOG_KEY`            | Development Key          | Development Key          | Production Key           | Client-safe analytics key. |
| `NEXT_PUBLIC_POSTHOG_HOST`           | `https://eu.posthog.com` | `https://eu.posthog.com` | `https://eu.posthog.com` | PostHog EU instance.       |
| `SENTRY_DSN`                         | Development DSN          | Development DSN          | Production DSN           | Error monitoring DSN.      |

## Deployment Workflow

This section documents the development → production promotion flow:

1. **Local Development**: Work on `localhost:3000` with Docker Supabase and development Sanity dataset
2. **Preview Deployment**: PRs automatically deploy to `mike-com-web.vercel.app` using mike-staging database
3. **Main Branch**: Pushes to main trigger staging deployment with smoke tests
4. **Production Promotion**: Manual approval required to promote same build to `mikeiu.com`

### CI/CD Pipeline Requirements

The following GitHub repository secrets are required for the CI/CD pipeline to function:

| Secret Name                    | Purpose                                                        | Used In              |
| ------------------------------ | -------------------------------------------------------------- | -------------------- |
| `VERCEL_TOKEN`                 | Vercel deployment access                                       | Main pipeline        |
| `VERCEL_ORG_ID`                | Vercel organization identifier                                 | Main pipeline        |
| `VERCEL_PROJECT_ID`            | Vercel project identifier (`prj_wN2kD7lvIqP0BjopkvC9yd9Xl17f`) | Main pipeline        |
| `SUPABASE_ACCESS_TOKEN`        | Supabase account access for migrations                         | Main pipeline        |
| `SUPABASE_STAGING_PROJECT_REF` | mike-staging project reference (`qijxfigergpnuqbaxtjv`)        | Staging deployment   |
| `SUPABASE_PROD_PROJECT_REF`    | mike-prod project reference (`pzgczflyltjyxwqyteuj`)           | Production promotion |

**⚠️ CRITICAL**: These secrets are currently **NOT CONFIGURED** and must be added for the CI/CD pipeline to function.
