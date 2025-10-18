import type { Meta, StoryObj } from '@storybook/react-vite';
import { DecoderText } from '~/components/decoder-text';
import { Heading } from '~/components/heading';
import { StoryContainer } from '../../../.storybook/story-container';

const meta = {
  title: 'DecoderText',
  component: DecoderText,
  args: {
    text: 'Slick cyberpunk text',
  },
} satisfies Meta<typeof DecoderText>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Text: Story = {
  render: args => (
    <StoryContainer>
      <Heading level={3}>
        <DecoderText delay={0} {...args} />
      </Heading>
    </StoryContainer>
  ),
};
