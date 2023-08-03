/* eslint-disable no-case-declarations */
// profile
export const validateProfile = (profile, type) => {
  try {
    switch (type) {
      case 'marketplace':
        const apps = profile.organizationProfiles || [];
        return profile.marketplace && apps.length < profile.apps_limit;
        break;
      case 'profile':
        return !(!profile.terms_of_service || !profile.privacy_policy || !profile.first_name);
        break;
      default:
        return false;
        break;
    }
  } catch (e) {
    return false;
  }
};
