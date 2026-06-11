// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook'

import config from '@maicle/config/eslint'

const eslintConfig = [
  {
    ignores: ['.next/**', 'storybook-static/**', 'next-env.d.ts', 'vitest.shims.d.ts'],
  },
  ...config,
  ...storybook.configs['flat/recommended'],
]

export default eslintConfig
