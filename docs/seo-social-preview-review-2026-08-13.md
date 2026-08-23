# SEO and social-preview implementation review

**Reviewed:** 13 August 2026
**Target:** Current `codex/seo-social-previews` working tree
**Framework:** Next.js 15.4.10 App Router
**Initial assessment:** Strong foundation, with crawler-control and page-specific preview-image gaps.

> **Follow-up status — 13 August 2026:** SEO-01 and SEO-03 through SEO-08 were resolved in the working tree after this review. SEO-02 is partly resolved: `/work` now has a dedicated code-owned preview, bringing unique preview coverage to 3 of 12 indexable URLs, while unique case-study and strength images remain an editorial task in Sanity. The findings below are retained as the evidence that drove those changes.
>
> **Current verification:** typecheck, lint, and all 63 unit tests pass; `/social/work.jpg` is a valid 1200 × 630 JPEG used by both Open Graph and Twitter/X metadata. The production build compiles successfully and begins generating 22 routes, but the current working tree has an unrelated `/_not-found` prerender error that must be resolved before release.

## Executive summary

The implementation correctly centralises most page metadata, emits canonical URLs, creates complete Open Graph and Twitter/X cards, adds a sitemap and robots file, and introduces useful CMS controls for titles, descriptions, social images, and profile imagery. The production build, typecheck, lint, and all 48 unit tests pass.

A local production crawl found that all 12 sitemap URLs:

- returned HTTP 200;
- had a matching canonical URL;
- emitted title, description, robots, Open Graph, and Twitter/X core tags;
- exposed those tags in the document head to a Facebook crawler user agent; and
- referenced a social image that returned HTTP 200.

There are two launch-significant gaps:

1. `robots.txt` blocks several URLs that rely on a `noindex` directive. Blocked crawlers cannot read that directive, so the implementation does not reliably keep those URLs out of search results.
2. The page-specific preview-image rollout is mostly unpopulated: 10 of the 12 indexable URLs use the same generic card. Only `/bio` and `/quest-multi-account` currently use unique preview imagery.

## Prioritised findings

### SEO-01 — High: `robots.txt` prevents crawlers from seeing some `noindex` rules

**Evidence**

- `apps/web/src/app/robots.ts:10` disallows `/login`, `/debug/`, `/studio/`, and `/deck`.
- `/login`, `/debug/profile`, and Studio emit `noindex` metadata through `createPageMetadata`.
- `/deck` returns a 302 redirect but does not send an `X-Robots-Tag` header (`apps/web/src/app/(website)/deck/route.ts:9-19`).
- The local response audit confirmed `noindex` meta tags on the HTML utility pages, but no `X-Robots-Tag` on `/deck`.

**Impact**

Google states that a URL blocked by `robots.txt` cannot have its `noindex` directive read and may still appear as a URL-only result when linked elsewhere. The current rules therefore conflict with the stated intention to exclude login, debug, Studio, and deck URLs from search.

**Recommendation**

- Allow crawlers to fetch HTML pages that carry `noindex`; remove `/login`, `/debug/`, and Studio page paths from `Disallow`.
- Add `X-Robots-Tag: noindex, nofollow` to both `/deck` responses, then allow `/deck` to be crawled so the header can be read.
- Keep true crawl-only exclusions such as `/api/` in `robots.txt`.
- Verify the result with Search Console URL Inspection after deployment.

