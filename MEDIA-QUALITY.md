# Media Quality Audit & Implementation Plan

> Status: **audit only — nothing implemented yet.** Written 2026-06-12 against
> branch `refactor/code-cleanup`. Goal: every image and video on the site feels
> sharp, clear, and premium by default (Apple.com benchmark), with a pipeline
> that makes that the default rather than something to fight for per-asset.

---

## 1. How media currently flows (verified architecture)

**Images (Sanity):** every content image renders through
`apps/web/src/components/sanity-image.tsx`, which wraps `next/image` with a
**custom loader** that builds `cdn.sanity.io` URLs directly
(`urlFor(image).width(w).auto('format').quality(q)`, plus `height + fit('crop')`
when an aspect ratio is forced). Defaults: `quality = 85`, LQIP blur-up
placeholder from asset metadata, intrinsic size 2000px (`BASE_WIDTH`).

Because of the custom loader, **the Next.js/Vercel image optimizer is never
used for Sanity images**. Consequences:

- `images.minimumCacheTTL` in `apps/web/next.config.ts` is a **no-op** for
  these images (it only governs `/_next/image`). Caching is whatever
  `cdn.sanity.io` sends — which is fine (immutable, long-lived), but the config
  comment claims this setting does the caching. Misleading, not harmful.
- `images.deviceSizes` still matters: it defines the candidate widths Next puts
  in `srcset`. The current list correctly includes the 1376px content canvas
  and its 2× (2752).
- No AVIF: `auto('format')` makes Sanity serve **WebP** to modern browsers.
  Sanity's image pipeline outputs jpg/png/webp; AVIF is not available through
  it (verify against current Sanity docs before relying on this).

**Video (Mux):** three layers —

- `mux-content-player.tsx` — `@mux/mux-player-react/lazy`, default
  `maxResolution: '1440p'`, poster = Mux `thumbnail.jpg` (signed via token
  claims for gated assets, `fit_mode=preserve` otherwise).
- `decorative-video.tsx` — wraps the player for autoplay/muted/loop usage,
  **default `maxResolution: '1080p'`**, mounts the player only after an
  IntersectionObserver fires (200px rootMargin), `next/dynamic` with
  `ssr: false`.
- `decorative-video-player.tsx` / `decorative-video-block.tsx` — page-level
  hero/cover wrappers; neither passes `maxResolution`, so they inherit the
  1080p decorative cap.

Studio uploads: `muxInput({ mp4_support: 'standard', max_resolution_tier: '2160p' })`
in `apps/web/src/app/studio/sanity.config.ts`.

---

## 2. Diagnosis — why media looks blurry or low quality

Ranked by likely visual impact. Two distinct symptom families: **(T) temporal**
(“blurry at first, improves after a while”) and **(P) persistent** (“never as
sharp as the source”).

### P1. Full-bleed videos are capped at 1080p — persistent softness (P)

`DecorativeVideo` defaults to `maxResolution: '1080p'` and **every call site
uses the default**. The homepage hero, case-study cover videos
(`DecorativeVideoPlayer` via `PageTemplate`), carousel videos, and program hero
videos all render in the 1376px content canvas — which is **2752 device pixels
on a 2× display**. A 1920×1080 stream upscaled ~1.4–2.6× across a hero is
visibly soft, permanently. This is the single biggest “premium feel” gap and
exactly the kind of thing Apple never does (their hero videos are served at or
above device resolution).

### P2. Mux ABR ramp-up — videos start blurry, then improve (T)

Mux adaptive streaming begins on a conservative rendition and steps up. With
autoplay-muted decorative video this means the first seconds of every hero loop
look soft on each visit. No `minResolution` is set anywhere. Combined with the
IntersectionObserver + dynamic-import + lazy-player mounting chain, the hero
video also _starts_ late, so the poster→soft-video→sharp-video sequence is very
noticeable above the fold.

### P3. Source images smaller than the requested width — browser upscaling (P)

