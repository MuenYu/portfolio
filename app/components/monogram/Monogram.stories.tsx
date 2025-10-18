import { Monogram } from '~/components/monogram';
import { StoryContainer } from '../../../.storybook/story-container';

type StorybookMeta<T> = import('@storybook/react').Meta<T>;
type StorybookStory<T> = import('@storybook/react').StoryObj<T>;

const meta = {
  title: 'Monogram',
  component: Monogram,
} satisfies StorybookMeta<typeof Monogram>;

export default meta;

type Story = StorybookStory<typeof meta>;

export const Default: Story = {
  render: () => (
    <StoryContainer>
      <Monogram highlight />
    </StoryContainer>
  ),
};
