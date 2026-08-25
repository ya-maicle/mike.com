# PostHog Product Analytics V1

> Historical contract. The current schema and blog extension are documented in
> [PostHog Product Analytics V2](./posthog-analytics-v2.md).

Status: implemented and verified locally on 2026-08-23. The PostHog EU project and
Vercel Preview/Production configuration are ready; the application changes take effect
on the next deployment containing this branch.

## Outcome and definition of done

V1 answers four portfolio questions without collecting browsing data before consent:

1. Which public and recruiter case studies are viewed?
2. Which unlocked case studies earn meaningful engagement?
3. Where does portfolio access start, and what outcome does it reach?
4. Which case-study videos and email contact prompts are used?

V1 is done when the seven-event contract below is emitted only after explicit analytics
consent, carries no listed sensitive values, separates Preview from Production, appears
in the EU PostHog project, and passes the automated privacy and event-flow checks.

## In scope

- PostHog Cloud EU (Frankfurt), Product Analytics only.
- Explicit pathname-based page views and six portfolio events.
- Anonymous profiles until Supabase supplies a stable user id; identified profiles never
  receive an email address.
- Consent-aware Vercel Web Analytics, Vercel Speed Insights, and Mux analytics remain in
  place alongside PostHog.
- A single operational dashboard for Production, with Preview available as a diagnostic
  filter.
- Cookie-policy disclosure and a reproducible environment/verification runbook.

## Out of scope

- Autocapture, session replay, heatmaps, surveys, feature flags, experiments, error
  tracking, warehouse imports, reverse ETL, server-side capture, advertising pixels, and
  cross-device identity stitching.
- Content-deck interactions, arbitrary UI clicks, free-text fields, full referrers, URL
  query strings or fragments, email addresses, access tokens, playback ids, and signed
  media URLs.
- KPI targets or product decisions before a representative Production baseline exists.

## Event contract

Every event includes `schema_version=1`, `app_environment`, `page_type`, and `pathname`.
`app_environment` is `preview` or `production`; `pathname` never includes query strings or
fragments.

| Event                        | Trigger                                                                                                         | Allowed event properties                                                                          |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `$pageview`                  | Initial consented page and each pathname change                                                                 | Common properties only                                                                            |
| `case_study_viewed`          | A case-study route is rendered, including a locked recruiter study                                              | `study_slug`, `study_visibility`, `view_state`, `access_source`, optional `company_slug`          |
| `case_study_engaged`         | An unlocked study reaches 30 visible seconds plus 50% scroll, or its video reaches 25%; once per rendered study | Case-study properties plus `engagement_basis`                                                     |
| `portfolio_access_started`   | Google OAuth is launched or a magic-link request succeeds                                                       | `auth_method`, `entry_point`, optional `requested_study_slug`                                     |
| `portfolio_access_completed` | The post-auth portfolio claim resolves                                                                          | `outcome`, `auth_method`, `entry_point`, optional `requested_study_slug`, optional `company_slug` |
| `content_video_progressed`   | A user-controlled unlocked video reaches `started`, `25`, `50`, or `completed`; once per milestone per render   | Case-study properties, opaque Sanity `content_id`, `milestone`                                    |
| `contact_clicked`            | A consented user activates a `mailto:` link                                                                     | `channel=email`, `placement`, optional page-context slug                                          |

Access values are constrained to these enums:

- `study_visibility`: `public` or `recruiter`
- `view_state`: `locked` or `unlocked`
- `access_source`: `none`, `link`, or `login`
- `auth_method`: `google` or `magic_link`
- `entry_point`: `header`, `work_card`, `case_study_gate`, or `login_page`
- `outcome`: `granted`, `denied`, or `blocked`

## Privacy and data-integrity requirements

- Default state is off. The PostHog bundle, network calls, and persistence must not exist
  before a valid saved analytics choice is present.
- Do Not Track overrides a saved opt-in and clears legacy PostHog browser persistence.
- Withdrawing consent stops capture, resets identity, clears PostHog local/session storage
  and cookies, and reloads before optional injected analytics can run again.
- PostHog `before_send` removes unapproved properties and recursively rejects values that
  look like emails, secrets, query-bearing URLs, playback ids, or identity `$set` payloads.
- Autocapture, page-leave capture, session recording, flags, heatmaps, and default
  persistence are disabled in code and in PostHog project onboarding.
- `person_profiles` is `identified_only`; identification uses the Supabase user UUID plus
  low-cardinality access metadata, never email or provider tokens.
