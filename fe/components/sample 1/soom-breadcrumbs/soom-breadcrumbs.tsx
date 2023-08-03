/* eslint-disable dot-notation */
import React from 'react';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import styles from './soom-breadcrumbs.module.scss';

/* eslint-disable-next-line */
export interface SoomBreadcrumbsProps {
  children: React.ReactNode;
  separator: string;
  dataTestId: string;
  handlerOnClick: () => void;
  ariaLabel: string;
}

export function SoomBreadcrumbs(props: SoomBreadcrumbsProps) {
  return (
    <Breadcrumbs
      separator={props.separator}
      className={styles['breadcrumbs__container']}
      onClick={props.handlerOnClick}
      data-test-id={props.dataTestId}
      aria-label={props.ariaLabel}
    >
      {props.children}
    </Breadcrumbs>
  );
}

export default SoomBreadcrumbs;
