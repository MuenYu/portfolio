import type { Meta, StoryFn } from '@storybook/react';
import { Loader } from '~/components/loader';
import { StoryContainer } from '../../../.storybook/story-container';

const meta: Meta<typeof Loader> = {
  title: 'Loader',
  component: Loader,
};

export default meta;

type Story = StoryFn<typeof Loader>;

export const Default: Story = () => (
  <StoryContainer>
    <Loader width={48} />
  </StoryContainer>
);
