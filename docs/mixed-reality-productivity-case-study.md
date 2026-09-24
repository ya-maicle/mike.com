# Designing a workspace for mixed reality — review record

The case study is a standard `caseStudy` document in the Sanity **development** dataset. The website reads it through the existing `/work/[slug]` route, `CaseStudyLayout`, Portable Text blocks, Sanity images, and Mux player. No case-study-specific page or video player is part of this PR.

- Sanity document ID: `caseStudy-meta-vr-productivity`
- Slug: `mixed-reality-productivity`
- Local route: `/work/mixed-reality-productivity`
- Work list: `/work`
- Visibility in development: public for review
- Production dataset: no matching case study

## Media placement

| Placement | Source | Sanity development asset |
| --- | --- | --- |
| Work cover and case-study hero | 7.7-second Meta VR Glasses promo edit: café workspace → projected keyboard → glasses reveal | `mux.videoAsset.meta-vr-productivity-cover-v2-2026` |
| Body image: multiwindow work | HzOS POE Figma journey | `image-899cd1f1c33f12cd03a5db1aa1a30c7d23f97019-3840x2161-png` |
| Body image: spatial comparison | HzOS POE Figma journey | `image-2bbbc261a6ab38df18b348dc90589eb1e1ff26b9-3840x2161-png` |
| Body image: surface typing | HzOS POE Figma journey | `image-5801586988f3c785c0638fc4f0fb578df4b67fd5-3840x2161-png` |
| Body pair: workspace restoration and display formats | HzOS POE remote-display board | `image-f303bec9ff922bbd1501e7ba9390dc8fef19ffe8-1930x1090-png`; `image-5bcb762d6f894eae01cc6b9a87c432d0a08bfadb-1930x1090-png` |
| Body video: workspace input | 13-second Meta Connect 2026 keynote excerpt | `mux.videoAsset.meta-vr-productivity-connect-2026` |

The promo excerpt is only the hero on the detail page; it is not repeated in the content blocks. The keynote excerpt and each Figma frame appear once in the body. The earlier café still and product stills were removed so the cover and body do not repeat the same launch imagery. The cover and header fields reference the same promo asset because the existing Work card uses those fields at different screen sizes.

The cover was recut after review because the earlier sequence ended on the compute puck without showing the glasses. The replacement opens on the work use case and closes on a clear product shot. The superseded Mux asset remains unreferenced by this case study.

## Editorial review

The body now follows the vision work from assignment through a representative work journey, spatial comparison, input, continuity with a connected computer, cross-team outcome and public launch context. Figma images are captioned as team vision concepts. The public keynote footage is identified as later product context. The slide-in “About the project” panel follows the Care AI Studio case-study pattern: five normal-text paragraphs with bold labels for Project, Role, Collaboration, Delivery, and Outcome, followed by the standard project metadata grid. The copy is stored in Sanity `panelContent`; no layout change is required.

The archived case-study notes disagree on whether the strategy work was in 2024 or 2025. The Sanity `projectInfo.year` field is intentionally blank until that date is confirmed. Public 2026 launch media is identified as illustration, separate from the original strategy work.

The Sanity development document and Mux uploads are the media and content source of truth. The raw selects in `apps/web/.local-drafts/` are ignored local working files; they are not used at runtime. This PR does not copy the case study into the production dataset or deploy production code.
