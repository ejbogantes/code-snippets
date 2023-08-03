import React from 'react';
import { Story, Meta } from '@storybook/react';
import { SoomSidebar, SoomSidebarProps } from './soom-sidebar';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HelpIcon from '@mui/icons-material/Help';

export default {
  component: SoomSidebar,
  title: 'Components/SoomSidebar',
} as Meta<typeof SoomSidebar>;

const Template: Story<SoomSidebarProps> = (args) => <SoomSidebar {...args} />;

export const Primary = Template.bind({});

Primary.args = {
  options: [
    {
      label: 'New Document',
      url: '/docs/new',
      target: '_self',
      icon: <AddCircleIcon />,
    },
    {
      label: 'Multiple Documents',
      url: '/docs/bulk',
      target: '_self',
      icon: <LibraryAddIcon />,
    },
    {
      label: 'Divider',
      url: '',
      target: '',
      // eslint-disable-next-line react/jsx-no-useless-fragment
      icon: <></>,
    },
    {
      label: 'eiFU Web App',
      url: 'https://dev.eifu.io',
      target: '_blank',
      icon: <OpenInNewIcon />,
    },
    {
      label: 'Soom Portal',
      url: 'https://dev.soomportal.io',
      target: '_blank',
      icon: <DashboardIcon />,
    },
    {
      label: 'User manual',
      url: '/manual',
      target: '_self',
      icon: <HelpIcon />,
    },
  ],
};
