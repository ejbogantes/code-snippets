import React from 'react';
import { Story, Meta } from '@storybook/react';
import { SoomSelect, SoomSelectProps } from './soom-select';

export default {
  component: SoomSelect,
  // decorators: [withFormik],
  title: 'Components/SoomSelect',
} as Meta<typeof SoomSelect>;

const Template: Story<SoomSelectProps> = (args) => <SoomSelect {...args} />;

export const MultiSelect = Template.bind({});
MultiSelect.args = {
  dataTestId: 'string',
  ariaLabel: 'string',
  options: [
    { value: 'usa', label: 'USA' },
    { value: 'costarica', label: 'Costa Rica' },
    { value: 'france', label: 'France' },
    { value: 'germany', label: 'Germany' },
  ],
  isMultiple: true,
  id: 'cboCountries',
  name: 'cboCountries',
  label: 'Select a country',
  labelId: 'cboCountriesLabel',
  error: false,
  textError: 'Please select a country',
};

export const Select = Template.bind({});
Select.args = {
  dataTestId: 'string',
  ariaLabel: 'string',
  options: [
    { value: 'usa', label: 'USA' },
    { value: 'costarica', label: 'Costa Rica' },
    { value: 'france', label: 'France' },
    { value: 'germany', label: 'Germany' },
  ],
  isMultiple: false,
  id: 'cboCountries',
  name: 'cboCountries',
  label: 'Select a country',
  labelId: 'cboCountriesLabel',
  error: false,
  textError: 'Please select a country',
};
