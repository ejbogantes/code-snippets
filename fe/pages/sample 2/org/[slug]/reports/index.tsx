/* eslint-disable react-hooks/exhaustive-deps */
import { withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import React, { useState, useEffect } from 'react';
import md5 from 'crypto-js/md5';
import { get as _get } from 'lodash';

// next.js stuff
import { useRouter } from 'next/router';
import getConfig from 'next/config';

// steps, page wrapper
import PageWrapper from '../../../../wrappers/pageWrapper';

// material ui stuff
import {
  Box,
  Divider,
  Grid,
  Stack,
  Typography,
  ListSubheader,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { Article, Download as DownloadIcon } from '@mui/icons-material';

import { SoomCard } from '@soom-universe/soom-ui';

// styling
import styles from './index.module.scss';

// helpers
import { requestGetProfileByEmailOrg, requestGetSettings } from '../../../../helpers/request';
import { hasAccess } from '../../../../helpers/PermissionValidator';

// get public runtime settings
const {
  publicRuntimeConfig: { appName }
} = getConfig();

// opens url in a new tab
const openInNewTab = (url) => {
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
  if (newWindow) newWindow.opener = null;
};

export default withPageAuthRequired(function Index({ user }) {
  // hooks
  const router = useRouter();

  const [orgSlug, setOrgSlug] = useState<string>(undefined);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profile, setProfile] = useState(undefined);
  const [pageAccess, setPageAccess] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [config, setConfig] = useState(undefined);
  const [signature, setSignature] = useState(undefined);

  useEffect(() => {
    if (!router.isReady) return;
    const orgParam = router.query.slug as string;
    setOrgSlug(orgParam);
  }, [router.isReady]);

  useEffect(() => {
    if (!orgSlug) return;
    // load profile
    const fetchProfileData = async () => {
      const profileData = await requestGetProfileByEmailOrg(appName, orgSlug);
      const pageAccess = hasAccess('reports', profileData);
      setProfile(profileData);
      setPageAccess(pageAccess);
      setLoadingProfile(false);
    };

    fetchProfileData();
  }, [orgSlug]);

  useEffect(() => {
    if (!profile || !pageAccess) return;
    // load license config
    const fetchConfigData = async () => {
      const configData = await requestGetSettings(appName, orgSlug);
      setConfig(configData);
      setLoadingConfig(false);
      setSignature(md5(`${configData.manufacturer}+${process.env.ENCRYPTION_KEY}`).toString());
    };

    fetchConfigData();
  }, [profile, pageAccess]);

  return (
    <PageWrapper
      org={orgSlug}
      profile={profile}
      loading={loadingProfile || (pageAccess && loadingConfig)}
      pageAccess={pageAccess}
    >
      <Box className={styles.form__container}>
        <SoomCard dataTestId="prueba" ariaLabel="prueba">
          <Stack direction="row" justifyContent="flex-start" alignItems="flex-start" spacing={1} sx={{ p: 2 }}>
            <Typography variant="h6" component="div">
              <Article sx={{ verticalAlign: 'middle' }} /> Reports
            </Typography>
          </Stack>
          <Divider className={styles.divider__header} />
          <Grid xs={4} style={{ paddingLeft: 30, paddingBottom: 50 }}>
            <List
              sx={{ width: '50%', bgcolor: 'background.paper' }}
              component="nav"
              aria-labelledby="nested-list-subheader"
              subheader={
                <ListSubheader component="div" id="nested-list-subheader">
                  Validation templates
                </ListSubheader>
              }
            >
              <ListItemButton
                onClick={async () => {
                  openInNewTab(
                    `/api/reports/iq?slug=${orgSlug}&cl=${config.manufacturer}&admin=/org/${orgSlug}&cfs=${_get(
                      profile,
                      'domains.production',
                      '/'
                    )}&checksum=${signature}`
                  );
                }}
              >
                <ListItemIcon>
                  <DownloadIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Installation Qualification (IQ) Report"
                  secondary="This is a report for the installation of Soom’s eIFU system.  It includes the details of the system description, installation test protocol and installation conclusion for the Soom eIFU system."
                />
              </ListItemButton>
              <ListItemButton
                onClick={async () => {
                  openInNewTab(
                    `/api/reports/oq?slug=${orgSlug}&cl=${config.manufacturer}&admin=/org/${orgSlug}&cfs=${_get(
                      profile,
                      'domains.production',
                      '/'
                    )}&checksum=${signature}`
                  );
                }}
              >
                <ListItemIcon>
                  <DownloadIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Operational Qualification (OQ) Report"
                  secondary="This is a report to determine that Soom’s eIFU system functions are intended. It includes the environment, devices, and web browsers that were used for testing the Soom eIFU system."
                />
              </ListItemButton>
            </List>
          </Grid>
        </SoomCard>
      </Box>
    </PageWrapper>
  );
});