The Sanity CDN **never upscales**: ask for `w=2752` of a 1920px-wide source and
you get 1920px back, which the browser then stretches to fill 2752 device
pixels. The component stack does everything right and the result is still soft.
This is invisible in code review — it is an **asset discipline** problem.
Full-bleed 16:9 media needs **2752×1548 minimum**; any screenshot exported at
1440/1920 wide will never be crisp on the 1376px canvas at 2× DPR.
(`aspectRatio` crops make it stricter: the _cropped_ region must still be
≥2752px wide.)

### P4. WebP at quality 85 on detailed UI screenshots (P)

Default `quality = 85` (and 80 for program-layout thumbs). WebP at 85 is good
for photography, but on fine UI text, hairline borders, and smooth gradients it
produces ringing/smudging that reads as “slightly off” on a design portfolio.
Heroes already use 90; body/carousel/card images don’t. For a portfolio,
crisp-first means **90 as the floor** for content imagery.

### P5. LQIP blur-up + heavy files — “blurry for a while” (T)

Every image shows the LQIP blur placeholder until the full asset arrives. With
2752px WebP files on slower connections that window is long, and for
**lazy-loaded** images it restarts at scroll time. This is the main driver of
“images improve after a while.” It is working as designed — the fix is to make
the swap faster (correct priority, right sizes, modest file sizes), not to
remove blur-up.

### P6. Above-the-fold media that is not prioritized (T)

- `CaseStudyCarousel` slides are never `priority` — but a carousel is often the
  first content block on a case study, sitting at/near the fold. The first
  slide lazy-loads.
- `ProjectCard` covers (home grid, /work index) are never `priority`; the first
  row is above the fold on most viewports.
- Conversely, `ProgramHeroExamples` marks **every** slide `priority`, which
  preloads off-screen slides and competes with the real LCP image.
- Hero images on home/page-template/work-list correctly use `priority`
  (Next emits `fetchpriority="high"` + preload for these — that part is right).

### P7. Pre-2160p Mux assets and encoding tier (P)

`max_resolution_tier: '2160p'` only affects **new** uploads. Any asset uploaded
before that setting was added is stored at max 1080p, and no `maxResolution`
prop can recover detail that was never encoded. The plugin config also doesn’t
pin Mux’s quality level (`video_quality` / legacy `encoding_tier`); the
account/asset tier should be verified — Mux’s “basic” quality level both caps
resolution and lowers bitrate noticeably.

### P8. Posters at default resolution/format (minor, P)

Posters use `thumbnail.jpg` with no `width`. Mux then serves the frame at the
video’s stored resolution — fine for 2160p assets, soft for 1080p ones, and
JPEG where WebP would hold gradients better. Signed posters bake render params
into token claims (`fit_mode: 'preserve'` only), so width can’t be tuned per
call site for gated assets without adding it to the claims.

### P9. Minor CSS/rendering notes (cosmetic)

- `group-hover:scale-[1.025]` on covers: browsers rasterize the layer at
  pre-transform size and scale on the compositor, so covers go _very slightly_
  soft during hover (most visible in Safari). At 1.025 it is borderline
  acceptable; scaling **down** from 1.0 (or pre-scaling the container) avoids it.
- `sizes="100vw"` on heroes that are actually capped at `--content-max-width`
  (1376px) over-requests on wide 1× screens (e.g. 1920w file where 1376 is
  rendered). Wasteful, not blurry — the correct value is
  `(min-width: 1376px) 1376px, 100vw` (already used by carousel/content blocks).
- The `sizes="… 1px"` trick for responsively-hidden duplicates
  (work-case-study-list) is intentional and fine.
- No raw `<img>`, no CSS `background-image` content media, no non-integer
  layout sizing issues found. `public/` only holds avatars.

---

## 3. Prioritized implementation plan

### Phase 1 — biggest visible wins (video + above-the-fold)

1. **Raise video ceilings by surface** (`decorative-video.tsx` call sites):
   - Full-bleed heroes (homepage cover, `DecorativeVideoPlayer`,
     `DecorativeVideoBlock`, carousel video, program hero): `maxResolution: '2160p'`
     (or `'1440p'` if bandwidth cost is a concern — see tradeoffs).
   - Keep `'1080p'` only for small tiles (≤700 CSS px wide, e.g. work-list 16:9
     panel at ~793px is borderline — use `'1440p'`).
   - Add `minResolution: '1080p'` on hero/full-bleed decorative video to kill
     the visible ABR ramp (player supports it).
