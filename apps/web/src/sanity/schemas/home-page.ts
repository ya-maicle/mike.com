import { defineField, defineType } from 'sanity'

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
            defineField({ name: 'link', title: 'Link', type: 'string', initialValue: '/programs' }),
          ],
        }),
        defineField({
          name: 'programs',
          title: 'Programs',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({
                  name: 'title',
                  title: 'Title',
                  type: 'string',
                }),
                defineField({
                  name: 'description',
                  title: 'Description',
                  type: 'text',
                  rows: 2,
                }),
              ],
              preview: {
                select: {
                  title: 'title',
                  subtitle: 'description',
                },
              },
            },
          ],
          initialValue: [
            {
              title: 'Ambiguity to Direction',
              description: 'When teams are debating instead of deciding.',
            },
            {
              title: 'Stalled Momentum',
              description: "When work is happening, but progress isn't.",
            },
            {
              title: 'Systems Under Strain',
              description: 'When products outgrow ad-hoc decisions and need structure.',
            },
            {
              title: 'Strategy That Ships',
              description: 'When vision exists, but execution keeps slipping.',
            },
            {
              title: 'Complexity to Clarity',
              description: "When the problem isn't UI - it's everything around it.",
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
            defineField({ name: 'link', title: 'Link', type: 'string', initialValue: '/programs' }),
          ],
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
    prepare() {
      return {
        title: 'Home Page',
        subtitle: 'Singleton document',
      }
    },
  },
})
