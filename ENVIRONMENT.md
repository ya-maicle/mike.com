# Environment Variables

This document outlines the environment variables required for the **two-environment branching model**: Preview and Production. This model uses a `preview` branch as the default target for feature branches, with controlled promotion to `main` branch for production.

## Branching Strategy & Environment Architecture

### **Git Workflow:**

```
Feature Branches → Preview Branch → Main Branch
     ↓                   ↓              ↓
Feature Previews → Staging Deploy → Production Deploy
```

### **Environment Mapping:**

| Environment    | Git Branch | Domain               | Purpose                                |
| -------------- | ---------- | -------------------- | -------------------------------------- |
| **Local**      | any        | `localhost:3000`     | Local development with Docker Supabase |
| **Preview**    | `preview`  | `staging.mikeiu.com` | Staging validation before production   |
| **Production** | `main`     | `mikeiu.com`         | Live public application                |

### **Deployment Flow:**

| Step | Source       | Target          | Deployment                   | Approval Required |
| ---- | ------------ | --------------- | ---------------------------- | ----------------- |
| 1    | Feature      | Feature Preview | Dynamic Vercel preview URLs  | No (auto)         |
| 2    | Feature → PR | Preview Branch  | Quality checks required      | Yes (PR review)   |
| 3    | Preview Push | Staging         | `staging.mikeiu.com`         | No (auto)         |
| 4    | Preview → PR | Main Branch     | Quality + staging validation | Yes (PR review)   |
| 5    | Main Push    | Production      | `mikeiu.com`                 | Yes (manual)      |

## Environment Configuration Mapping

| Component          | Local Development | Preview (Staging)                              | Production                                        | Notes                           |
| ------------------ | ----------------- | ---------------------------------------------- | ------------------------------------------------- | ------------------------------- |
| **Domain**         | `localhost:3000`  | `staging.mikeiu.com`                           | `mikeiu.com`                                      | Preview = staging validation    |
| **Database**       | Docker Supabase   | mike-staging (`qijxfigergpnuqbaxtjv`)          | mike-prod (`pzgczflyltjyxwqyteuj`)                | EU region for both projects     |
| **Sanity Dataset** | `development`     | `development`                                  | `production`                                      | Free plan limited to 2 datasets |
| **Vendor Keys**    | Test/sandbox keys | Test/sandbox keys                              | Live production keys                              | Test keys for all non-prod      |
| **Git Branch**     | any branch        | `preview` branch                               | `main` branch                                     | preview = default branch        |
| **Vercel Project** | Local dev server  | stagining (`prj_wnzBtc1Gg2LPZYOrYTi1cGMkBFi1`) | mike-com-web (`prj_wN2kD7lvIqP0BjopkvC9yd9Xl17f`) | Separate Vercel projects        |

## Common Variables

| Variable Name              | Local                    | Preview (Staging)            | Production               | Notes                         |
| -------------------------- | ------------------------ | ---------------------------- | ------------------------ | ----------------------------- |
| `NEXT_PUBLIC_SITE_URL`     | `http://localhost:3000`  | `https://staging.mikeiu.com` | `https://mikeiu.com`     | Public URL of the deployment. |
| `NODE_ENV`                 | `development`            | `production`                 | `production`             | Managed by Next.js/Vercel.    |
| `SENTRY_DSN`               | (optional)               | Staging DSN                  | Production DSN           | For error tracking.           |
| `NEXT_PUBLIC_POSTHOG_KEY`  | Test Key                 | Test Key                     | Production Key           | For analytics (client-safe).  |
| `NEXT_PUBLIC_POSTHOG_HOST` | `https://eu.posthog.com` | `https://eu.posthog.com`     | `https://eu.posthog.com` | PostHog EU residency.         |

## Supabase

### Database Project Mapping

| Environment    | Project Name | Project Reference      | Git Branch | Purpose                                |
| -------------- | ------------ | ---------------------- | ---------- | -------------------------------------- |
| **Local**      | Docker       | Local container        | any        | Local development with full schema     |
| **Preview**    | mike-staging | `qijxfigergpnuqbaxtjv` | `preview`  | Staging validation with safe test data |
| **Production** | mike-prod    | `pzgczflyltjyxwqyteuj` | `main`     | Live production application            |

### Vercel Environment Variables

These are stored in Vercel and pulled locally via `vercel env pull`.

| Variable Name                   | Local        | Preview (Staging) | Production        | Notes                                 |
| ------------------------------- | ------------ | ----------------- | ----------------- | ------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Local URL    | Staging URL       | Production URL    | Public URL for Supabase project.      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Local Key    | Staging Key       | Production Key    | Public anonymous key.                 |
| `SUPABASE_SERVICE_ROLE_KEY`     | Local Key    | Staging Key       | Production Key    | **Server-side only.** Secret key.     |
| `DATABASE_URL`                  | Local DB URL | Staging DB URL    | Production DB URL | **Server-side only.** For migrations. |

### Local-Only CLI Variables

These variables are used locally (e.g., in `.env.local` or exported in the shell) to link the Supabase CLI to the correct remote projects. They are **not** stored in Vercel.

| Variable Name                  | Value                  | Notes                                                 |
| ------------------------------ | ---------------------- | ----------------------------------------------------- |
| `SUPABASE_STAGING_PROJECT_REF` | `qijxfigergpnuqbaxtjv` | mike-staging project. Used by `pnpm db:link:staging`. |
| `SUPABASE_PROD_PROJECT_REF`    | `pzgczflyltjyxwqyteuj` | mike-prod project. Used by `pnpm db:link:prod`.       |

