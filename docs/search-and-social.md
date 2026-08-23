# Search and social previews

The site uses the Next.js Metadata API as the single source of truth for search snippets and
link previews.

## Public identity

- Primary name: Mike Iukhtenko
- Structured aliases: Mike Yukhtenko, Mikhail Iukhtenko
- Canonical origin: `https://mikeiu.com`
- Primary positioning: Product Design Leader

The aliases connect older public profiles to the preferred spelling. Keep this information in
`src/lib/constants.ts` consistent with LinkedIn, Instagram, YouTube, and any future public profiles.

## Preview behaviour

- The site-wide fallback is the branded 1200 × 630 card referenced by
  `SITE_CONFIG.defaultSocialImageUrl`. This code-owned value is the single source of truth for the
  fallback card.
- The Home Page **Social Share Image** is a homepage-only override. It does not change the fallback
  used by other routes.
- `/work` has a dedicated, code-owned 1200 × 630 JPEG served from `/social/work.jpg`. Its Open
  Graph and Twitter/X metadata use the same image, with no CMS field to maintain.
- CMS pages, strengths, and case studies use their optional **Social Share Image** when present.
- Case studies fall back to an image header/cover, then to the default card. Video-led pages should
  have a dedicated 1200 × 630 social image.
- Search-engine portraits are managed in **Home Page → SEO Settings → Search Profile Images** and
  published in the homepage `Person.image` structured data.
- Page-specific titles, descriptions, canonical URLs, Open Graph tags, and Twitter/X card tags are
  generated together by `src/lib/seo.ts`.
- General CMS-page and strength meta titles are unbranded text with a maximum of 43 characters. The
  application appends ` – Mike Iukhtenko`, keeping the final title within 60 characters.
  Case-study titles are complete, use the full 60-character budget, and do not receive the suffix;
  this keeps the project name visible in narrow browser tabs. The homepage title is also complete.
- Metadata text is trimmed and repeated whitespace is collapsed before tags are generated.
- Privacy, terms, cookie policy, login, Studio, and debug pages are intentionally excluded from
  search results. Their routes remain crawlable so search engines can read `noindex`; only `/api/`
  is blocked in `robots.txt`. The `/deck` redirect sends `X-Robots-Tag: noindex, nofollow`.

## Adding unique preview images

Add a **Social Share Image** in each Sanity document's **SEO & Social Sharing** or **SEO Settings**
section. Use a 1200 × 630 image and keep essential text and subjects away from the outer edges.

Priority order:

1. Case studies, especially video-led projects.
2. Strength pages.
3. Other public pages that currently use the generic card. The `/work` index is already covered by
   its static card.

No additional global fallback asset is required.

## After production deployment

1. Add and verify `https://mikeiu.com` in Google Search Console and Yandex Webmaster.
2. If using HTML-tag verification, save the token value only (not the entire tag) as
   `GOOGLE_SITE_VERIFICATION` or `YANDEX_SITE_VERIFICATION` in Vercel, then redeploy.
3. Submit `https://mikeiu.com/sitemap.xml` in both webmaster tools.
4. Inspect the homepage URL and request recrawling/reindexing.
5. Use LinkedIn Post Inspector, Facebook Sharing Debugger, and social platform card validators to
   refresh cached previews after deployment.

Search engines choose their own display text and images, so metadata is a strong signal rather than
a guarantee. Keep the public portraits in the Person structured data stable and accurate if a
headshot-led Google result is desired.