2. **Verify Mux asset inventory.** Script (modeled on
   `scripts/mux-rotate-gated-to-signed.ts`) listing each asset’s
   `max_stored_resolution`, `video_quality`/`encoding_tier`, and bitrate;
   re-upload anything stored ≤1080p that renders full-bleed. This is a
   _content_ fix no code can substitute for.
3. **Fix priority coverage:**
   - `CaseStudyCarousel`: accept a `priority` prop; pass `priority` to slide 0
     when the carousel is the lead block (or unconditionally for slide 0 of
     above-the-fold carousels).
   - `ProjectCard`/grids: `priority` for the first visible row (index-based,
     like `work-case-study-list` already does).
   - `ProgramHeroExamples`: `priority` only for the initially visible slide.
4. **Eager-load the homepage hero video**: bypass (or shrink) the
   IntersectionObserver delay for above-the-fold `DecorativeVideo` instances
   (e.g. an `eager` prop that mounts immediately), so poster→video swap starts
   with the page, not after hydration + observer.

### Phase 2 — image quality floor

5. **Raise `DEFAULT_QUALITY` to 90** in `sanity-image.tsx`; remove the now
   redundant per-call `quality={90}`; keep ≤85 only for small thumbs
   (program-layout 152px tile). Optionally support `quality={95}` for
   text-dense screenshots flagged in Sanity (see Phase 3).
6. **Correct `sizes` on capped heroes**: `100vw` →
   `(min-width: 1376px) 1376px, 100vw` for the homepage cover and
   `PageTemplate` cover (saves bytes → faster blur-up swap, P5).
7. **Posters**: for public assets append `width=<2× rendered>` (and consider
   `format=webp`) to `thumbnail.jpg` URLs; for signed assets add `width` to the
   thumbnail token claims in `mux-signing.ts` (`signMuxToken(..., 't', config,
{ fit_mode: 'preserve', width: … })`).

### Phase 3 — pipeline guardrails (make quality the default)

8. **Low-res asset detection.** The data is already fetched
   (`metadata.dimensions`): in dev, `console.warn` from `SanityImage` when the
   source width is below the largest width the `sizes` attr implies at 2× DPR.
   Optionally a one-off audit script that walks Sanity assets and reports
   anything below the floor (full-bleed: 2752px) so existing content can be
   re-exported.
9. **Document the standard** (Section 4/5 below) in `CLAUDE.md`/`AGENTS.md`
   pointers + this file; add the pre-upload checklist to the Studio workflow.
10. **Config hygiene** (`next.config.ts`): fix the `minimumCacheTTL` comment
    (no-op for custom-loader images; keep it for any future optimizer usage),
    and note that `deviceSizes` is the srcset source of truth. If Next is
    upgraded to 16, add `images.qualities` accordingly.

### Explicitly considered and NOT recommended

- **Switching to the Vercel/Next optimizer to gain AVIF.** It would re-encode
  Sanity’s output, add Vercel image-transform cost/quotas, and put a second
  lossy step in the chain. WebP at q90 from Sanity’s CDN, with correctly sized
  sources, already meets the visual bar. Revisit only if Sanity ships AVIF
  (then it’s a free win via `auto=format`).
- **Removing LQIP blur-up.** The temporal blur is a loading-state feature;
  with Phase 1–2 the swap window shrinks to where it reads as polish, not lag.

---

## 4. Recommended media quality standard (site-wide)

**Canvas math:** content max-width is 1376 CSS px → **2752 device px at 2× DPR**
is the reference target for anything full-bleed.

