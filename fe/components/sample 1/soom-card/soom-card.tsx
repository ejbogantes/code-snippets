/* eslint-disable dot-notation */
import React from 'react';
import Card from '@mui/material/Card';
import styles from './soom-card.module.scss';

export interface SoomCardProps {
  /**
   * This field it's using for accessibility purposes. You need to add a representative text of the action.
   */
  ariaLabel: string;
  /**
   * This prop it's to add the content for the card
   */
  children: React.ReactNode;
  /**
   * This field it's using as a unique key to creating end-to-end testing
   */
  dataTestId: string;
  /**
   * This fields indicate the maxWidth for the card
   */
  widthCard?: string;
  className?: string;
  sx?: object;
  /**
   * This fields it's using as a unique key to creating How-To checklist
   */
  howToId?: string;
}

export function SoomCard(props: SoomCardProps) {
  let sx = props.sx || {};
  if (props.widthCard) {
    sx = { ...sx, maxWidth: props.widthCard };
  }

  return (
    <Card
      className={props.className ? `${props.className} ${styles[`card__container`]}` : styles[`card__container`]}
      sx={sx}
      data-test-id={props.dataTestId}
      aria-label={props.ariaLabel}
      how-to-id={props.howToId}
    >
      {props.children}
    </Card>
  );
}
