import { defineType, defineField } from 'sanity'
import { blockStyles } from './objects/block-styles'

export const program = defineType({
  name: 'program',
  title: 'Program',
  type: 'document',
  description: 'A "Ways I help" program with its own page',

  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Program name (e.g. "Brand Refresh")',
      validation: (Rule) => Rule.required().min(3).max(100),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL-friendly version of the title',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'featuredOrder',
      title: 'Display Order',
      description:
        'Position in the home list and /programs index. Lower numbers appear first. Leave blank to sort by title.',
      type: 'number',
      validation: (Rule) => Rule.integer().min(0),
    }),

    defineField({
      name: 'homeListDescription',
      title: 'Home List Description',
      type: 'text',
      rows: 2,
      description:
        'Short one-liner shown beside the title in the home "Ways I help" list (e.g. "When teams are debating instead of deciding.")',
      validation: (Rule) => Rule.required().max(200),
    }),

    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description:
        'Punchy slogan shown above the title on the program page (e.g. "Stay Relevant. Stay Valuable.")',
    }),

    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
      description: 'Descriptive paragraph used as the page subtitle and SEO description',
      validation: (Rule) => Rule.required().min(20).max(400),
    }),

    defineField({
      name: 'heroExamples',
      title: 'Hero Examples',
      description:
        'Case studies that represent this program. Shown as a gallery in place of a hero image (2-4).',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'caseStudy' }],
        },
      ],
      validation: (Rule) => Rule.required().min(1).max(4),
    }),

    defineField({
      name: 'content',
      title: 'Content',
      description: 'Page content blocks (program details). Rendered below the hero.',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: blockStyles,
        },
        { type: 'imageBlock' },
        { type: 'videoBlock' },
        { type: 'carouselBlock' },
        { type: 'spacerBlock' },
        { type: 'twoColumnImageBlock' },
      ],
    }),

    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    }),

    defineField({
      name: 'seoSettings',
      title: 'SEO Settings',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
          description: 'Override the page title for search engines',
        }),
        defineField({
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          rows: 3,
          description: 'Description for search engine results',
        }),
      ],
    }),
  ],

  preview: {
    select: {
      title: 'title',
      subtitle: 'homeListDescription',
      media: 'heroExamples.0.coverImage',
    },
    prepare({ title, subtitle, media }) {
      return {
        title,
        subtitle,
        media,
      }
    },
  },
})
