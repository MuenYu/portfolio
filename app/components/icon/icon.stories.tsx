import type { Meta, StoryObj } from '@storybook/react';
import { Icon } from '~/components/icon';
import manifest from '~/components/icon/manifest.json';
import { StoryContainer } from '../../../.storybook/story-container';

const meta = {
  title: 'Icon',
  component: Icon,
} satisfies Meta<typeof Icon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Icons: Story = {
  render: () => (
    <StoryContainer>
      {Object.keys(manifest).map(key => (
        <Icon key={key} icon={key} />
      ))}
    </StoryContainer>
  ),
};
