import React from 'react';
import { Story, Meta } from '@storybook/react';
import { SoomFloatingButton, SoomFloatingButtonProps } from './soom-floating-button';

export default {
  component: SoomFloatingButton,
  title: 'Components/SoomFloatingButton',
} as Meta<typeof SoomFloatingButton>;

const Template: Story<SoomFloatingButtonProps> = (args) => <SoomFloatingButton {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  variant: 'extended',
  handlerOnClick: () => {
    alert('Put here the function');
  },
  children: "I'm a floating button",
};
