import type { Preview } from '@storybook/react'
import React from 'react'

import '../styles/primitives.css'
import '../styles/semantic.css'
import './fonts.css'

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#0b0b0f' },
        { name: 'transparent', value: 'transparent' },
      ],
    },
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      element: '#storybook-root',
      restoreScroll: true,
    },
    layout: 'centered',
  },
  decorators: [
    (Story) => {
      return Story()
    },
  ],
}

export default preview
