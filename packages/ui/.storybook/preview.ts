import type { Preview } from '@storybook/react'

import '../styles/tokens.css'

const preview: Preview = {
  parameters: {
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
}

export default preview