| Surface                                              | Min source size                                                   | Delivery                                                                                 |
| ---------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Full-bleed image (hero, carousel, imageBlock `full`) | **2752px wide** (16:9 crop: 2752×1548)                            | WebP q90, srcset via deviceSizes                                                         |
| Two-column / `wide` images                           | 2000px wide                                                       | WebP q90                                                                                 |
| Card covers (1:1)                                    | 1100×1100 (550 CSS × 2)                                           | WebP q90                                                                                 |
| Small thumbs (≤160 CSS px)                           | 2× rendered                                                       | WebP q85                                                                                 |
| Text-dense UI screenshots                            | 2× rendered, exported PNG                                         | WebP q95 (or PNG if artifacts visible)                                                   |
| Hero/full-bleed video                                | **2160p master** (min 1440p), high-bitrate export (see checklist) | Mux `max_resolution_tier: 2160p`, playback `maxResolution ≥1440p`, `minResolution 1080p` |
| Tile/inline video                                    | 1440p master                                                      | playback `maxResolution 1440p`                                                           |
| Posters                                              | from ≥1440p stored asset                                          | `width` ≥2× rendered, `fit_mode=preserve`                                                |

**Principles:** crisp first, bytes second (portfolio priority); never let the
browser upscale (source ≥ requested width); above-the-fold media is eager +
prioritized, below-the-fold is lazy with LQIP; one pipeline (`SanityImage` /
Mux components) — no bespoke `<img>`/`<video>`.

---

## 5. Pre-upload checklist

**Images**

- [ ] Exported at **2× the largest rendered CSS size** (full-bleed: ≥2752px wide; 16:9 surfaces: the 16:9 crop itself is ≥2752×1548).
- [ ] Export format: PNG for UI/screenshots/flat colour; highest-quality JPEG for photography. Never pre-compress to WebP — Sanity transcodes.
- [ ] No scaling artifacts in the source (check at 100% zoom before upload).
- [ ] After upload, confirm width/height in Studio metadata meets the table above.
- [ ] Alt text set.

**Video**

- [ ] Master export ≥1440p, ideally 2160p (even for 1080p-ish display — Mux’s top rendition derives from it).
- [ ] High-bitrate export: ≥20 Mbps at 1080p, ≥45 Mbps at 2160p (H.264/HEVC).
- [ ] Uploaded through the Studio (inherits `max_resolution_tier: 2160p`).
- [ ] After processing, check the asset’s `max_stored_resolution` is ≥1440p.
- [ ] Poster frame: pick a sharp, representative frame (not a motion-blurred one).
- [ ] Gated content: confirm signed playback still works (ENVIRONMENT.md runbook).

---

## 6. Tradeoffs

| Change                             | Quality gain                                          | Cost                                                                                                                                                                            |
| ---------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| q85 → q90 WebP                     | Removes ringing on text/gradients                     | ~20–40% larger image payloads → slightly longer blur-up window (mitigated by correct `sizes`)                                                                                   |
| Video 1080p → 1440p/2160p playback | The single biggest hero upgrade                       | 2–4× streaming bandwidth; Mux delivery cost scales with resolution; users on slow connections buffer more (ABR still protects them — `maxResolution` is a ceiling, not a floor) |
| `minResolution: 1080p`             | No visible ramp-up                                    | Slower video start on poor connections; possible stalls — apply to decorative loops only, never the gated content player                                                        |
| More `priority` images             | Above-the-fold sharp immediately                      | Each preload competes for bandwidth; keep to the true LCP candidates (≤2–3 per page)                                                                                            |
| 2× source floor                    | Eliminates browser upscaling permanently              | Larger uploads + re-export effort for existing assets; Sanity storage growth (trivial at portfolio scale)                                                                       |
| Staying on Sanity CDN (no AVIF)    | Single lossy step, simple pipeline, immutable caching | ~20–30% larger than AVIF equivalents; acceptable per crisp-first policy                                                                                                         |

**Bottom line:** the components and `srcset`/`sizes` plumbing are largely
sound. The premium gap comes from (1) videos capped at 1080p on a 2752-device-px
canvas, (2) sources/posters that don’t respect the 2× floor, (3) an 85-quality
default on a portfolio, and (4) a handful of above-the-fold media not being
prioritized. Fix those four and the “Apple.com feel” follows from the existing
architecture.
