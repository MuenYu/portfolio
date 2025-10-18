import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { SegmentedControl, SegmentedControlOption } from '~/components/segmented-control';
import { StoryContainer } from '../../../.storybook/story-container';

const meta = {
  title: 'SegmentedControl',
  component: SegmentedControl,
  args: {
    options: ['Option 1', 'Option 2', 'Option 3'],
    label: 'Example segmented control',
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: ({ options, ...args }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    return (
      <StoryContainer>
        <SegmentedControl
          currentIndex={currentIndex}
          onChange={setCurrentIndex}
          {...args}
        >
          {options.map((option, index) => (
            <SegmentedControlOption key={`${option}-${index}`}>
              {option}
            </SegmentedControlOption>
          ))}
        </SegmentedControl>
      </StoryContainer>
    );
  },
};
