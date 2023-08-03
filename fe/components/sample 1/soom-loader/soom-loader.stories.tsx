import React from 'react';
import { Story, Meta } from '@storybook/react';
import { SoomLoader, SoomLoaderProps } from './soom-loader';

export default {
  component: SoomLoader,
  title: 'Components/SoomLoader',
} as Meta<typeof SoomLoader>;

const Template: Story<SoomLoaderProps> = (args) => <SoomLoader {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  type: 'circular',
};
