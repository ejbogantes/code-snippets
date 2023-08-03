import React from 'react';
import { Story, Meta } from '@storybook/react';
import { SoomFooter, SoomFooterProps } from './soom-footer';

export default {
  component: SoomFooter,
  title: 'Components/SoomFooter',
} as Meta<typeof SoomFooter>;

const Template: Story<SoomFooterProps> = (args) => <SoomFooter {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
