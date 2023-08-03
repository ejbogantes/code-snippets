import React from 'react';
import { Story, Meta } from '@storybook/react';
import { SoomColorPicker, SoomColorPickerProps } from './soom-color-picker';

export default {
  component: SoomColorPicker,
  title: 'Components/SoomColorPicker',
} as Meta<typeof SoomColorPicker>;

const Template: Story<SoomColorPickerProps> = (args) => <SoomColorPicker {...args} />;

export const Primary = Template.bind({});
Primary.args = { label: 'Soom Color Picker' };
