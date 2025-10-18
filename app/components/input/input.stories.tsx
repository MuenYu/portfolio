import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from '~/components/input';
import { useFormInput } from '~/hooks';

const meta = {
  title: 'Input',
  component: Input,
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

const Template: Story['render'] = args => {
  const exampleValue = useFormInput('');

  return (
    <div style={{ maxWidth: 400, width: '100%', padding: 30 }}>
      <Input {...exampleValue} {...args} />
    </div>
  );
};

export const Text: Story = {
  render: Template,
  args: {
    label: 'Your name',
    type: 'text',
  },
};

export const Multiline: Story = {
  render: Template,
  args: {
    label: 'Type a message',
    type: 'text',
    multiline: true,
  },
};
