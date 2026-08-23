import { defineField, defineType } from 'sanity'
import {
  blockStyles,
  blockLists,
  blockDecorators,
  fontWeightAnnotation,
  linkAnnotation,
} from './objects/block-styles'
import { SEO_PAGE_TITLE_MAX_LENGTH } from '../../lib/constants'

export const page = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
      description: 'The URL path for this page (e.g., "about" for /about)',
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'text',
      rows: 2,
      description: 'Optional lead text displayed below the title',
    }),
    defineField({
      name: 'coverMedia',
      title: 'Cover Media',
      type: 'object',
      description: 'Optional cover image or video displayed below the header',
      fields: [
        defineField({
          name: 'type',
          title: 'Media Type',
          type: 'string',
          options: {
            list: [
              { title: 'Image', value: 'image' },
              { title: 'Video', value: 'video' },
            ],
            layout: 'radio',
          },
          initialValue: 'image',
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
              title: 'Alt Text',
              type: 'string',
              description: 'Alternative text for accessibility',
            }),
          ],
        }),
        defineField({
          name: 'video',
          title: 'Video',
          type: 'mux.video',
          hidden: ({ parent }) => parent?.type !== 'video',
        }),
      ],
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: blockStyles,
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
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
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
          description: `Page title before the site name is appended. Keep to ${SEO_PAGE_TITLE_MAX_LENGTH} characters.`,
          validation: (Rule) =>
            Rule.max(SEO_PAGE_TITLE_MAX_LENGTH).warning(
              `Use at most ${SEO_PAGE_TITLE_MAX_LENGTH} characters so the final branded title stays concise.`,
            ),
        }),
        defineField({
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          rows: 3,
          description: 'Description for search engine results',
          validation: (Rule) =>
            Rule.max(160).warning('Search results may truncate this description.'),
        }),
        defineField({
          name: 'shareImage',
          title: 'Social Share Image',
          type: 'image',
          options: { hotspot: true },
          description:
            'Optional 1200 × 630 page override. Uses an image cover, then the site card.',
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      slug: 'slug.current',
    },
    prepare({ title, slug }) {
      return {
        title,
        subtitle: slug ? `/${slug}` : 'No slug',
      }
    },
  },
})
