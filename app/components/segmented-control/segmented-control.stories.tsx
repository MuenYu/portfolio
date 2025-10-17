import type { ComponentPropsWithoutRef } from 'react';
import type { Meta, StoryFn } from '@storybook/react';
import { useState } from 'react';
import { SegmentedControl, SegmentedControlOption } from '~/components/segmented-control';
import { StoryContainer } from '../../../.storybook/story-container';

type SegmentedControlProps = ComponentPropsWithoutRef<typeof SegmentedControl>;

const meta: Meta<typeof SegmentedControl> = {
  title: 'SegmentedControl',
  component: SegmentedControl,
  args: {
    label: 'Example segmented control',
  },
};

export default meta;

const options = ['Option 1', 'Option 2', 'Option 3'];

const Story: StoryFn<typeof SegmentedControl> = args => {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <StoryContainer>
      <SegmentedControl
        {...(args as SegmentedControlProps)}
        currentIndex={currentIndex}
        onChange={setCurrentIndex}
      >
        {options.map((option, index) => (
          <SegmentedControlOption key={`${option}-${index}`}>
            {option}
          </SegmentedControlOption>
        ))}
      </SegmentedControl>
    </StoryContainer>
  );
};

export const Default = Story.bind({});
