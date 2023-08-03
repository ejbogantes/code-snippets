import React from 'react';
import { Story, Meta } from '@storybook/react';
import { SoomTextField, SoomTextFieldProps } from './soom-text-field';

export default {
  component: SoomTextField,
  title: 'Components/SoomTextField',
} as Meta<typeof SoomTextField>;

const Template: Story<SoomTextFieldProps> = (args) => <SoomTextField {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  label: 'Text Field',
  placeholder: "I'm a placeholder",
  handlerOnClick: () => {
    alert('Put here the function');
  },
};
