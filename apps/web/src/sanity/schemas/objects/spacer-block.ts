import { defineType, defineField } from 'sanity'

export const spacerBlock = defineType({
  name: 'spacerBlock',
  title: 'Spacer',
  type: 'object',
  fields: [
    defineField({
      name: 'size',
      title: 'Size',
      type: 'string',
      options: {
        list: [
          { title: 'Small (16px)', value: 'sm' },
          { title: 'Medium (32px)', value: 'md' },
          { title: 'Large (64px)', value: 'lg' },
          { title: 'Extra Large (96px)', value: 'xl' },
        ],
        layout: 'radio',
      },
      initialValue: 'md',
    }),
  ],
  preview: {
    select: {
      size: 'size',
    },
    prepare({ size }) {
      const labels: Record<string, string> = {
        sm: 'Small (16px)',
        md: 'Medium (32px)',
        lg: 'Large (64px)',
        xl: 'Extra Large (96px)',
      }
      return {
        title: `↕ Spacer: ${labels[size] || 'Medium'}`,
      }
    },
  },
})
