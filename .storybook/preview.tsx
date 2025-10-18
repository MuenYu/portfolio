import type { Decorator, Preview } from '@storybook/react';
import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { ThemeProvider, themeStyles } from '../app/components/theme-provider';
import '../app/reset.css';
import '../app/global.css';
import './preview.css';

type ThemeWrapperProps = PropsWithChildren<{ theme: string }>;

const ThemeWrapper = ({ theme, children }: ThemeWrapperProps) => {
  useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  return (
    <ThemeProvider theme={theme}>
      <style>{themeStyles}</style>
      <div id="story-root" className="storyRoot">
        {children}
      </div>
    </ThemeProvider>
  );
};

const themeDecorator: Decorator = (Story, context) => {
  const theme = context.globals.theme as string;

  return (
    <ThemeWrapper theme={theme}>
      <Story />
    </ThemeWrapper>
  );
};

export const decorators = [themeDecorator];

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
