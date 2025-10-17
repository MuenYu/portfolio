import type { Meta, StoryFn } from '@storybook/react';
import { List } from '~/components/list';
import { StoryContainer } from '../../../.storybook/story-container';
import { ListItem } from './list';

const meta: Meta<typeof List> = {
  title: 'List',
  component: List,
};

export default meta;

type Story = StoryFn<typeof List>;

const Template: Story = args => (
  <StoryContainer>
    <List {...args}>
      <ListItem>List item 1</ListItem>
      <ListItem>List item 2</ListItem>
      <ListItem>List item 3</ListItem>
    </List>
  </StoryContainer>
);

export const Unordered = Template.bind({});

Unordered.args = {
  ordered: false,
};

export const Ordered = Template.bind({});

Ordered.args = {
  ordered: true,
};
