import React from 'react';
import { Story, Meta } from '@storybook/react';
import { SoomButton, SoomButtonProps } from './soom-button';

export default {
  component: SoomButton,
  title: 'Components/SoomButton',
} as Meta<typeof SoomButton>;

const Template: Story<SoomButtonProps> = (args) => <SoomButton {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  label: 'Im a button',
  variant: 'contained',
  handlerOnClick: () => {
    alert('Put here the function');
  },
};
