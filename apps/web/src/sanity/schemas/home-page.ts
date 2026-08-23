import { defineField, defineType } from 'sanity'
import { SEO_TITLE_MAX_LENGTH } from '../../lib/constants'

export const homePage = defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  fields: [
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'Main hero text displayed at the top of the page',
      initialValue: 'Make progress inevitable.',
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'text',
      rows: 2,
      description: 'Description text displayed below the tagline',
      initialValue:
        'Principal Product Designer working at the intersection of strategy, systems, and execution.',
    }),
    defineField({
      name: 'heroButtons',
      title: 'Hero Buttons',
      type: 'object',
      description: 'Call-to-action buttons displayed below the subtitle',
      fields: [
        defineField({
          name: 'primaryButton',
          title: 'Primary Button',
          type: 'object',
          fields: [
            defineField({
              name: 'text',
              title: 'Button Text',
              type: 'string',
              initialValue: 'Work',
            }),
            defineField({ name: 'link', title: 'Link URL', type: 'string', initialValue: '/work' }),
          ],
        }),
        defineField({
          name: 'secondaryButton',
          title: 'Secondary Button',
          type: 'object',
          fields: [
            defineField({
              name: 'text',
              title: 'Button Text',
              type: 'string',
              initialValue: 'My Manifesto',
            }),
            defineField({
              name: 'link',
              title: 'Link URL',
              type: 'string',
              initialValue: '/manifesto',
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'coverMedia',
      title: 'Cover Media',
      type: 'object',
      description: 'Optional media block displayed below the hero section',
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
      name: 'programsSection',
      title: 'Programs Section',
      type: 'object',
      description: 'Ways I help brands section',
      fields: [
        defineField({
          name: 'label',
          title: 'Section Label',
          type: 'string',
          initialValue: 'Ways I help brands',
        }),
        defineField({
          name: 'heading',
          title: 'Heading',
          type: 'text',
          rows: 2,
          initialValue:
            'I work best when momentum matters, ambiguity is high, and decisions need to land.',
        }),
        defineField({
          name: 'button',
          title: 'Header Button',
          type: 'object',
          fields: [
            defineField({
              name: 'text',
              title: 'Text',
              type: 'string',
              initialValue: 'Explore Programs',
            }),
            defineField({
              name: 'link',
              title: 'Link',
              type: 'string',
              initialValue: '/strengths',
            }),
          ],
        }),
        defineField({
          name: 'programs',
          title: 'Programs',
          type: 'array',
          description: 'Select which programs to feature in the list. Each links to its own page.',
          of: [
            {
              type: 'reference',
              to: [{ type: 'program' }],
            },
          ],
        }),
        defineField({
          name: 'footerLink',
          title: 'Footer Link',
          type: 'object',
          fields: [
            defineField({
              name: 'text',
              title: 'Text',
              type: 'string',
              initialValue: 'All Programs (11)',
            }),
            defineField({
              name: 'link',
              title: 'Link',
              type: 'string',
              initialValue: '/strengths',
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'featuredWorkSection',
      title: 'Featured Work Section',
      type: 'object',
      description: 'Latest featured projects section',
      fields: [
        defineField({
          name: 'label',
          title: 'Section Label',
          type: 'string',
          initialValue: 'Latest work',
        }),
        defineField({
          name: 'heading',
          title: 'Heading',
          type: 'text',
          rows: 2,
          initialValue: 'Explore my latest projects and case studies.',
        }),
        defineField({
          name: 'button',
          title: 'Header Button',
          type: 'object',
          fields: [
            defineField({
              name: 'text',
              title: 'Text',
              type: 'string',
              initialValue: 'View All Work',
            }),
            defineField({ name: 'link', title: 'Link', type: 'string', initialValue: '/work' }),
          ],
        }),
        defineField({
          name: 'projects',
          title: 'Featured Projects',
          type: 'array',
          of: [
            {
              type: 'reference',
              to: [{ type: 'caseStudy' }],
            },
          ],
          validation: (Rule) => Rule.max(6),
          description: 'Select which case studies to feature (max 6)',
        }),
      ],
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
          description: 'Complete homepage title. No site-name suffix is added on this page.',
          validation: (Rule) =>
            Rule.max(SEO_TITLE_MAX_LENGTH).warning('Search results may truncate this title.'),
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
          title: 'Homepage Social Share Image',
          type: 'image',
          options: { hotspot: true },
          description:
            'Optional homepage-only 1200 × 630 override. It does not change the site-wide fallback card.',
        }),
        defineField({
          name: 'profileImages',
          title: 'Search Profile Images',
          type: 'object',
          description: 'Public portraits used to identify Mike in search-engine structured data.',
          fields: [
            defineField({
              name: 'square',
              title: 'Square (1:1)',
              type: 'image',
              description: 'Recommended size: 1200 × 1200.',
            }),
            defineField({
              name: 'fourByThree',
              title: 'Landscape (4:3)',
              type: 'image',
              description: 'Recommended size: 1200 × 900.',
            }),
            defineField({
              name: 'sixteenByNine',
              title: 'Landscape (16:9)',
              type: 'image',
              description: 'Recommended size: 1200 × 675.',
            }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Home Page',
        subtitle: 'Singleton document',
      }
    },
  },
})
