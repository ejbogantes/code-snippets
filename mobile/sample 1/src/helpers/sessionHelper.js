// helpers
import { getObject, removeKey, storeObject } from './storageHelper';

// api requests
import { getUserData } from '../requests/users';

// constants
import { USER_SESSION_KEY } from '../Constants';

// helpers
import { saveShowPermissions } from './permissionsHelper';

export const checkSession = async () => {
  // await storeObject(USER_SESSION_KEY, null);
  try {
    const session = await getObject(USER_SESSION_KEY);
    if (!session) {
      return null;
    }

    if (session.guest) {
      return session;
    }

    const resultUserApi = await getUserData(session.userId);
    if (!resultUserApi || !resultUserApi.valid) {
      return null;
    }

    session.user = resultUserApi.user;
    return session;
  } catch (error) {
    // Error retrieving data
    return null;
  }
};

export const saveGuestSession = async () => {
  const session = { guest: true, userId: null };
  const resultStore = await storeObject(USER_SESSION_KEY, session);
  return resultStore ? session : null;
};

export const saveUserSession = async (user) => {
  const session = { guest: false, userId: user.user_id };
  const resultStore = await storeObject(USER_SESSION_KEY, session);
  return resultStore ? { ...session, user } : null;
};

export const removeSession = async () => {
  const resultStore = await removeKey(USER_SESSION_KEY);
  await saveShowPermissions(true);
  return Boolean(resultStore);
};
