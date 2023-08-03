import React from 'react';
import { Story, Meta } from '@storybook/react';
import { SoomSearch, SoomSearchProps } from './soom-search';

export default {
  component: SoomSearch,
  title: 'Components/SoomSearch',
} as Meta<typeof SoomSearch>;

const Template: Story<SoomSearchProps> = (args) => <SoomSearch {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  searchIcon: true,
  width: '600px',
  fullWidth: true,
  freeSolo: true,
  blurOnSelect: true,
  autoComplete: true,
  loading: true,
  size: 'medium',
  placeholder: 'Product code, CFN, GTIN, manufacturer, product name',
  options: ['Soom CFN', '01234567891234', 'Soom Manufacturer', 'Soom Product'],
  variant: 'standard',
  searchButtonColor: 'primary',
  searchButtonVariant: 'contained',
};
