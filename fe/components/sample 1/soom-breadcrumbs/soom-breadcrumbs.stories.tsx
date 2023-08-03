import React from 'react';
import { Story, Meta } from '@storybook/react';
import { SoomBreadcrumbs, SoomBreadcrumbsProps } from './soom-breadcrumbs';
import { SoomLink } from '../soom-link/soom-link';

export default {
  component: SoomBreadcrumbs,
  title: 'Components/SoomBreadcrumbs',
} as Meta<typeof SoomBreadcrumbs>;

const Template: Story<SoomBreadcrumbsProps> = (args) => <SoomBreadcrumbs {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  separator: '>',
  children: [
    <SoomLink
      underline="hover"
      color="inherit"
      href="product-search"
      dataTestId="1"
      ariaLabel="Product Search Button"
      key="product-search-button"
      label="Product Search"
    ></SoomLink>,
    <SoomLink
      underline="hover"
      color="inherit"
      href="item-1"
      dataTestId="2"
      ariaLabel="Item 1 Button"
      key="item-1-button"
      label=" Item 1"
    ></SoomLink>,
  ],
};
