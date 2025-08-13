import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y', '@storybook/addon-interactions'],
  docs: {
    autodocs: 'tag',
  },
}

export default config
