# PostHog Product Analytics V2

Status: implemented and verified on `codex/blog-mvp` on 2026-08-24.

V2 preserves the consent, privacy, identity, and EU data-boundary contract from
[PostHog Product Analytics V1](./posthog-analytics-v1.md) and extends it to the blog.

## Outcome and definition of done

The blog extension must answer:

1. How many consented visits reach the blog index and individual posts?
2. Which archive placement and position leads a reader into a post?
3. Which posts receive a view and which earn meaningful reading engagement?

V2 is complete when the typed events below are emitted only after consent, automated
privacy and browser tests pass, Preview events appear in PostHog EU, and the operational
dashboard contains the four blog insights below. Use the dashboard's
`app_environment=production` filter when evaluating live traffic.

## Event contract

Every event includes `schema_version=2`, `app_environment`, `page_type`, and a pathname
without query strings or fragments. Existing V1 events retain their property contracts.

| Event               | Trigger                                                                | Allowed event properties                                    |
| ------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------- |
| `$pageview`         | Initial consented page and pathname changes                            | Common properties; blog routes use `blog_index`/`blog_post` |
| `blog_card_clicked` | A blog-index card is activated                                         | `post_slug`, `card_placement`, `card_position`              |
| `blog_post_viewed`  | A blog post is rendered after analytics consent                        | `post_slug`                                                 |
| `blog_post_engaged` | A post reaches 30 visible seconds and at least 50% document depth once | `post_slug`, `engagement_basis=scroll_and_time`             |

`card_placement` is constrained to `featured`, `rail`, or `archive`. `card_position` is
the one-based position in the ordered post collection. Decorative autoplaying card media
does not create engagement events.

## Privacy and implementation constraints

- The existing explicit opt-in, Do Not Track override, withdrawal cleanup, URL sanitizer,
  EU ingestion host, and disabled autocapture/session replay settings remain unchanged.
- Post slugs are public, bounded CMS identifiers. Titles, excerpts, query strings,
  referrers, playback identifiers, and free text are not added to blog events.
- Click capture is delegated by the global consent-aware lifecycle, so blog cards remain
  server-rendered links and no duplicate PostHog client is introduced.
- A post view or engagement event is emitted at most once per rendered post.

## Dashboard specification

The existing [Portfolio & Blog Analytics V2 dashboard](https://eu.posthog.com/project/255643/dashboard/910901)
contains these insights:

1. **Blog page views** (`psVxVNT1`) — `$pageview`, total count, filter `page_type`
   matching `^blog_`, breakdown by `page_type`.
2. **Blog post views** (`C4wfMKJB`) — `blog_post_viewed`, total count, breakdown by
   `post_slug`.
3. **Engaged blog posts** (`MD7mYryB`) — `blog_post_engaged`, total count, breakdown by
   `post_slug`.
4. **Blog card discovery** (`AKlhvwhA`) — `blog_card_clicked`, total count, breakdown by
   `card_placement`; inspect `post_slug` and `card_position` when diagnosing.

Do not set targets until at least 14 days and 50 consented Production sessions provide a
representative baseline.

## Verification

Run from the repository root:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
PLAYWRIGHT_BASE_URL=http://127.0.0.1:8878 pnpm exec playwright test \
  tests/smoke/posthog-analytics.spec.ts --config=playwright.config.ts --reporter=line
```

The browser suite must prove pre-consent silence, DNT suppression, sanitized pageviews,
blog discovery/view/engagement events, existing portfolio events, and withdrawal cleanup.
Use `POSTHOG_E2E_PASSTHROUGH=true` only for a deliberate Preview verification against the
real EU project.

Verification completed on 2026-08-24:

- All five isolated analytics browser tests passed against a fake EU ingestion host.
- The focused real-project Preview test passed and the PostHog EU activity stream received
  `$pageview`, `blog_card_clicked`, `blog_post_viewed`, and `blog_post_engaged`.
- Expanded event properties confirmed `schema_version=2`, `app_environment=preview`,
  clean pathnames and slugs, and `engagement_basis=scroll_and_time` without query-string
  data.

Release remains deploy Preview, verify consented Preview events, promote the same build to
Production, then confirm the Production-filtered dashboard after traffic arrives.
