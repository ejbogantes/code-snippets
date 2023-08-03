import React from 'react';
import { Story, Meta } from '@storybook/react';
import { SoomTypography, SoomTypographyProps } from './soom-typography';

export default {
  component: SoomTypography,
  title: 'Components/SoomTypography',
} as Meta<typeof SoomTypography>;

const Template: Story<SoomTypographyProps> = (args) => <SoomTypography {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  text: 'This is a typography',
  dataTestId: 'txt-header',
  ariaLabel: 'Soom typography',
  align: 'center',
  hasGutterBottom: true,
  hasNoWrap: true,
  isParagraph: true,
  variant: 'h1',
  component: 'h1',
};
