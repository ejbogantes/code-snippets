import { soomSafetyApi } from '../helpers/apiHelper';
import { apiPaths } from '../Constants';

export const sendAccessCode = async (email) => {
  try {
    const path = apiPaths.accessCode;
    const response = await soomSafetyApi.post(path, { email });
    return response.data || null;
  } catch (e) {
    if (e.response && e.response.data) {
      return e.response.data;
    }
    console.error(e);
    return null;
  }
};

export const login = async (email, code, type) => {
  try {
    const path = apiPaths.login;
    const response = await soomSafetyApi.post(path, { email, code, type });
    return response.data || null;
  } catch (e) {
    if (e.response && e.response.data) {
      return e.response.data;
    }
    console.error(e);
    return null;
  }
};

export const getUserData = async (userId) => {
  try {
    const path = apiPaths.user(userId);
    const response = await soomSafetyApi.get(path);
    return response.data || null;
  } catch (e) {
    if (e.response && e.response.data) {
      return e.response.data;
    }
    console.error(e);
    return null;
  }
};

export const updateUser = async (userId, type) => {
  try {
    const path = apiPaths.user(userId);
    const response = await soomSafetyApi.put(path, { type });
    return response.data || null;
  } catch (e) {
    if (e.response && e.response.data) {
      return e.response.data;
    }
    console.error(e);
    return null;
  }
};
