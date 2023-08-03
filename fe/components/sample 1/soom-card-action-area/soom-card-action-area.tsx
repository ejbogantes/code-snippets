import React from 'react';
import CardActionArea from '@mui/material/CardActionArea';
// import styles from './soom-card-action-area.module.scss';

/* eslint-disable-next-line */
export interface SoomCardActionAreaProps {
  /**
   * This field it's using for accessibility purposes. You need to add a representative text of the action.
   */
  ariaLabel: string;
  /**
   * This prop it's to add the content for the card action area section
   */
  children: React.ReactNode;
  /**
   * This field it's using as a unique key to creating end-to-end testing
   */
  dataTestId: string;
  /**
   *
   */
  handlerOnClick: React.MouseEventHandler<HTMLElement>;
}

export const SoomCardActionArea = (props: SoomCardActionAreaProps) => {
  return (
    <CardActionArea
      data-test-id={props.dataTestId}
      aria-label={props.ariaLabel}
      onClick={props.handlerOnClick}
    >
      {props.children}
    </CardActionArea>
  );
};

export default SoomCardActionArea;
