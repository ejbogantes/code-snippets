import React from 'react';
import { Story, Meta } from '@storybook/react';
import { SoomAlert, SoomAlertProps } from './soom-alert';

export default {
  component: SoomAlert,
  title: 'Components/SoomAlert',
} as Meta<typeof SoomAlert>;

const Template: Story<SoomAlertProps> = (args) => <SoomAlert {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  title: 'Alert Title',
  children: "I'm an alert",
};
