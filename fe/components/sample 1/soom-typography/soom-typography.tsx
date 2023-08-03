/* eslint-disable dot-notation */
import React, { ReactNode } from 'react';
import Typography from '@mui/material/Typography';
import styles from './soom-typography.module.scss';

export interface SoomTypographyProps {
  /**
   * This field it's to indicate the align of the text
   */
  align?: 'center' | 'justify' | 'left' | 'right';
  /**
   * This field it's using for accessibility purposes. You need to add a representative text of the action.
   */
  ariaLabel?: string;
  /**
   * This field it's using to add additional classes in the component
   */
  className?: string;
  /**
   * This field is't using to indicate which component will be using to populate the text
   */
  component: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span';
  /**
   * This field it's using as a unique key to creating end-to-end testing
   */
  dataTestId?: string;
  /**
   * This field it's to indicate if the text has a space in the bottom
   */
  hasGutterBottom?: boolean;
  /**
   * This field it's to indicate if the text can wrap
   */
  hasNoWrap?: boolean;
  /**
   * This field it's to indicate if the text is a paragraph
   */
  isParagraph?: boolean;
  /**
   * This field it's suing to indicate the text
   */
  text: string | ReactNode;
  /**
   * This field it's using to indicate the behavior
   */
  variant:
    | 'body1'
    | 'body2'
    | 'button'
    | 'caption'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'inherit'
    | 'overline'
    | 'subtitle1'
    | 'subtitle2';

  bold?: boolean;
}

export function SoomTypography(props: SoomTypographyProps) {
  const className = `${props.bold ? styles['typography_bold'] : styles['typography']} ${props.className || ''}`;

  return (
    <Typography
      data-test-id={props.dataTestId}
      aria-label={props.ariaLabel}
      align={props.align}
      gutterBottom={props.hasGutterBottom}
      noWrap={props.hasNoWrap}
      paragraph={props.isParagraph}
      variant={props.variant}
      className={className}>
      {props.text}
    </Typography>
  );
}

export default SoomTypography;