Reference: [Google: block indexing with `noindex`](https://developers.google.com/search/docs/crawling-indexing/block-indexing) and [robots meta / `X-Robots-Tag`](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag).

### SEO-02 — Medium: page-specific social-preview imagery is largely missing

**Evidence**

The rendered sitemap inventory contains 12 indexable URLs:

- 10 use the generic `ff338b...-1200x630.jpg` card;
- 2 use unique imagery: `/bio` and `/quest-multi-account`;
- all five `/work/[slug]` case studies use the generic card; and
- both `/strengths/[slug]` pages use the generic card.

The default card is visually strong: it has clear identity, good contrast, safe margins, and a correct 1200 × 630 canvas. The problem is repetition rather than quality. It does not contain the current page title, so most shared URLs are visually indistinguishable in feeds or messages.

The case-study fallback in `apps/web/src/app/(website)/work/[slug]/page.tsx:42-46` uses only image headers/covers. Video-led covers fall through to the generic card unless an editor manually supplies `seoSettings.shareImage`, even though the project already has Mux poster support in `apps/web/src/lib/mux-poster.ts`.

**Recommendation**

- Populate `shareImage` for every launch-critical case study and strength.
- For video-led content, either use a stable public poster as the fallback or require a dedicated social image in Sanity.
- Consider route-specific generated cards that combine a project image, page title, and small site identity. This preserves the polished visual system while making every preview recognisable.
- Add a CMS preview and a warning when a high-value page will publish with the generic fallback.

### SEO-03 — Medium: the default card has two sources of truth

**Evidence**

- `apps/web/src/lib/constants.ts:9-10` hard-codes the default Sanity asset URL.
- The homepage separately reads `seoSettings.shareImage` from Sanity.
- `docs/search-and-social.md:18-19` requires those two values to be kept manually in sync.

**Impact**

An editor can replace the homepage card in Sanity while every fallback page continues to use the old hard-coded asset. This produces silent brand drift with no failing test or CMS warning.

**Recommendation**

Choose one durable source:

- a file-based `opengraph-image` asset committed with the app;
- a single global Sanity site-settings document used by all dynamic metadata; or
- a generated default image owned by the application.

Avoid a manual synchronisation rule between CMS content and source code. Next.js also recommends file-based Open Graph metadata when it avoids synchronising configuration with the underlying file.

Reference: [Next.js Metadata API](https://nextjs.org/docs/15/app/api-reference/functions/generate-metadata) and [Open Graph image file convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image).

### SEO-04 — Medium: the CMS title contract does not match the rendered document title

**Evidence**

- Root metadata appends ` – Mike Iukhtenko` through the title template (`apps/web/src/app/layout.tsx:15-18`).
- CMS `metaTitle` fields warn only after 60 characters.
- The field copy describes the value as an override, but the rendered `<title>` is still modified by the root template.
- Open Graph and Twitter/X use the raw CMS title, while the HTML document title uses the suffixed version.

**Impact**

A 60-character CMS title can render at roughly 78 characters, and an editor who includes the brand can accidentally produce a duplicated brand suffix. Search and social titles can also diverge without the editor seeing the final output.

**Recommendation**

Define the field explicitly as either:

- a complete title, rendered with `title.absolute`; or
- an unbranded page title, with validation and preview based on the final suffixed length.

A live search/social snippet preview in Sanity would make this contract visible.

### SEO-05 — Low: Twitter/X image alternative text is not emitted

**Evidence**

`apps/web/src/lib/seo.ts:82-87` supplies `twitter.images` as a URL string. Rendered pages have `og:image:alt` but no `twitter:image:alt`.

**Recommendation**

Pass a Twitter image object containing both `url` and `alt`. The Next.js metadata type supports this and emits `twitter:image:alt`.

### SEO-06 — Low: metadata text is not normalised before rendering

**Evidence**

The current `/bio` meta description contains a literal newline from Sanity. `createPageMetadata` forwards CMS strings without trimming or collapsing whitespace, and whitespace-only CMS values are truthy fallbacks.

**Impact**

The HTML remains valid and most crawlers normalise whitespace, but preview text can become inconsistent across consumers and empty-looking values can bypass fallback copy.

**Recommendation**

Trim metadata fields, collapse repeated whitespace/newlines to one space, and treat normalised empty strings as absent. Add minimum-quality validation to the CMS fields.

### SEO-07 — Low: site-level structured data is fetched and repeated on every website route

**Evidence**

`apps/web/src/app/(website)/layout.tsx:12-30` fetches profile images and emits the `Person` and `WebSite` graph for every website page, including `noindex` utility pages. The homepage already fetches the same home document and emits `ProfilePage` data.

**Impact**

This is not a schema error, but it broadens a CMS dependency to every route and repeats markup beyond the page where Google asks for `WebSite` site-name data. It also separates the linked `ProfilePage` and `Person` nodes across components and fetches.

**Recommendation**

Emit the connected `WebSite` + `Person` + `ProfilePage` graph on the homepage and reuse the homepage query result. Keep global layout metadata static.

Reference: [Google site-name structured data](https://developers.google.com/search/docs/appearance/site-names) and [ProfilePage structured data](https://developers.google.com/search/docs/appearance/structured-data/profile-page).

### SEO-08 — Low: tests cover the helper, not the published SEO surface

**Evidence**

`apps/web/src/lib/seo.test.ts` has three useful unit tests, but there are no automated checks for:

- the generated `robots.txt` rules;
- sitemap inclusions, exclusions, duplicates, and status codes;
- JSON-LD validity and entity links;
- crawler-visible route metadata;
- social-image HTTP availability; or
- generic-versus-unique preview coverage.

**Recommendation**

Add a small production smoke suite that checks representative static, dynamic, noindex, and redirect routes with an HTML-limited social crawler user agent. Test the crawler-control contract so SEO-01 cannot regress.

## What is implemented well

- `metadataBase` and canonical URLs consistently use the production origin.
- Indexable routes get complete title, description, canonical, Open Graph, Twitter/X, and crawler directives from one helper.
- Sanity images are cropped to 1200 × 630, preserve hotspots, return valid JPEG/PNG responses, and use long-lived CDN caching.
- The homepage, generic pages, strengths, and case studies have sensible metadata fallbacks.
- Utility and legal pages are omitted from the sitemap.
- The sitemap contains no duplicate URLs and uses meaningful CMS modification timestamps.
- JSON-LD is safely serialised with `<` escaped, uses stable `@id` values, and links `ProfilePage`, `Person`, and `WebSite` entities.
- The default social card is visually polished and professionally composed.
- Search Console/Yandex verification hooks and post-deployment instructions are documented.

## Optional enhancements

These are not blockers:

- Add `Article` or `CreativeWork` structured data for public case studies, connected to the existing `Person` author node.
- Use `en-GB` on the root `<html lang>` for consistency with the manifest and Open Graph locale.
- Remove sitemap `priority` and `changefreq` if desired; Google documents that it ignores both fields.
- Add a Twitter/X site or creator handle only if an official account exists.

## Verification performed

| Check                                     | Result                     |
| ----------------------------------------- | -------------------------- |
| `pnpm --filter web test`                  | Pass — 48 tests            |
| `pnpm --filter web typecheck`             | Pass                       |
| `pnpm --filter web lint`                  | Pass                       |
| `pnpm --filter web build`                 | Pass — 22 generated routes |
| Sitemap inventory                         | 12 URLs, 0 duplicates      |
| Sitemap route crawl                       | 12/12 returned 200         |
| Canonical match                           | 12/12                      |
| Core OG/Twitter tags for Facebook crawler | 12/12                      |
| Referenced social image availability      | 12/12 returned 200         |
| Unique preview imagery                    | 2/12                       |
| Intended noindex HTML routes              | Meta tags present          |
| `/deck` indexing header                   | Missing `X-Robots-Tag`     |

## Recommended implementation order

1. Fix `robots.txt` / `noindex` interaction and add the `/deck` `X-Robots-Tag`.
2. Provide unique cards for the five case studies and two strengths, or add a reliable generated/video-poster fallback.
3. Consolidate the default social image into one source of truth.
4. Clarify the CMS title contract and final-length validation.
5. Add Twitter image alt text and normalise CMS metadata strings.
6. Move site-level structured data to the homepage and add route-level SEO smoke tests.
