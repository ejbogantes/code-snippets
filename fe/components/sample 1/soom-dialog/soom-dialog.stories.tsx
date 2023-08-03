import React from 'react';
import { Story, Meta } from '@storybook/react';
import { SoomDialog, SoomDialogProps } from './soom-dialog';

export default {
  component: SoomDialog,
  title: 'Components/SoomDialog',
} as Meta<typeof SoomDialog>;

const Template: Story<SoomDialogProps> = (args) => <SoomDialog {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  title: 'Soom Dialog',
  children: 'Are you sure you want to approve?',
  open: true,
  firstButton: 'Approve',
  secondButton: 'Reject',
};
