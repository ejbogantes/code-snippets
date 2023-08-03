/* eslint-disable camelcase */
/* eslint-disable react-hooks/exhaustive-deps */
import styles from './index.module.scss';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import getConfig from 'next/config';
import { withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import { get as _get } from 'lodash';

// material ui components
import { Box } from '@mui/material';

// required styles and soom-ui
import { SoomCard } from '@soom-universe/soom-ui';

import PageWrapper from '../../wrappers/pageWrapper';

// helpers
import { requestGetProfileByEmailOrg } from '../../helpers/request';
import { Permissions, hasPermission, hasAccess } from '../../helpers/PermissionValidator';

// get dynamic components
const DynamicGrid = dynamic(() => import('../../components/org/slug/WrappedDataGrid'));

// get public runtime settings
const {
  publicRuntimeConfig: { appName }
} = getConfig();

// index page component
export default withPageAuthRequired(function Index({ user }): JSX.Element {
  // hooks
  const router = useRouter();

  const [org, setOrg] = useState(undefined);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profile, setProfile] = useState({ organizationProfiles: [] });
  const [pageAccess, setPageAccess] = useState(false);

  // multi dashboard
  const [BUState, setBUState] = useState({ show: false, options: [] });

  useEffect(() => {
    if (!router.isReady) return;
    const orgName = router.query.slug as string;
    setOrg(orgName);
  }, [router.isReady]);

  useEffect(() => {
    if (!org) return;

    // get profile data
    const fetchProfileData = async () => {
      const profile = await requestGetProfileByEmailOrg(appName, org);
      const pageAccess = hasAccess('listDocs', profile);
      const businessUnit = _get(profile, 'organizationProfiles[0].businessUnit', null);
      const businessUnits = _get(profile, 'orgBusinessUnits', []);
      if (!businessUnit && businessUnits.length > 0) {
        const buList = profile.orgBusinessUnits.map((item) => {
          return { value: item.slug, label: item.name };
        });
        buList.unshift({ value: '-1', label: 'All Business Units' });
        setBUState({ show: true, options: buList });
      }

      setProfile(profile);
      setPageAccess(pageAccess);
      setLoadingProfile(false);
    };

    fetchProfileData();
  }, [org]);

  return (
    profile && (
      <PageWrapper org={org} profile={profile} loading={loadingProfile} pageAccess={pageAccess}>
        <Box className={styles.form__container_full}>
          <SoomCard dataTestId="prueba" ariaLabel="prueba">
            <div className={styles.form__list}>
              {hasPermission(Permissions.LIST_DOCUMENTS, profile) && (
                <DynamicGrid app={appName} org={org} user={user} profile={profile} BUState={BUState} />
              )}
            </div>
          </SoomCard>
        </Box>
      </PageWrapper>
    )
  );
});
