import { defineType, defineField } from 'sanity'

export const twoColumnImageBlock = defineType({
  name: 'twoColumnImageBlock',
  title: 'Two Column Images',
  type: 'object',
  fields: [
    defineField({
      name: 'leftImage',
      title: 'Left Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt text',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
        },
      ],
    }),
    defineField({
      name: 'rightImage',
      title: 'Right Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt text',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
        },
      ],
    }),
  ],
  preview: {
    select: {
      media: 'leftImage',
    },
    prepare({ media }) {
      return {
        title: 'Two Column Images',
        media,
      }
    },
  },
})
