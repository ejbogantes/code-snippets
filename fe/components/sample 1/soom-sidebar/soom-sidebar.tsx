/* eslint-disable dot-notation */
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { Collapse, Divider, MenuList, Box, ListItemIcon, ListItemText, MenuItem } from '@mui/material';

import styles from './soom-sidebar.module.scss';

export interface MenuOption {
  label: string;
  url?: string;
  target?: string;
  icon?: React.ReactNode;
  howToId?: string;
}

export interface SoomSidebarProps {
  /**
   * This field it's using for accessibility purposes. You need to add a representative text of the action.
   */
  ariaLabel: string;
  /**
   * This field it's using as a unique key to creating end-to-end testing
   */
  dataTestId: string;
  /**
   * This field it's using to pass an array with the options to show in the sidebar
   */
  options: MenuOption[];
}

export function SoomSidebar(props: SoomSidebarProps) {
  const router = useRouter();
  return (
    <Box sx={{ height: 'auto' }} display="flex" flex="1">
      <Collapse orientation="horizontal" in={true} collapsedSize={50} className={styles['sidebar__container']}>
        <MenuList data-test-id={props.dataTestId} className={styles['list__container']}>
          {props.options.map((option, index) => {
            if (option.label === 'Divider') {
              return <Divider key={`sidebarOption${index}`} />;
            }

            const itemSelected = router.asPath === option.url;
            return (
              <Link
                key={`sidebarOption${index}`}
                href={option.url || '#'}
                target={option.target || '_self'}
                how-to-id={option.howToId}
                passHref
              >
                <MenuItem selected={itemSelected} sx={{ py: 1.2 }}>
                  <ListItemIcon>{option.icon}</ListItemIcon>
                  <ListItemText aria-label={option.label}>{option.label}</ListItemText>
                </MenuItem>
              </Link>
            );
          })}
        </MenuList>
      </Collapse>
    </Box>
  );
}

export default SoomSidebar;
