// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import config from '@maicle/config/eslint'

export default [...config, ...storybook.configs["flat/recommended"]];
