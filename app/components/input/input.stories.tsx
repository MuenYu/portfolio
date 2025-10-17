import type { ComponentPropsWithoutRef } from 'react';
import type { Meta, StoryFn } from '@storybook/react';
import { Input } from '~/components/input';
import { useFormInput } from '~/hooks';

type InputStoryProps = ComponentPropsWithoutRef<typeof Input>;

const meta: Meta<typeof Input> = {
  title: 'Input',
  component: Input,
};

export default meta;

const Story: StoryFn<typeof Input> = args => {
  const exampleValue = useFormInput('');
  return (
    <div style={{ maxWidth: 400, width: '100%', padding: 30 }}>
      <Input {...exampleValue} {...args} />
    </div>
  );
};

export const Text = Story.bind({});

Text.args = {
  label: 'Your name',
  type: 'text',
} satisfies Partial<InputStoryProps>;

export const Multiline = Story.bind({});

Multiline.args = {
  label: 'Type a message',
  type: 'text',
  multiline: true,
} satisfies Partial<InputStoryProps>;