## Sanity

### CMS Configuration

| Environment    | Sanity Dataset | Git Branch | Purpose                               |
| -------------- | -------------- | ---------- | ------------------------------------- |
| **Local**      | `development`  | any        | Content development, preview, testing |
| **Preview**    | `development`  | `preview`  | Content staging validation            |
| **Production** | `production`   | `main`     | Live published content                |

### Environment Variables

| Variable Name                   | Local         | Preview (Staging) | Production   | Notes                                                                                                               |
| ------------------------------- | ------------- | ----------------- | ------------ | ------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | `nf3mt1vl`    | `nf3mt1vl`        | `nf3mt1vl`   | Sanity project identifier (same across environments).                                                               |
| `NEXT_PUBLIC_SANITY_DATASET`    | `development` | `development`     | `production` | Dataset for the environment. Free plan limited to 2 datasets, so staging uses development dataset for safe testing. |
| `SANITY_API_READ_TOKEN`         | Read Token    | Read Token        | Read Token   | **Server-side only.** For fetching content.                                                                         |

## Vendors (Stripe, Mux, Resend, MailerLite, PostHog, Sentry)

These keys should use **test/sandbox** versions for all non-production environments.

| Variable Name                        | Local       | Preview (Staging) | Production  | Notes                      |
| ------------------------------------ | ----------- | ----------------- | ----------- | -------------------------- |
| `STRIPE_SECRET_KEY`                  | Test Key    | Test Key          | Live Key    | **Server-side only.**      |
| `STRIPE_WEBHOOK_SECRET`              | Test Secret | Test Secret       | Live Secret | **Server-side only.**      |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Test Key    | Test Key          | Live Key    | Public key for Stripe.js.  |
| `MUX_TOKEN_ID`                       | Test ID     | Test ID           | Live ID     | **Server-side only.**      |
| `MUX_TOKEN_SECRET`                   | Test Secret | Test Secret       | Live Secret | **Server-side only.**      |
| `RESEND_API_KEY`                     | Test Key    | Test Key          | Live Key    | **Server-side only.**      |
| `MAILERLITE_API_KEY`                 | Test Key    | Test Key          | Live Key    | **Server-side only.**      |
| `NEXT_PUBLIC_POSTHOG_KEY`            | Test Key    | Test Key          | Live Key    | Client-safe analytics key. |
| `NEXT_PUBLIC_POSTHOG_HOST`           | EU Host     | EU Host           | EU Host     | PostHog EU instance.       |
| `SENTRY_DSN`                         | Test DSN    | Test DSN          | Prod DSN    | Error monitoring DSN.      |

## Deployment Workflow

This section documents the preview → production promotion flow:

### **Developer Workflow:**

1. **Feature Development**: Work on feature branches targeting `preview` branch
2. **Feature Preview**: Feature branches get automatic preview deployments for testing
3. **Preview Integration**: PR to `preview` branch triggers quality checks and review
4. **Staging Deployment**: Merged `preview` branch auto-deploys to `staging.mikeiu.com`
5. **Production Promotion**: PR from `preview` to `main` requires approval and triggers production deployment

### **Quality Gates:**

- **Feature Branch**: TypeScript, ESLint, build, Storybook checks
- **Preview Branch**: Same quality checks + PR review required
- **Main Branch**: All above + staging validation + manual approval

### **CI/CD Pipeline Requirements**

The following GitHub repository secrets are required for the CI/CD pipeline to function:

| Secret Name                    | Purpose                                                 | Used In              |
| ------------------------------ | ------------------------------------------------------- | -------------------- |
| `VERCEL_TOKEN`                 | Vercel deployment access                                | All pipelines        |
| `VERCEL_ORG_ID`                | Vercel organization identifier                          | All pipelines        |
| `SUPABASE_ACCESS_TOKEN`        | Supabase account access for migrations                  | Staging & Production |
| `SUPABASE_STAGING_PROJECT_REF` | mike-staging project reference (`qijxfigergpnuqbaxtjv`) | Staging deployment   |
| `SUPABASE_PROD_PROJECT_REF`    | mike-prod project reference (`pzgczflyltjyxwqyteuj`)    | Production promotion |

### **GitHub Environment Secrets**

Environment-specific secrets are configured in GitHub environments:

#### **Preview Environment** (for staging deployments)

- `VERCEL_TOKEN`: PAEsvEd5ex4x6CegeXCxe5RR
- `VERCEL_ORG_ID`: team_bAZzAnsbr1mfCn6L1ge4FI93
- `VERCEL_PROJECT_ID`: prj_wnzBtc1Gg2LPZYOrYTi1cGMkBFi1 (stagining project)
- `SUPABASE_ACCESS_TOKEN`: sbp_16dd629ec895a9d78897ef50ff3cabb55557edc5

#### **Production Environment** (for production deployments)

- `VERCEL_TOKEN`: PAEsvEd5ex4x6CegeXCxe5RR
- `VERCEL_ORG_ID`: team_bAZzAnsbr1mfCn6L1ge4FI93
- `VERCEL_PROJECT_ID`: prj_wN2kD7lvIqP0BjopkvC9yd9Xl17f (mike-com-web project)
- `SUPABASE_ACCESS_TOKEN`: sbp_16dd629ec895a9d78897ef50ff3cabb55557edc5

**✅ STATUS**: All secrets configured and pipeline ready for deployment
