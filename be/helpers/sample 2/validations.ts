/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-case-declarations */
import { get as _get } from 'lodash';

// profile
export const validateProfile = (profile: any, type: 'marketplace' | 'profile' | 'configuration') => {
  try {
    const apps = profile.organizationProfiles || [];
    switch (type) {
      case 'marketplace':
        return profile.marketplace && apps.length < profile.apps_limit;
        break;
      case 'profile':
        return !(!profile.terms_of_service || !profile.privacy_policy || !profile.first_name);
        break;
      case 'configuration':
        const config = _get(apps, '[0].configuration');
        if (!config) {
          return false;
        }
        return validateConfig(config);
        break;
      default:
        return false;
        break;
    }
  } catch (e) {
    return false;
  }
};

const validateConfig = (config) => {
  const manufacturer = _get(config, 'manufacturer', '') || '';
  const manufacturerAlias = _get(config, 'manufacturer_alias', []) || [];
  const languages = _get(config, 'languages', []) || [];

  return manufacturer !== '' && manufacturerAlias.length > 0 && languages.length > 0;
};
