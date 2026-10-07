import { PublishAccessRequestAction } from '../../sanity/schemas/actions/publish-access-request'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { muxInput } from 'sanity-plugin-mux-input'
import { media } from 'sanity-plugin-media'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from '../../sanity/schemas'
import { GenerateBlogNarrationAction } from '../../sanity/schemas/actions/generate-blog-narration'
import { LinkToCaseStudyAction } from '../../sanity/schemas/actions/link-to-case-study'

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
            // Work section
            S.listItem()
              .title('Work')
              .icon(() => '💼')
              .child(S.documentTypeList('caseStudy').title('Case Studies')),
            S.listItem()
              .title('Programs')
              .icon(() => '🧭')
              .child(S.documentTypeList('program').title('Programs')),
            S.listItem()
              .title('Blog')
              .icon(() => '✍️')
              .child(S.documentTypeList('blogPost').title('Blog posts')),
            S.listItem()
              .title('Portfolio Access')
              .icon(() => '🔐')
              .child(
                S.list()
                  .title('Portfolio Access')
                  .items([
                    S.listItem()
                      .title('Settings and standard selection')
                      .child(
                        S.document()
                          .schemaType('portfolioAccessSettings')
                          .documentId('portfolioAccessSettings.config')
                          .title('Portfolio access settings'),
                      ),
                    S.listItem()
                      .title('Company profiles and blocked domains')
                      .child(
                        S.documentTypeList('portfolioAccessProfile').title(
                          'Company access profiles',
                        ),
                      ),
                    S.listItem()
                      .title('Awaiting review')
                      .child(
                        S.documentList()
                          .title('Awaiting review')
                          .schemaType('portfolioAccessRequest')
                          .filter('_type == "portfolioAccessRequest" && status == "pending"'),
                      ),
                    S.listItem()
                      .title('All requests and individual grants')
                      .child(
                        S.documentTypeList('portfolioAccessRequest').title(
                          'Requests and individual grants',
                        ),
                      ),
                    S.listItem()
                      .title('Emails need attention')
                      .child(
                        S.documentList()
                          .title('Emails need attention')
                          .schemaType('portfolioAccessRequest')
                          .filter(
                            '_type == "portfolioAccessRequest" && ((status == "pending" && coalesce(adminNotification.state, "pending") != "sent") || (status in ["approved", "declined", "revoked"] && coalesce(visitorNotification.state, "pending") != "sent"))',
                          ),
                      ),
                  ]),
              ),
            // Pages section
            S.listItem()
              .title('Pages')
              .icon(() => '📄')
              .child(S.documentTypeList('page').title('Pages')),
            S.listItem()
              .title('Deck — Short Link')
              .icon(() => '📎')
              .child(S.document().schemaType('deck').documentId('deck').title('Deck (Short Link)')),
          ]),
    }),

    // Reason: 2160p storage requires the smart encoding tier — pin it rather
    // than relying on the Mux account default (basic would cap resolution AND
    // bitrate). Assets uploaded before these settings stay at their original
    // tier; audit with scripts/mux-audit-quality.ts.
    muxInput({ mp4_support: 'standard', max_resolution_tier: '2160p', encoding_tier: 'smart' }),
    media(),
    visionTool({
      defaultApiVersion: '2025-01-01',
      defaultDataset: dataset,
    }),
  ],

  schema: {
    types: schemaTypes,
    templates: (templates) =>
      templates.filter(({ schemaType }) =>
        [
          'homePage',
          'caseStudy',
          'program',
          'blogPost',
          'page',
          'portfolioAccessProfile',
          'deck',
        ].includes(schemaType),
      ),
  },

  document: {
    actions: (prev, context) => {
      if (context.schemaType === 'portfolioAccessRequest') {
        return prev
          .filter((action) => action.action !== 'duplicate')
          .map((action) => (action.action === 'publish' ? PublishAccessRequestAction : action))
      }
      if (context.schemaType === 'blogPost' || context.schemaType === 'caseStudy') {
        return [...prev, GenerateBlogNarrationAction]
      }
      const eligible = new Set(['caseStudyBlock', 'imageBlock', 'videoBlock', 'carouselBlock'])
      if (eligible.has(context.schemaType)) {
        return [...prev, LinkToCaseStudyAction]
      }
      return prev
    },
    newDocumentOptions: (prev) =>
      prev.filter(({ templateId }) =>
        [
          'homePage',
          'caseStudy',
          'program',
          'blogPost',
          'page',
          'portfolioAccessProfile',
          'deck',
        ].includes(templateId),
      ),
  },

  tools: (prev) => {
    return prev
  },
})
