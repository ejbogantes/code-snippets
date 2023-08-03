/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';
import Link from 'next/link';

import { AppBar, Box, Container, IconButton, Toolbar, Typography, Menu, MenuItem, Fade, Divider } from '@mui/material';

import { StyledEngineProvider } from '@mui/material/styles';

import AccountBoxIcon from '@mui/icons-material/AccountBox';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

import styles from './soom-navbar.module.scss';

import Image from 'next/image';

// TODO Add props to change the background color and font
export interface SoomNavbarProps {
  title?: string | '';
  profile?: string | '';
  profileTarget?: string | '_self' | '_blank';
  logoUrl?: string | '/';
  logOutUrl?: string | '/api/auth/logout';
  userName?: string;
  userRole?: string;
  userOrg?: string;
  userAccessOrgs?: any[];
  businessUnitLabel?: string;
}

const OrganizationDropdown = (props: any) => {
  const { userAccessOrgs, userOrg, OrgsIcon, anchorOrgsEl, orgsOpen, handleOrgsClick, handleOrgsClose } = props;

  if (userAccessOrgs.length <= 0) {
    return (
      <div style={{ display: 'inline-flex' }}>
        <IconButton id="organizations-button" sx={{ height: '100%', borderRadius: 0 }} disabled>
          <Typography variant="body1" component="h1" className={styles['navbar--label']}>
            <CorporateFareIcon fontSize="small" className={styles['user-icon']} sx={{ verticalAlign: 'text-bottom' }} />{' '}
            {props.userOrg}
          </Typography>
        </IconButton>
      </div>
    );
  }

  return (
    <div style={{ display: 'inline-flex' }}>
      <IconButton
        id="organizations-button"
        aria-controls={orgsOpen ? 'profile-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={orgsOpen ? 'true' : undefined}
        onClick={handleOrgsClick}
        sx={{ height: '100%', borderRadius: 0 }}
      >
        <Typography variant="body1" component="h1" className={styles['navbar--label']}>
          <CorporateFareIcon fontSize="small" className={styles['user-icon']} sx={{ verticalAlign: 'text-bottom' }} />{' '}
          {userOrg} <OrgsIcon fontSize="small" className={styles['user-icon']} sx={{ verticalAlign: 'text-bottom' }} />
        </Typography>
      </IconButton>
      <Menu
        id="organizations-menu"
        MenuListProps={{
          'aria-labelledby': 'organizations-button'
        }}
        anchorEl={anchorOrgsEl}
        open={orgsOpen}
        TransitionComponent={Fade}
        onClose={handleOrgsClose}
      >
        {userAccessOrgs.map((orgProfile: any, i: number) => {
          return (
            <div key={`accessOrg${i}`}>
              {i !== 0 && <Divider sx={{ m: '0 !important' }} />}
              <Link
                href={`${orgProfile.configuration.license.app.admin_url}?verifyAuth=${orgProfile.organization.slug}`}
                passHref
              >
                <MenuItem onClick={handleOrgsClose}>{orgProfile.organization.name}</MenuItem>
              </Link>
            </div>
          );
        })}
      </Menu>
    </div>
  );
};

export function SoomNavbar(props: SoomNavbarProps) {
  const userAccessOrgs = props.userAccessOrgs || [];

  const [anchorOrgsEl, setAnchorOrgsEl] = useState<null | HTMLElement>(null);
  const orgsOpen = Boolean(anchorOrgsEl);
  const OrgsIcon = orgsOpen ? KeyboardArrowUpIcon : KeyboardArrowDownIcon;
  const [anchorMenuEl, setAnchorMenuEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorMenuEl);

  const handleOrgsClick = (event: React.MouseEvent<HTMLElement>) => {
    if (orgsOpen) {
      setAnchorOrgsEl(null);
    } else {
      setAnchorOrgsEl(event.currentTarget);
    }
  };
  const handleOrgsClose = () => {
    setAnchorOrgsEl(null);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    if (menuOpen) {
      setAnchorMenuEl(null);
    } else {
      setAnchorMenuEl(event.currentTarget);
    }
  };
  const handleMenuClose = () => {
    setAnchorMenuEl(null);
  };

  // logo loader
  const src = `https://assets.soom.com/soom-brandguide/wordmark_soom_mikado.png`;

  return (
    <StyledEngineProvider injectFirst>
      <AppBar position="static" data-test-id="navbar-portal" className={styles['navbar--background']}>
        <Container maxWidth={false}>
          <Toolbar disableGutters>
            <a href={props.logoUrl}>
              <Image
                unoptimized
                loader={() => src}
                src={src}
                alt="Soom, Inc Logo"
                width={250}
                height={100}
                className={styles['navbar--icon']}
              />
            </a>
            <Typography variant="h6" component="h1" ml={5} className={styles['navbar--title']}>
              {props.title}
            </Typography>
            <Box sx={{ flexGrow: 1, display: { xs: 'flex' }, justifyContent: 'flex-end' }}>
              {props.userOrg && (
                <OrganizationDropdown
                  userAccessOrgs={userAccessOrgs}
                  userOrg={props.userOrg}
                  OrgsIcon={OrgsIcon}
                  anchorOrgsEl={anchorOrgsEl}
                  orgsOpen={orgsOpen}
                  handleOrgsClick={handleOrgsClick}
                  handleOrgsClose={handleOrgsClose}
                />
              )}

              <div>
                <IconButton
                  id="profile-button"
                  data-test-id="btnProfileMenu"
                  aria-controls={menuOpen ? 'profile-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={menuOpen ? 'true' : undefined}
                  onClick={handleMenuClick}
                >
                  <AccountCircleIcon fontSize="medium" className={styles['user-icon']} />
                </IconButton>
                <Menu
                  id="profile-menu"
                  MenuListProps={{
                    'aria-labelledby': 'profile-button'
                  }}
                  anchorEl={anchorMenuEl}
                  open={menuOpen}
                  onClose={handleMenuClose}
                  TransitionComponent={Fade}
                >
                  <Link href={props.profile || '/profile'} passHref>
                    <MenuItem onClick={handleMenuClose} title="Name" data-test-id="mnoProfile">
                      <AccountBoxIcon sx={{ mr: 1, verticalAlign: 'bottom' }} /> {props.userName}{' '}
                      {props.userRole && <small>({props.userRole})</small>}
                    </MenuItem>
                  </Link>
                  {props.businessUnitLabel && <Divider sx={{ m: '0 !important' }} />}
                  {props.businessUnitLabel && (
                    <MenuItem onClick={handleMenuClose} data-test-id="mnoBusinessUnit">
                      <BusinessCenterIcon sx={{ mr: 1, verticalAlign: 'bottom' }} /> {props.businessUnitLabel}
                    </MenuItem>
                  )}
                  <Divider sx={{ m: '0 !important' }} />
                  <Link href={props.logOutUrl || '/api/auth/logout?m=true'}>
                    <MenuItem onClick={handleMenuClose} data-test-id="mnoLogout">
                      <ExitToAppIcon sx={{ mr: 1, verticalAlign: 'bottom' }} /> Logout
                    </MenuItem>
                  </Link>
                </Menu>
              </div>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </StyledEngineProvider>
  );
}

export default SoomNavbar;
