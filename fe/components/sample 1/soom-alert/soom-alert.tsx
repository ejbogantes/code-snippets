/* eslint-disable dot-notation */
import React from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import styles from './soom-alert.module.scss';

/* eslint-disable-next-line */
export interface SoomAlertProps {
  /**
   *
   */
  action?: React.ReactNode;
  /**
   * This prop it's using for accessibility purposes. You need to add a representative text of the action.
   */
  ariaLabel?: string;
  /**
   * This prop it's to add the content for the alert
   */
  children?: React.ReactNode;
  /**
   * This prop it's using as a unique key to creating end-to-end testing
   */
  dataTestId?: string;
  /**
   * This prop it's using to use a specific icon in the alert
   */
  icon?: React.ReactNode;
  /**
   * This prop it's a function to close the alert
   */
  onClose?: () => void;
  /**
   * This prop it's using to choose the severity od the alert
   */
  severity?: 'error' | 'warning' | 'info' | 'success';
  /**
   * This props it's to indicate the title of the alert
   */
  title?: string;
  variant?: 'standard' | 'filled' | 'outlined';
  sx?: object;
}

export function SoomAlert(props: SoomAlertProps) {
  return (
    <Alert
      severity={props.severity}
      onClose={props.onClose}
      action={props.action}
      icon={props.icon}
      variant={props.variant}
      className={styles['alert__container']}
      data-test-id={props.dataTestId}
      aria-label={props.ariaLabel}
      sx={props.sx}
    >
      {props.title ? <AlertTitle>{props.title}</AlertTitle> : null}
      {props.children}
    </Alert>
  );
}

export default SoomAlert;
