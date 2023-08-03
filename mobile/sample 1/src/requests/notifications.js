import { soomSafetyApi } from '../helpers/apiHelper';
import { apiPaths } from '../Constants';

export const saveDevice = async (user_id = '', device_id = '', device_token = '', device_system = '') => {
  try {
    const path = apiPaths.notDevices;
    const response = await soomSafetyApi.post(path, { user_id, device_id, device_token, device_system });

    return response.data || null;
  } catch (e) {
    if (e.response && e.response.data) {
      return e.response.data;
    }
    console.error(e);
    return null;
  }
};

export const deleteDevice = async (id = '', user_id = '') => {
  try {
    const path = apiPaths.notDevice(id);
    const response = await soomSafetyApi.delete(path, { params: { user_id } });
    return response.data || null;
  } catch (e) {
    if (e.response && e.response.data) {
      return e.response.data;
    }
    console.error(e);
    return null;
  }
};
