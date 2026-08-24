import { defineField, defineType } from 'sanity'

import { SEO_PAGE_TITLE_MAX_LENGTH } from '../../lib/constants'
import {
  blockDecorators,
  blockLists,
  blockStyles,
  fontWeightAnnotation,
  linkAnnotation,
} from './objects/block-styles'

const blogBlockStyles = blockStyles.filter(({ value }) => value !== 'h1')

export const blogPost = defineType({
  name: 'blogPost',
  title: 'Blog post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().min(4).max(120),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
      description: 'The article URL, for example /blog/designing-with-ai.',
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      description: 'A concise summary used by search engines and link previews.',
      validation: (Rule) => Rule.required().min(20).max(300),
    }),
    defineField({
      name: 'cover',
      title: 'Cover',
      description: 'Cover media shown on the blog index and at the top of the article.',
      type: 'object',
      options: { collapsed: false, collapsible: false },
      fields: [
        defineField({
          name: 'type',
          title: 'Media type',
          type: 'string',
          options: {
            list: [
              { title: 'Image', value: 'image' },
              { title: 'Video', value: 'video' },
            ],
            layout: 'radio',
          },
          initialValue: 'image',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'image',
          title: 'Image',
          type: 'image',
          options: { hotspot: true },
          hidden: ({ parent }) => parent?.type !== 'image',
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt text',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
          ],
          validation: (Rule) =>
            Rule.custom((value, context) => {
              const parent = context.parent as { type?: string } | undefined
              if (parent?.type === 'image' && !value) return 'An image is required'
              return true
            }),
        }),
        defineField({
          name: 'video',
          title: 'Video',
          type: 'mux.video',
          hidden: ({ parent }) => parent?.type !== 'video',
          validation: (Rule) =>
            Rule.custom((value, context) => {
              const parent = context.parent as { type?: string } | undefined
              if (parent?.type === 'video' && !value) return 'A video is required'
              return true
            }),
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'content',
      title: 'Article',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: blogBlockStyles,
          lists: blockLists,
          marks: {
            decorators: blockDecorators,
            annotations: [fontWeightAnnotation, linkAnnotation],
          },
        },
        { type: 'imageBlock' },
        { type: 'videoBlock' },
        { type: 'carouselBlock' },
        { type: 'spacerBlock' },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'narration',
      title: 'Article narration',
      type: 'object',
      description:
        'Pre-generated article audio. Run pnpm blog:narrate -- --slug <slug> to refresh it after editing the article.',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: 'scriptOverride',
          title: 'Narration script override',
          type: 'text',
          rows: 10,
          description:
            'Optional. Leave blank to narrate the title, excerpt, and text blocks from the article.',
        }),
        defineField({
          name: 'audioFile',
          title: 'MP3 file',
          type: 'file',
          options: { accept: 'audio/mpeg' },
        }),
        defineField({
          name: 'durationSeconds',
          title: 'Duration in seconds',
          type: 'number',
          readOnly: true,
        }),
        defineField({
          name: 'provider',
          title: 'Provider',
          type: 'string',
          readOnly: true,
        }),
        defineField({
          name: 'model',
          title: 'Model',
          type: 'string',
          readOnly: true,
        }),
        defineField({
          name: 'voiceId',
          title: 'Voice ID',
          type: 'string',
          readOnly: true,
        }),
        defineField({
          name: 'voiceName',
          title: 'Voice name',
          type: 'string',
          readOnly: true,
        }),
        defineField({
          name: 'sourceHash',
          title: 'Source hash',
          type: 'string',
          readOnly: true,
          description: 'Used to detect when the written article has changed.',
        }),
        defineField({
          name: 'generatedAt',
          title: 'Generated at',
          type: 'datetime',
          readOnly: true,
        }),
      ],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'seoSettings',
      title: 'SEO settings',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: 'metaTitle',
          title: 'Meta title',
          type: 'string',
          description: `Optional search title. Keep to ${SEO_PAGE_TITLE_MAX_LENGTH} characters.`,
          validation: (Rule) => Rule.max(SEO_PAGE_TITLE_MAX_LENGTH).warning(),
        }),
        defineField({
          name: 'metaDescription',
          title: 'Meta description',
          type: 'text',
          rows: 3,
          validation: (Rule) => Rule.max(160).warning(),
        }),
        defineField({
          name: 'shareImage',
          title: 'Social share image',
          type: 'image',
          options: { hotspot: true },
          description:
            'Optional 1200 × 630 override. An image cover is used by default when available.',
        }),
      ],
    }),
  ],
  orderings: [
    {
      title: 'Publish date, newest',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: { title: 'title', publishedAt: 'publishedAt', media: 'cover.image' },
    prepare({ title, publishedAt, media }) {
      return {
        title,
        subtitle: publishedAt ? new Date(publishedAt).toLocaleDateString('en-GB') : 'Unscheduled',
        media,
      }
    },
  },
})
