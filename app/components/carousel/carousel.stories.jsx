import { Carousel } from '~/components/carousel';
import { StoryContainer } from '../../../.storybook/story-container';

export default {
  title: 'Carousel',
};

export const Images = () => (
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
    />
  </StoryContainer>
);
