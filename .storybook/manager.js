import { themes } from '@storybook/theming';
import { addons } from '@storybook/manager-api';

addons.setConfig({
  theme: {
    ...themes.dark,
    brandImage: './icon.svg',
    brandTitle: 'Hamish Williams Components',
    brandUrl: 'https://hamishw.com',
  },
});
