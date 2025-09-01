import type { Preview } from '@storybook/nextjs-vite'
import React from 'react'
import '../src/app/globals.css'
<<<<<<< HEAD
import 'geist/font/sans'
import 'geist/font/mono'
=======
>>>>>>> origin/preview

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
<<<<<<< HEAD
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#0b0b0f' },
        { name: 'transparent', value: 'transparent' },
      ],
=======
      disable: true,
>>>>>>> origin/preview
    },
    a11y: {
      test: 'todo',
    },
  },
  decorators: [
<<<<<<< HEAD
    (Story) => <Story />,
=======
    (Story) => (
      <div className="bg-background text-foreground p-8">
        <Story />
      </div>
    ),
>>>>>>> origin/preview
  ],
}

export default preview
