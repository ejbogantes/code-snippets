import React from 'react';
import { Story, Meta } from '@storybook/react';
import { SoomNavbar, SoomNavbarProps } from './soom-navbar';

export default {
  component: SoomNavbar,
  title: 'Components/SoomNavbar',
} as Meta<typeof SoomNavbar>;

const Template: Story<SoomNavbarProps> = (args) => <SoomNavbar {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
