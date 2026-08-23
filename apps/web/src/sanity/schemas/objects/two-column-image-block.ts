import { defineType, defineField } from 'sanity'

export const twoColumnImageBlock = defineType({
  name: 'twoColumnImageBlock',
  title: 'Two Column Images',
  type: 'object',
  fields: [
    defineField({
      name: 'leftKind',
      title: 'Left Column Type',
      type: 'string',
      options: {
        list: [
          { title: 'Image', value: 'image' },
          { title: 'Video (Mux)', value: 'video' },
        ],
        layout: 'radio',
      },
      initialValue: 'image',
    }),
    defineField({
      name: 'leftImage',
      title: 'Left Image',
      type: 'image',
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.leftKind === 'video',
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
      name: 'leftMobileImage',
      title: 'Left Mobile Image (Optional)',
      type: 'image',
      description: 'An art-directed version for screens below 768px.',
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.leftKind === 'video',
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt text',
          validation: (Rule) => Rule.required(),
        },
      ],
    }),
    defineField({
      name: 'leftVideo',
      title: 'Left Video',
      type: 'mux.video',
      hidden: ({ parent }) => parent?.leftKind !== 'video',
    }),
    defineField({
      name: 'rightKind',
      title: 'Right Column Type',
      type: 'string',
      options: {
        list: [
          { title: 'Image', value: 'image' },
          { title: 'Video (Mux)', value: 'video' },
        ],
        layout: 'radio',
      },
      initialValue: 'image',
    }),
    defineField({
      name: 'rightImage',
      title: 'Right Image',
      type: 'image',
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.rightKind === 'video',
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
      name: 'rightMobileImage',
      title: 'Right Mobile Image (Optional)',
      type: 'image',
      description: 'An art-directed version for screens below 768px.',
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.rightKind === 'video',
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt text',
          validation: (Rule) => Rule.required(),
        },
      ],
    }),
    defineField({
      name: 'rightVideo',
      title: 'Right Video',
      type: 'mux.video',
      hidden: ({ parent }) => parent?.rightKind !== 'video',
    }),
  ],
  preview: {
    select: {
      media: 'leftImage',
      leftKind: 'leftKind',
      rightKind: 'rightKind',
    },
    prepare({ media, leftKind, rightKind }) {
      const describe = (kind?: string) => (kind === 'video' ? 'Video' : 'Image')
      return {
        title: 'Two Column',
        subtitle: `${describe(leftKind)} + ${describe(rightKind)}`,
        media,
      }
    },
  },
})
