import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { muxInput } from 'sanity-plugin-mux-input'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from '../../sanity/schemas'
import { LinkToCaseStudyAction } from '../../sanity/schemas/actions/link-to-case-study'

// Reading time calculation will be implemented in Stage 3 (Assembly Engine)

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
            // Work section
            S.listItem()
              .title('Work')
              .icon(() => '💼')
              .child(S.documentTypeList('caseStudy').title('Case Studies')),
          ]),
    }),

    muxInput(),
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
    // Future custom tools can be added here
    return prev
  },
})
