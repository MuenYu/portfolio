import type { Meta, StoryFn } from '@storybook/react';
import { Carousel } from '~/components/carousel';
import { StoryContainer } from '../../../.storybook/story-container';

const meta: Meta<typeof Carousel> = {
  title: 'Carousel',
  component: Carousel,
};

export default meta;

const Template: StoryFn<typeof Carousel> = args => (
  <StoryContainer>
    <Carousel
      style={{ maxWidth: 800, width: '100%' }}
      placeholder="/static/highlight-banner-placeholder.jpg"
      images={[
        {
          src: '/static/highlight-banner.jpg',
          alt: 'Neon pink and blue lights',
        },
        {
          src: '/static/default-banner.jpg',
          alt: 'Geometric blue shapes',
        },
      ]}
      width={1920}
      height={1080}
      {...args}
    />
  </StoryContainer>
);

export const Images = Template.bind({});
