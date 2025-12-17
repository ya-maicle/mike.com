/**
 * Shared block styles configuration for Sanity Portable Text editors.
 * Matches the typography system defined in globals.css and typography.stories.tsx
 */

import { createElement } from 'react'

export const blockStyles = [
  { title: 'Normal', value: 'normal' },
  { title: 'Hero (H1)', value: 'h1' },
  { title: 'Heading 2', value: 'h2' },
  { title: 'Heading 3', value: 'h3' },
  { title: 'Heading 4', value: 'h4' },
  { title: 'Heading 5', value: 'h5' },
  { title: 'Heading 6', value: 'h6' },
  { title: 'Lead (P1)', value: 'lead' },
  { title: 'Small', value: 'small' },
  { title: 'Quote', value: 'blockquote' },
]

export const blockLists = [
  { title: 'Bullet', value: 'bullet' },
  { title: 'Numbered', value: 'number' },
]

export const blockDecorators = [
  { title: 'Bold', value: 'strong' },
  { title: 'Italic', value: 'em' },
  { title: 'Underline', value: 'underline' },
  { title: 'Strikethrough', value: 'strike-through' },
  { title: 'Code', value: 'code' },
]

export const fontWeightAnnotation = {
  name: 'fontWeight',
  title: 'Font Weight',
  type: 'object',
  icon: () => createElement('span', { style: { fontWeight: 'bold' } }, 'W'),
  fields: [
    {
      name: 'weight',
      title: 'Weight',
      type: 'string',
      options: {
        list: [
          { title: 'Light (300)', value: 'light' },
          { title: 'Regular (400)', value: 'normal' },
          { title: 'Medium (500)', value: 'medium' },
          { title: 'Semibold (600)', value: 'semibold' },
          { title: 'Bold (700)', value: 'bold' },
        ],
      },
    },
  ],
}
