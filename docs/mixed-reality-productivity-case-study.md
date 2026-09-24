# Simple productivity for Meta VR Glasses — review record

This case study is a standard `caseStudy` document in the Sanity **development** dataset. The website renders it through the existing `/work/[slug]` route, `CaseStudyLayout`, Portable Text blocks, Sanity images and Mux player. The content is editable in Sanity Studio; there is no project-specific page or custom video player.

- Sanity document ID: `caseStudy-meta-vr-productivity`
- Slug: `mixed-reality-productivity`
- Local route: `/work/mixed-reality-productivity`
- Work list: `/work`
- Visibility in development: public for review
- Production dataset: no matching case study

## Editorial update

**Title:** Simple productivity for Meta VR Glasses

**Summary:** A productivity vision for Meta VR Glasses, connecting everyday work journeys, spatial interactions and a shared direction for the teams shaping the experience.

The opening paragraph now describes the project and states the role precisely: “I led the early design concepts for the productivity vision at Reality Labs.” The rest of the story focuses on the work journey, spatial windows, input, continuity with a computer and the shared direction that came out of the concepts. It distinguishes the early team concepts from the later public device footage. See [the current copy snapshot](mixed-reality-productivity-copy.md) for the complete body and project-panel text.

The five-paragraph slide-in “About the project” panel uses the same standard structure as Care AI Studio: Project, Role, Collaboration, Delivery and Outcome, followed by the usual metadata grid. It is stored in Sanity `panelContent`.

Visible image captions and descriptions were removed, as were the title and description beneath the keynote video. Image alt text remains for accessibility. The archived notes disagree on whether the strategy work was in 2024 or 2025, so `projectInfo.year` remains blank pending confirmation.

## Media placement

| Placement | Source | Sanity development asset |
| --- | --- | --- |
| Work cover and case-study hero | 7.7-second Meta VR Glasses promo edit: café worker → projected keyboard → glasses reveal | `mux.videoAsset.meta-vr-productivity-cover-v2-2026` |
| Body image: multiwindow work | HzOS POE Figma journey | `image-e92f7c2c2cd376353c72ff7d0ca0e210f855c0f7-3840x2161-png` |
| Body image: spatial comparison | HzOS POE Figma journey | `image-6bee19cdb8eeb9e30718cbccf887e1b16374c444-3840x2161-png` |
| Body image: surface typing | HzOS POE Figma journey | `image-ad440ecc6282ede53a1bcf8aff2765338d7b7b7e-3840x2161-png` |
| Body pair: workspace restoration and display formats | HzOS POE remote-display board | `image-dd48360f9fd0733bf2638bc77d5a6784ad9a2f7a-1920x1080-png`; `image-e294d5235e3fff9e48ec57968d3758f4b2322ea8-1920x1080-png` |
| Body video: workspace input | 13-second Meta Connect 2026 keynote excerpt | `mux.videoAsset.meta-vr-productivity-connect-2026` |

The five new Figma exports have square corners. Corner radius was removed before export so the shared website `MediaFrame` supplies the radius. Shadow was also removed for the two remote-display exports to avoid a transparent rim. The Figma source frames were restored after export.

Each Figma image and the keynote excerpt appears once in the body. The promo excerpt appears as the hero on the detail page and as the video cover on the Work and homepage cards; it does not repeat in body content. The earlier café still and product stills were removed. Old rounded exports and the superseded cover Mux asset remain unreferenced by this case study.

## Sanity editing and project lists

The title, summary, body (`content`), slide-in panel (`panelContent`), cover/header media, metadata and SEO fields are editable on the case-study document in Sanity Studio. The homepage project selection is editable through `homePage.featuredWorkSection.projects`; this project is currently first. `featuredOrder` is 3, which places it in the shared “Keep exploring” list on the other published case studies. The page and panel use shared components and their usual interface labels.

The Sanity development document and Mux uploads are the live content and media source. This PR records the reviewed state for comparison; it does not copy content to the production dataset or deploy production code. Raw selects in `apps/web/.local-drafts/` are ignored local working files and are not used at runtime.
