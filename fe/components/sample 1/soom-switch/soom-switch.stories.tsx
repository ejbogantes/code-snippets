import React from 'react';
import { Story, Meta } from '@storybook/react';
import { SoomSwitch, SoomSwitchProps } from './soom-switch';

export default {
  component: SoomSwitch,
  title: 'Components/SoomSwitch',
} as Meta<typeof SoomSwitch>;

const Template: Story<SoomSwitchProps> = (args) => <SoomSwitch {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  dataTestId: 'string',
  ariaLabel: 'string',
  color: 'primary',
  isChecked: false,
  name: 'string',
  label: 'Active',
  disabled: false,
};
