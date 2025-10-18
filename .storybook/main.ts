import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../app/**/*.stories.@(ts|tsx)'],
  addons: [
    { name: '@storybook/addon-essentials', options: { backgrounds: false } },
    '@storybook/addon-links',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {
      builder: {
        viteConfigPath: '.storybook/vite.config.ts',
      },
    },
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal(config) {
    // Merge custom configuration into the default config
    return mergeConfig(config, {
      assetsInclude: ['**/*.glb', '**/*.hdr', '**/*.glsl'],
      build: {
        assetsInlineLimit: 1024,
      },
    });
  },
};

export default config;
