import { get as _get } from 'lodash';

import { prismaRead } from '../db';

export const getUserSessionData = async (session) => {
  if (!session) {
    return null;
  }

  try {
    const email = _get(session, 'user.email', null);

    const result = await prismaRead.profile.findFirst({
      where: { email: email.toLowerCase(), enabled: true, deleted_at: null },
      select: {
        profile_id: true,
        first_name: true,
        last_name: true,
        email: true,
        avatar: true,
        company: true,
        country: true,
        enabled: true,
        timezone: true,
        marketplace: true,
        apps_limit: true,
        terms_of_service: true,
        privacy_policy: true
      }
    });
    if (!result) {
      return null;
    }

    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
};
