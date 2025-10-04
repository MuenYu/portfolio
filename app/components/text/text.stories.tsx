import type { Meta, StoryObj } from '@storybook/react';
import { Text } from '~/components/text';
import { StoryContainer } from '../../../.storybook/story-container';

const meta = {
  title: 'Text',
  component: Text,
} satisfies Meta<typeof Text>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Size: Story = {
  render: () => (
    <StoryContainer vertical>
      <Text size="xl">XLarge</Text>
      <Text size="l">Large</Text>
      <Text size="m">Medium</Text>
      <Text size="s">Small</Text>
    </StoryContainer>
  ),
};

export const Weight: Story = {
  render: () => (
    <StoryContainer vertical>
      <Text weight="regular">Regular</Text>
      <Text weight="medium">Medium</Text>
      <Text weight="bold">Bold</Text>
    </StoryContainer>
  ),
};

export const Align: Story = {
  render: () => (
    <StoryContainer vertical stretch>
      <Text align="start">Start</Text>
      <Text align="center">Center</Text>
    </StoryContainer>
  ),
};
