import React from 'react';
import { Story, Meta } from '@storybook/react';
import { SoomLink, SoomLinkProps } from './soom-link';

export default {
  component: SoomLink,
  title: 'Components/SoomLink',
} as Meta<typeof SoomLink>;

const Template: Story<SoomLinkProps> = (args) => <SoomLink {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  children: 'Im a link',
  underline: 'hover',
  href: 'https://soom.com',
};
