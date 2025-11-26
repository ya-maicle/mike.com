import { groq } from 'next-sanity'

// Tag helpers for ISR revalidation in Next fetch calls
export const caseStudyTag = (slug: string) => `caseStudy:${slug}`
export const caseStudiesTag = 'caseStudies'

// Fetch a single case study by slug with all populated blocks and client
// Includes prerequisites[]-> for caseStudyBlock documents
export const CASE_STUDY_WITH_BLOCKS = groq`
  *[_type == "caseStudy" && slug.current == $slug][0]{
    _id,
    _type,
    title,
    summary,
    publishedAt,
    seoSettings,
    slug,
    coverImage{..., asset->},
    projectInfo,

    // Inline content blocks
    content[]{
      ...,
      _type == 'imageBlock' => {
        ...,
        image{..., asset->}
      },
      _type == 'videoBlock' => {
        ...,
        video{asset->{playbackId}}
      },
      _type == 'carouselBlock' => {
        ...,
        items[]{
          kind,
          image{..., asset->},
          video{asset->{playbackId}}
        }
      }
    }
  }
`

// Fetch all published case studies for listing (minimal projection)
export const PUBLISHED_CASE_STUDIES = groq`
  *[_type == "caseStudy" && defined(slug.current)] | order(featuredOrder asc){
    _id,
    title,
    summary,
    slug,
    featuredOrder,
    publishedAt,
    coverImage{..., asset->},
    projectInfo
  }
`
