/* eslint-disable dot-notation */
import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { ModalProps } from '@mui/material/Modal';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import styles from './soom-dialog.module.scss';

export interface SoomDialogProps {
  /**
   * This field it's using for accessibility purposes. You need to add a representative text of the action.
   */
  ariaLabel: string;
  /**
   * This prop it's to add the content for the dialog
   */
  children: React.ReactNode;
  /**
   * This field it's using as a unique key to creating end-to-end testing
   */
  dataTestId: string;
  firstButton?: string;
  /**
   * This field it's to indicate if the dialog use all the screen
   */
  fullScreen?: boolean;
  /**
   * This field it's to indicate if the dialog use all the width of the screen
   */
  fullWidth?: boolean;
  handleOpenFirst?: () => void;
  handleOpenSecond?: () => void;
  handleOpenThird?: () => void;
  onClose?: ModalProps['onClose'];
  open: ModalProps['open'];
  secondButton?: string;
  thirdButton?: string;
  /**
   * This field it's using to indicate the title of the dialog
   */
  title?: string;
}

export function SoomDialog(props: SoomDialogProps) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <Dialog
      className={styles['dialog__container']}
      open={props.open}
      onClose={props.onClose}
      fullScreen={props.fullScreen}
      fullWidth={props.fullWidth}
      maxWidth={matches ? 'md' : 'lg'}
      data-test-id={props.dataTestId}
      aria-label={props.ariaLabel}
    >
      {props.title ? <DialogTitle>{props.title}</DialogTitle> : null}
      {props.children ? (
        <DialogContentText className={styles['dialog__content']}>{props.children}</DialogContentText>
      ) : null}
      {props.firstButton ? (
        <DialogActions>
          <Button onClick={props.handleOpenFirst}>{props.firstButton}</Button>
          {props.secondButton ? <Button onClick={props.handleOpenSecond}>{props.secondButton}</Button> : null}
          {props.thirdButton ? <Button onClick={props.handleOpenThird}>{props.thirdButton}</Button> : null}
        </DialogActions>
      ) : null}
    </Dialog>
  );
}

export default SoomDialog;
