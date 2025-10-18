import type { Meta, StoryObj } from '@storybook/react-vite';
import { Monogram } from '~/components/monogram';
import { StoryContainer } from '../../../.storybook/story-container';

const meta = {
  title: 'Monogram',
  component: Monogram,
} satisfies Meta<typeof Monogram>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <StoryContainer>
      <Monogram highlight />
    </StoryContainer>
  ),
};
