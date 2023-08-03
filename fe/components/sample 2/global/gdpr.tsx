import * as React from 'react';
import CookieConsent from 'react-cookie-consent';
import { Button, Typography, Link } from '@mui/material';

export default function GDPR() {
  return (
    <CookieConsent
      // debug
      expires={30} /* a month */
      location="bottom"
      style={{ background: '#444444' }}
      ButtonComponent={Button}
      disableButtonStyles
      enableDeclineButton
      buttonText="I understand"
      customButtonProps={{ variant: 'contained', color: 'secondary', sx: { my: 1, mx: 2 } }}
      declineButtonText="I decline"
      customDeclineButtonProps={{ variant: 'contained', color: 'inherit', sx: { my: 1, mx: 2, color: '#000000' } }}>
      <Typography>
        This site uses cookies to store information on your computer. Some cookies are strictly necessary to allow this
        site to function. If you consent, analytics cookies will also be used to improve your user experience. Read our{' '}
        <Link color="secondary" href="/privacy-policy" target="_blank" rel="noopener">
          Soom Privacy Policy
        </Link>{' '}
        to learn more including how you may change your settings.
      </Typography>
    </CookieConsent>
  );
}
