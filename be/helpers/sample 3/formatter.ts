/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-case-declarations */
import getConfig from 'next/config';
import { find as _find, get as _get } from 'lodash';

// get soom functions
import { getS3Endpoint } from '@soom-universe/soom-utils/functions';

// next js config
const {
  publicRuntimeConfig: {
    permissions: { DELETE_APPS }
  }
} = getConfig();

// apps
export const getAppsFormatted = (profile) => {
  const profileId = profile.profile_id;
  const apps = profile.organizationProfiles;
  const result = [];
  apps.forEach((app) => {
    const rolePermissions = _get(app, 'role.rolePermissions', []);
    const ownerProfileId = _get(app, 'organization.owner_profile_id', '');
    const deletePermission = _find(rolePermissions, (rp) => {
      return rp.permission.slug === DELETE_APPS;
    });

    const bucket = _get(app, 'configuration.bucket', '');
    // check if are there any configurations
    const configurations = _get(app, 'configuration.license_configurations', []);
    app.logo = false;
    if (configurations.length > 0) {
      // TODO: we need to check the latest version
      const settings = _get(configurations[0], 'settings', false);
      if (settings) {
        const logo = _get(JSON.parse(settings), 'company.logo', false);
        if (logo) {
          app.logo = getS3Endpoint(bucket, logo) || false;
        }
      }
    }
    app.canBeDeleted = Boolean(deletePermission) || profileId === ownerProfileId;
    result.push(app);
  });
  return result;
};
