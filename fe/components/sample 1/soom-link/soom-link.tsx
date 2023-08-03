/* eslint-disable dot-notation */
import React from 'react';
import Link from 'next/link';
import styles from './soom-link.module.scss';

/* eslint-disable-next-line */
export interface SoomLinkProps {
  /**
   * This field it's using for accessibility purposes. You need to add a representative text of the action.
   */
  ariaLabel?: string;
  /**
   * This prop it's to add the content for the anchor
   */
  children?: React.ReactNode;
  /**
   *
   */
  color?: string;
  /**
   * This field it's using as a unique key to creating end-to-end testing
   */
  dataTestId?: string;
  /**
   * This field it's using to indicate the URL in the anchor
   */
  href: string;
  /**
   * This field it's using to indicate the text in the anchor
   */
  label?: string;
  /**
   *
   */
  passHref?: boolean;
  /**
   * This prop it's using to indicate the target of the link
   */
  target?: string;
  /**
   * This field it's using to indicate in which moment the anchor have an underline
   */
  underline: 'none' | 'hover' | 'always';
}

export function SoomLink(props: SoomLinkProps) {
  return (
    <Link
      legacyBehavior
      className={styles['link__container']}
      color={props.color}
      href={props.href}
      data-test-id={props.dataTestId}
      aria-label={props.ariaLabel}
      passHref={props.passHref || false}>
      <a href={props.href} rel="noopener noreferrer" target={props.target}>
        {props.label}
      </a>
    </Link>
  );
}

export default SoomLink;
