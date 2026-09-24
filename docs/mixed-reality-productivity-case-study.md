# Mixed reality productivity case study — review record

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
| Work cover and case-study hero | 7-second Meta VR Glasses productivity promo excerpt | `mux.videoAsset.meta-vr-productivity-promo-2026` |
| Body image: café workspace | Meta VR Glasses marketing page | `image-2c5cd49c2c86f763f1226217d99f66ccf2b59e38-1814x1020-webp` |
| Body images: device and compute puck; product view | Meta VR Glasses marketing page | `image-12ee86d1038308f4d84d6315381dc338ae68ab7e-1814x1020-webp`; `image-94357968f5ec24244ceec27a810c429b510ec584-1808x976-webp` |
| Body video: workspace input | 13-second Meta Connect 2026 keynote excerpt | `mux.videoAsset.meta-vr-productivity-connect-2026` |

The promo excerpt is only the hero on the detail page; it is not repeated in the content blocks. The keynote excerpt and each still appear once in the body. The cover and header fields reference the same promo asset because the existing Work card uses those fields at different screen sizes.

## Editorial review

The slide-in “About the project” panel follows the Care AI Studio case-study pattern: five normal-text paragraphs with bold labels for Project, Role, Collaboration, Delivery, and Outcome, followed by the standard project metadata grid. The copy is stored in Sanity `panelContent`; no layout change is required.

The archived case-study notes disagree on whether the strategy work was in 2024 or 2025. The Sanity `projectInfo.year` field is intentionally blank until that date is confirmed. Public 2026 launch media is identified as illustration, separate from the original strategy work.

The Sanity development document and Mux uploads are the media and content source of truth. The raw selects in `apps/web/.local-drafts/` are ignored local working files; they are not used at runtime. This PR does not copy the case study into the production dataset or deploy production code.