- OAuth-start capture uses an immediate beacon before browser navigation so the funnel
  start is not timing-dependent.

## Required configuration

| Variable                      | Preview                    | Production                 | Rule                                                           |
| ----------------------------- | -------------------------- | -------------------------- | -------------------------------------------------------------- |
| `NEXT_PUBLIC_POSTHOG_KEY`     | EU project token           | Same EU project token      | Client-safe project token; never substitute a personal API key |
| `NEXT_PUBLIC_POSTHOG_HOST`    | `https://eu.i.posthog.com` | `https://eu.i.posthog.com` | Any other host fails closed                                    |
| `NEXT_PUBLIC_POSTHOG_ENABLED` | `true`                     | `true`                     | Omit or set false to disable capture                           |
| `NEXT_PUBLIC_POSTHOG_ENV`     | `preview`                  | `production`               | Required dashboard/environment dimension                       |

The nominated PostHog project is EU project `255643` in the `maicle.co.uk` organization.
Local development remains disabled unless an ignored local env file explicitly enables it.
The Vercel variables only affect deployments created after the variables were updated.

## Dashboard specification

The live [Portfolio Analytics V1 dashboard](https://eu.posthog.com/project/255643/dashboard/910901)
contains the six tiles below. It has a saved 30-day override, and every tile defaults to
`app_environment = production`. Internal/test-user filtering remains off because the new
project has no internal-user rule; add a domain or IP rule before relying on that exclusion.

1. **Page views by page type** — `$pageview`, total count, broken down by `page_type`.
2. **Case-study views** — `case_study_viewed`, total count, broken down by `study_slug`;
   secondary breakdown `view_state`.
3. **Engaged case studies** — `case_study_engaged`, unique users and total count, broken
   down by `study_slug` and inspected alongside views.
4. **Portfolio access funnel** — `portfolio_access_started` to
   `portfolio_access_completed`, ordered, conversion window 24 hours; break down by
   `entry_point`, then inspect completion `outcome`.
5. **Video progression** — `content_video_progressed`, total count, broken down by
   `milestone`; filter by `study_slug` when diagnosing an individual study.
6. **Contact intent** — `contact_clicked`, total count, broken down by `placement` and
   optionally `context_slug`.

The custom event names were registered with anonymous, person-profile-disabled setup
events carrying `app_environment = preview`; Production-filtered tiles exclude that setup
data. Empty Production tiles are expected until a deployment containing this branch starts
receiving consented traffic.

Do not set KPI targets in V1. Review data quality after the first 14 days with at least 50
consented Production sessions; until then, report counts and funnel coverage as directional.

## Verification and release

Run from the repository root:

```bash
pnpm --filter web typecheck
pnpm --filter web test
pnpm --filter web build
PLAYWRIGHT_BASE_URL=http://127.0.0.1:8878 pnpm exec playwright test \
  tests/smoke/posthog-analytics.spec.ts --config=playwright.config.ts --reporter=line
```

The Playwright suite verifies no pre-consent capture or persistence, DNT suppression,
query-secret removal, page views, case-study/access/contact events, and withdrawal cleanup.
To deliberately send the first test to the real EU project, use
`POSTHOG_E2E_PASSTHROUGH=true`; do not use passthrough in routine CI.

Release sequence:

1. Deploy this branch to Preview and accept analytics in a clean browser profile.
2. Confirm one Preview `$pageview` with `schema_version=1`, a pathname without a query,
   and no email or secret fields.
3. Exercise one case study, access start, video milestone, and contact click; verify the
   Preview dashboard/event stream.
4. Promote the same verified build to Production.
5. Re-run the clean-profile pre-consent and withdrawal checks on Production.
6. After 24 hours, verify each expected event exists and no unexpected event name or
   high-cardinality property has appeared.

Rollback is immediate: set `NEXT_PUBLIC_POSTHOG_ENABLED=false` for the affected Vercel
environment and redeploy. This stops new PostHog initialization; existing users can also
withdraw analytics consent to clear browser persistence.

## Ownership and review cadence

The site owner owns the PostHog project, Vercel configuration, and monthly data-quality
review. Review event volume, unexpected properties, access-funnel coverage, and cost on
the first business day of each month. Treat any event-contract change as a schema change:
update the TypeScript map, sanitizer tests, this document, cookie disclosure, and dashboard
together. Obtain legal review before changing the stated purposes, adding personal data,
or enabling any currently out-of-scope PostHog product.
