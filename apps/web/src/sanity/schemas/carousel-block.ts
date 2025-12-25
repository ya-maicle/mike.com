/* eslint-disable */
import { defineField, defineType } from 'sanity'

export const carouselBlock = defineType({
  name: 'carouselBlock',
  title: 'Carousel Block',
  type: 'object',
  description: 'A block with multiple images and/or videos (Mux).',

  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.min(3).max(120),
    }),

    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      description: 'Add images or videos to this carousel',
      of: [
        defineField({
          name: 'item',
          type: 'object',
          title: 'Item',
          fields: [
            defineField({
              name: 'kind',
              title: 'Kind',
              type: 'string',
              options: {
                list: [
                  { title: 'Image', value: 'image' },
                  { title: 'Video (Mux)', value: 'video' },
                ],
                layout: 'radio',
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              options: { hotspot: true },
              fields: [
                {
                  name: 'alt',
                  type: 'string',
                  title: 'Alt text',
                  validation: (Rule) => Rule.required(),
                },
                { name: 'caption', type: 'string', title: 'Caption' },
              ],
              hidden: ({ parent }) => parent?.kind !== 'image',
            }),
            defineField({
              name: 'video',
              title: 'Video',
              type: 'mux.video',
              hidden: ({ parent }) => parent?.kind !== 'video',
            }),
          ],
          preview: {
            select: { kind: 'kind', image: 'image' },
            prepare({ kind }) {
              return { title: kind === 'video' ? 'Video' : 'Image' }
            },
          },
        }) as any,
      ],
      validation: (Rule) => Rule.required().min(1),
    }),

    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.max(300),
    }),

    defineField({
      name: 'width',
      title: 'Width',
      type: 'string',
      description: 'Control how wide the carousel appears',
      options: {
        list: [
          { title: 'Narrow (Content Width)', value: 'narrow' },
          { title: 'Medium', value: 'medium' },
          { title: 'Wide', value: 'wide' },
          { title: 'Full Width', value: 'full' },
        ],
        layout: 'dropdown',
      },
      initialValue: 'full',
    }),
  ],

  preview: {
    select: { title: 'title', items: 'items', width: 'width' },
    prepare({ title, items, width }) {
      const count = Array.isArray(items) ? items.length : 0
      return {
        title: title || 'Carousel Block',
        subtitle: `${count} item${count === 1 ? '' : 's'} · Width: ${width || 'full'}`,
      }
    },
  },
})
