import type { ComponentProps } from 'react';
import { DecoderText } from '~/components/decoder-text';
import { Heading } from '~/components/heading';
import { StoryContainer } from '../../../.storybook/story-container';

type DecoderTextProps = ComponentProps<typeof DecoderText>;

interface DecoderTextStory {
  render: (args: DecoderTextProps) => JSX.Element;
  args?: Partial<DecoderTextProps>;
}

const meta = {
  title: 'DecoderText',
  component: DecoderText,
  args: {
    text: 'Slick cyberpunk text',
  },
} satisfies { title: string; component: typeof DecoderText; args: Partial<DecoderTextProps> };

export default meta;

export const Text: DecoderTextStory = {
  render: args => (
    <StoryContainer>
      <Heading level={3}>
        <DecoderText delay={0} {...args} />
      </Heading>
    </StoryContainer>
  ),
};
