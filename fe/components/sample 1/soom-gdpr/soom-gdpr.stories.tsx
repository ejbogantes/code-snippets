import React from 'react';
import { Story, Meta } from '@storybook/react';
import { SoomGdpr, SoomGdprProps } from './soom-gdpr';

export default {
  component: SoomGdpr,
  title: 'Components/SoomGdpr',
} as Meta<typeof SoomGdpr>;

const Template: Story<SoomGdprProps> = (args) => <SoomGdpr {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  children: 'This website uses cookies to enhance the user experience.',
};
