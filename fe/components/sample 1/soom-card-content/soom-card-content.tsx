/* eslint-disable react/prop-types */
import React from 'react';
import CardContent from '@mui/material/CardContent';
// import styles from './soom-card-content.module.scss';

export interface SoomCardContentProps {
  /**
   * This field it's using for accessibility purposes. You need to add a representative text of the action.
   */
  ariaLabel?: string;
  /**
   * This prop it's to add the content for the content card section
   */
  children?: React.ReactNode;
  /**
   * This field it's using as a unique key to creating end-to-end testing
   */
  dataTestId?: string;
  /**
   * This field it's using to pass class names to card content
   */
  className?: string;
}

export const SoomCardContent = (props: SoomCardContentProps) => {
  return (
    <CardContent data-test-id={props.dataTestId || ''} aria-label={props.ariaLabel || ''} className={props.className}>
      {props.children}
    </CardContent>
  );
};

export default SoomCardContent;
