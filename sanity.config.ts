import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { muxInput } from 'sanity-plugin-mux-input'
import { media } from 'sanity-plugin-media'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './apps/web/src/sanity/schemas'
import { LinkToCaseStudyAction } from './apps/web/src/sanity/schemas/actions/link-to-case-study'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET

export default defineConfig({
  name: 'mikeiu-cms',
  title: 'mikeiu.com CMS',

  projectId: projectId!,
  dataset: dataset!,

  basePath: '/studio',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('mikeiu.com CMS')
          .items([
            // Home Page (singleton)
            S.listItem()
              .title('Home Page')
              .icon(() => '🏠')
              .child(S.document().schemaType('homePage').documentId('homePage').title('Home Page')),

            S.listItem()
              .title('Work')
              .icon(() => '💼')
              .child(S.documentTypeList('caseStudy').title('Case Studies')),

            S.listItem()
              .title('Portfolio Access')
              .icon(() => '🔐')
              .child(
                S.documentTypeList('portfolioAccessProfile').title('Portfolio Access Profiles'),
              ),

            S.listItem()
              .title('Legal Pages')
              .icon(() => '⚖️')
              .child(S.documentTypeList('legalPage').title('Legal Pages')),
          ]),
    }),

    muxInput({ mp4_support: 'standard', max_resolution_tier: '2160p' }),
    media(),
    visionTool({
      defaultApiVersion: '2025-01-01',
      defaultDataset: dataset,
    }),
  ],

  schema: {
    types: schemaTypes,
  },

  document: {
    actions: (prev, context) => {
      const eligible = new Set(['caseStudyBlock', 'imageBlock', 'videoBlock', 'carouselBlock'])
      if (eligible.has(context.schemaType)) {
        return [...prev, LinkToCaseStudyAction]
      }
      return prev
    },
  },

  tools: (prev) => {
    return prev
  },
})
