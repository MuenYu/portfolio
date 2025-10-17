import type { Meta, StoryFn } from '@storybook/react';
import { Image } from '~/components/image';
import type { ImageProps } from '~/components/image';
import { StoryContainer } from '../../../.storybook/story-container';

const meta: Meta<typeof Image> = {
  title: 'Image',
  component: Image,
};

export default meta;

const imageData: ImageProps = {
  alt: 'An abstract purple and pink neon thing',
  src: '/static/highlight-banner.jpg',
  width: 960,
  height: 540,
  placeholder: '/static/highlight-banner-placeholder.jpg',
};

const Story: StoryFn<typeof Image> = args => (
  <StoryContainer>
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0px, 960px)' }}>
      <Image alt="An abstract purple and pink neon thing" {...imageData} {...args} />
    </div>
  </StoryContainer>
);

export const Default = Story.bind({});

Default.args = {
  ...imageData,
};

export const Reveal = Story.bind({});

Reveal.args = {
  ...imageData,
  reveal: true,
};
