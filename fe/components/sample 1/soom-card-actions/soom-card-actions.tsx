/* eslint-disable react/prop-types */
import React from 'react';
import CardActions from '@mui/material/CardActions';
// import styles from './soom-card-actions.module.scss';
export interface SoomCardActionsProps {
  /**
   * This field it's using for accessibility purposes. You need to add a representative text of the action.
   */
  ariaLabel?: string;
  /**
   * This prop it's to add the content for the card actions section
   */
  children?: React.ReactNode;
  /**
   * This field it's using as a unique key to creating end-to-end testing
   */
  dataTestId?: string;
}

export const SoomCardActions = (props: SoomCardActionsProps) => {
  return (
    <CardActions data-test-id={props.dataTestId || ''} aria-label={props.ariaLabel || ''}>
      {props.children}
    </CardActions>
  );
};

export default SoomCardActions;
