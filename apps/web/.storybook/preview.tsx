import type { Preview } from '@storybook/nextjs-vite'
import React from 'react'
import '../src/app/globals.css'
// import 'geist/font/sans'
// import 'geist/font/mono'

import { plain } from '../src/lib/fonts'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#0b0b0f' },
        { name: 'transparent', value: 'transparent' },
      ],
    },
    a11y: {
      test: 'todo',
    },
  },
  decorators: [
    (Story) => (
      <div className={`${plain.variable} bg-background text-foreground p-8`} style={{ fontFamily: 'var(--font-plain)' }}>
        <Story />
      </div>
    ),
  ],
}

export default preview
