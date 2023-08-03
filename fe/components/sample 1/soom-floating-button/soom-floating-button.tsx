/* eslint-disable dot-notation */
import React from 'react';
import Fab from '@mui/material/Fab';
import styles from './soom-floating-button.module.scss';

export interface SoomFloatingButtonProps {
  /**
   * This field it's using for accessibility purposes. You need to add a representative text of the action.
   */
  ariaLabel: string;
  /**
   * This prop it's to add the content for the button
   */
  children: React.ReactNode;
  /**
   * This field it's using to indicate the possible color of the button
   */
  color?: 'success' | 'error' | 'info' | 'warning';
  /**
   * This field it's using as a unique key to creating end-to-end testing
   */
  dataTestId: string;
  /**
   * This field it's using to indicate if the button it's enable
   */
  disabled: boolean;
  /**
   * This prop it's using to specify the function that will be execute when you click the button
   */
  handlerOnClick: () => void;
  /**
   * This field it's to indicate the size of the button
   */
  size: 'small' | 'medium' | 'large';
  /**
   * This field it's to indicate the form of the button
   */
  variant: 'circular' | 'extended';
}

export function SoomFloatingButton(props: SoomFloatingButtonProps) {
  return (
    <Fab
      variant={props.variant}
      size={props.size}
      color={props.color}
      disabled={props.disabled}
      className={styles['floating_button__container']}
      onClick={props.handlerOnClick}
      data-test-id={props.dataTestId}
      aria-label={props.ariaLabel}
    >
      {props.children}
    </Fab>
  );
}

export default SoomFloatingButton;
