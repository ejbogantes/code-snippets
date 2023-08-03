/* eslint-disable react/prop-types */
/* eslint-disable dot-notation */
import React from 'react';
import CardMedia from '@mui/material/CardMedia';
import styles from './soom-card-media.module.scss';

export interface SoomCardMediaProps {
  /**
   * This field it's using for accessibility purposes. You need to add a representative text of the action.
   */
  ariaLabel?: string;
  /**
   * This field it's using as a unique key to creating end-to-end testing
   */
  dataTestId?: string;
}

export const SoomCardMedia = ({ children }: { children: any }, props: SoomCardMediaProps) => {
  return (
    <CardMedia
      className={styles['card__media']}
      data-test-id={props.dataTestId || ''}
      aria-label={props.ariaLabel || ''}
    >
      {children}
    </CardMedia>
  );
};

export default SoomCardMedia;
