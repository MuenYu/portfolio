import type { Meta, StoryFn } from '@storybook/react';
import { Link } from '~/components/link';
import { StoryContainer } from '../../../.storybook/story-container';

const meta: Meta<typeof Link> = {
  title: 'Link',
  component: Link,
};

export default meta;

type Story = StoryFn<typeof Link>;

export const Default: Story = () => (
  <StoryContainer style={{ fontSize: 18 }}>
    <Link href="https://hamishw.com">Primary link</Link>
    <Link secondary href="https://hamishw.com">
      Secondary link
    </Link>
  </StoryContainer>
);
