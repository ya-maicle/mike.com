import type { Preview } from '@storybook/nextjs-vite'
import React from 'react'
import { Geist_Mono } from 'next/font/google'
import '../src/app/globals.css'
// import 'geist/font/sans'
// import 'geist/font/mono'

import { plain } from '../src/lib/fonts'

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

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
      <div
        className={`${plain.variable} ${geistMono.variable} antialiased bg-background text-foreground p-8`}
        style={{ fontFamily: 'var(--font-maicle-plain)' }}
      >
        <Story />
      </div>
    ),
  ],
}

export default preview
