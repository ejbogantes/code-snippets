/* eslint-disable @next/next/no-img-element */
/* eslint-disable dot-notation */
import styles from './soom-footer.module.scss';

import React from 'react';
import { StyledEngineProvider } from '@mui/material/styles';

import { SoomLink } from '../soom-link/soom-link';
import { SoomGdpr } from '../soom-gdpr/soom-gdpr';
import { Typography } from '@mui/material';

export interface SoomFooterLinkProps {
  label: string;
  link: string;
  target?: string;
}

export interface SoomFooterGDPRProps {
  preLinkText: string;
  posLinkText: string;
  linkText: string;
  linkUrl: string;
  acceptButtonText: string;
  declineButtonText: string;
}

export interface SoomFooterProps {
  options?: Array<SoomFooterLinkProps>;
  gdprOptions?: SoomFooterGDPRProps;
  versionLabel?: string;
}

export function SoomFooter(props: SoomFooterProps) {
  const gdprOptions = props.gdprOptions || {
    preLinkText:
      'This site uses cookies to store information on your computer. Some cookies are strictly necessary to allow this site to function. If you consent, analytics cookies will also be used to improve your user experience. Read our',
    posLinkText: 'to learn more including how you may change your settings.',
    linkText: 'privacy policy',
    linkUrl: `${process.env['SOOM_PORTAL_URL']}/privacy-policy`,
    acceptButtonText: 'I understand',
    declineButtonText: 'I decline'
  };

  return (
    <StyledEngineProvider injectFirst>
      <div className={`soom-styled-footer-container ${styles['footer__container']}`}>
        <ul className={`soom-styled-footer-options ${styles['footer__options']}`}>
          {props.options &&
            props.options.map((footerOption) => (
              <li key={footerOption.label} className={`soom-styled-footer-option ${styles['footer__option']}`}>
                <SoomLink
                  underline="none"
                  href={footerOption.link}
                  passHref={true}
                  label={footerOption.label}
                  target={footerOption.target || '_blank'}
                />
              </li>
            ))}
          <li className={`soom-styled-footer-option ${styles['footer__option']} ${styles['footer__container__logo']}`}>
            <span>Powered by</span>
            <a
              target="_blank"
              href="https://www.soom.com/"
              rel="noopener noreferrer"
              className={styles['footer__container__logo']}
            >
              <img
                src="https://assets.soom.com/soom-brandguide/soom-logo-footer.png"
                alt="Powered by Soom Inc."
                className={styles['footer__logo']}
              />
            </a>
            {props.versionLabel && (
              <Typography variant="body2" className={`soom-styled-footer-option ${styles['footer__version']}`}>
                {props.versionLabel}
              </Typography>
            )}
          </li>
        </ul>
      </div>
      <SoomGdpr acceptButtonText={gdprOptions.acceptButtonText} declineButtonText={gdprOptions.declineButtonText}>
        {gdprOptions.preLinkText}{' '}
        <a target="_blank" href={gdprOptions.linkUrl} rel="noopener noreferrer">
          {gdprOptions.linkText}
        </a>{' '}
        {gdprOptions.posLinkText}
      </SoomGdpr>
    </StyledEngineProvider>
  );
}

export default SoomFooter;
