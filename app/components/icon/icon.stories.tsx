import type { ComponentProps } from 'react';
import { Icon } from '~/components/icon';
import manifest from '~/components/icon/manifest.json';
import { StoryContainer } from '../../../.storybook/story-container';

type IconProps = ComponentProps<typeof Icon>;

interface IconStory {
  render: () => JSX.Element;
  args?: Partial<IconProps>;
}

const meta = {
  title: 'Icon',
  component: Icon,
} satisfies { title: string; component: typeof Icon };

export default meta;

export const Icons: IconStory = {
  render: () => (
    <StoryContainer>
      {Object.keys(manifest).map(key => (
        <Icon key={key} icon={key} />
      ))}
    </StoryContainer>
  ),
};
