import type { ComponentPropsWithoutRef } from 'react';
import { useState } from 'react';
import type { Meta, StoryFn } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { Button } from '~/components/button';
import { StoryContainer } from '../../../.storybook/story-container';

type LoadableButtonProps = ComponentPropsWithoutRef<typeof Button>;

const meta: Meta<typeof Button> = {
  title: 'Button',
  component: Button,
};

export default meta;

const LoadableButton = (props: LoadableButtonProps) => {
  const [loading, setLoading] = useState(false);
  return <Button loading={loading} onClick={() => setLoading(!loading)} {...props} />;
};

type Story = StoryFn<typeof Button>;

export const Primary: Story = () => (
  <StoryContainer>
    <Button onClick={action('clicked')}>Text only</Button>
    <Button icon="send" onClick={action('clicked')}>
      Icon left
    </Button>
    <Button iconEnd="arrow-right" onClick={action('clicked')}>
      Icon right
    </Button>
  </StoryContainer>
);

export const Secondary: Story = () => (
  <StoryContainer>
    <Button secondary onClick={action('clicked')}>
      Text only
    </Button>
    <Button secondary icon="arrow-right" onClick={action('clicked')}>
      Icon left
    </Button>
    <Button secondary iconEnd="arrow-right" onClick={action('clicked')}>
      Icon right
    </Button>
  </StoryContainer>
);

export const IconOnly: Story = () => (
  <StoryContainer gutter={20}>
    <Button iconOnly aria-label="Send" icon="send" onClick={action('clicked')} />
    <Button iconOnly aria-label="Figma" icon="figma" onClick={action('clicked')} />
    <Button iconOnly aria-label="Close" icon="close" onClick={action('clicked')} />
  </StoryContainer>
);

export const LoaderStory: Story = () => (
  <StoryContainer>
    <LoadableButton>Click to load</LoadableButton>
    <LoadableButton icon="send">Click to load</LoadableButton>
  </StoryContainer>
);

LoaderStory.storyName = 'Loader';
