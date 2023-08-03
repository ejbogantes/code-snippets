import React from 'react';
import { Story, Meta } from '@storybook/react';
import { SoomCheckbox, SoomCheckboxProps } from './soom-checkbox';

export default {
  component: SoomCheckbox,
  title: 'Components/SoomCheckbox',
} as Meta<typeof SoomCheckbox>;

const Template: Story<SoomCheckboxProps> = (args) => <SoomCheckbox {...args} />;

export const Primary = Template.bind({});
Primary.args = { label: 'Soom Checkbox' };
