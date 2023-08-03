/* eslint-disable @next/next/no-img-element */
/* eslint-disable dot-notation */
import CookieConsent from 'react-cookie-consent';
import Button from '@mui/material/Button';

import styles from './soom-gdpr.module.scss';

export interface SoomGdprProps {
  /**
   * This prop it's using for display the component ignoring cookie functionality
   */
  debug?: boolean;
  /**
   * This prop it's using for change the accept button text
   */
  acceptButtonText?: string;
  /**
   * This prop it's using for change the decline button text
   */
  declineButtonText?: string;
  /**
   * This prop it's to add the content for the card
   */
  children: React.ReactNode;
}

export function SoomGdpr(props: SoomGdprProps) {
  return (
    <div>
      <CookieConsent
        debug={props.debug || false}
        expires={30} /* a month */
        location="bottom"
        containerClasses={`soom-styled-gdpr-container ${styles['gdpr__container']}`}
        ButtonComponent={Button}
        disableButtonStyles
        enableDeclineButton
        buttonText={props.acceptButtonText || `I understand`}
        customButtonProps={{ variant: 'contained', color: 'primary', sx: { my: 1, mx: 2 } }}
        buttonClasses={`soom-styled-gdpr-accept-btn ${styles['gdpr__button__accept']}`}
        declineButtonText={props.declineButtonText || `I decline`}
        customDeclineButtonProps={{ variant: 'contained', color: 'primary', sx: { my: 1, mx: 2 } }}
        declineButtonClasses={`soom-styled-gdpr-decline-btn ${styles['gdpr__button__decline']}`}
      >
        {props.children}
      </CookieConsent>
    </div>
  );
}

export default SoomGdpr;
