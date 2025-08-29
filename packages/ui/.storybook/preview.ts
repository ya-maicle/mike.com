import type { Preview } from '@storybook/react'

import '../styles/primitives.css'
import '../styles/semantic.css'
import 'geist/font/sans'
import 'geist/font/mono'

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
      return (
        <div style={{ fontFamily: "Geist, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'" }}>
          <Story />
        </div>
      )
    },
  ],
}

export default preview
