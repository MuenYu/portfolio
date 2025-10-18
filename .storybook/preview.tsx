import type { Decorator, Preview } from '@storybook/react';
import { useEffect } from 'react';
import { ThemeProvider, themeStyles } from '../app/components/theme-provider';
import '../app/reset.css';
import '../app/global.css';
import './preview.css';

const ThemeDecorator: Decorator = (Story, context) => {
  const theme = context.globals.theme as 'light' | 'dark';

  useEffect(() => {
    document.body.dataset['theme'] = theme;
  }, [theme]);

  return (
    <ThemeProvider theme={theme}>
      <style>{themeStyles}</style>
      <div id="story-root" className="storyRoot">
        <Story />
      </div>
    </ThemeProvider>
  );
};

export const decorators = [ThemeDecorator];

export const globalTypes = {
  theme: {
    name: 'Theme',
    description: 'Global theme for components',
    defaultValue: 'dark',
    toolbar: {
      icon: 'paintbrush',
      items: ['light', 'dark'],
    },
  },
};

export const parameters = {
  layout: 'fullscreen',
  controls: { hideNoControlsWarning: true },
};

const preview: Preview = {
  decorators,
  globalTypes,
  parameters,
};

export default preview;
