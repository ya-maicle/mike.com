# Productivity for Meta VR Glasses — review record

The case study is the standard `caseStudy` document `caseStudy-meta-vr-productivity`, rendered at `/work/mixed-reality-productivity`. The body, panel, SEO fields, images and Mux video references are editable in Sanity Studio. The new content is in both the **development** and **production** datasets.

## Calling and new imagery

| Placement | Source | Sanity asset in both datasets |
| --- | --- | --- |
| After “The project” | Official Meta café workspace image supplied by the owner | `image-2c5cd49c2c86f763f1226217d99f66ccf2b59e38-1814x1020-webp` |
| “Calls alongside the work” concept | Owner's early HzOS POE exploration showing a call and shared work | `image-f63c669f7c4c264b063b42cf586494af6b31e82e-2880x1621-png` |
| “Calls alongside the work” public product | Official Meta calling image supplied by the owner | `image-580c335e418f1970ca914b9883245e128aab4f6c-4000x2250-jpg` |
| Open Graph and X/Twitter card | Owner's 1200 × 630 social artwork | `image-605adcc116bfae4a7e878161784cdd7519b87d2c-1200x630-jpg` |

The new body images each appear once. The café image sits in the project context; the two calling images sit in the new calling section between laptop extension and the result. The concept copy explicitly identifies the early interface as unshipped. The later product copy uses [Meta's September 2026 announcement](https://about.fb.com/news/2026/09/introducing-meta-vr-glasses-3d-movies-immersive-live-sports-100-grams/) for the claims about hologram calling, spatial audio, phones/computers, WhatsApp and Zoom. The official calling image is identified as later product imagery. Images have no visible captions or descriptive text beneath them; their alt text is stored in Sanity.

The supplied concept PNG has a rectangular frame with no rounded cutout. The existing site media component applies corner radius. The café and official images are also rectangular. The pre-existing Figma exports remain in place and are not reused by the new section.

## Search and social

The Sanity `seoSettings` now hold the meta title, a description that includes calling, and the supplied social image. The existing page metadata code uses these fields for the canonical case-study URL, Open Graph article data and X/Twitter large-image card. The social image is separate from the body to avoid repeating it in the case study. See [the current copy snapshot](mixed-reality-productivity-copy.md) for exact text.

## Video and visibility

Recruiter-only visibility stays as requested. The work-card cover and case-study hero still reference the same public Mux asset, `meta-vr-productivity-cover-v2-2026-mux`; the keynote excerpt still references `meta-vr-productivity-connect-2026-mux`. These videos were already repaired in both Sanity datasets and are visible on the live site.

On September 25, 2026, the four new images and the development `content`, `panelContent` and `seoSettings` fields were copied to production Sanity. The production document now has the same 27 body blocks and SEO fields as development. Its earlier audio narration was preserved; the existing Listen action still serves that recording, which does not cover the new calling section. This PR records the content state and does not deploy production code.
