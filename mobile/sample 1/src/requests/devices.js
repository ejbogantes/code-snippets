import axios from 'axios';

import { soomSafetyApi } from '../helpers/apiHelper';
import { apiPaths } from '../Constants';

export const saveDevice = async (barcode = '', user_id = '') => {
  try {
    const path = apiPaths.devices;
    const response = await soomSafetyApi.post(path, { barcode, user_id });
    return response.data || null;
  } catch (e) {
    if (e.response && e.response.data) {
      return e.response.data;
    }
    console.error(e);
    return null;
  }
};

export const updateDevice = async (id = '', device_group_id = '', user_id = '') => {
  try {
    const path = apiPaths.device(id);
    const response = await soomSafetyApi.put(path, { device_group_id, user_id });
    return response.data || null;
  } catch (e) {
    if (e.response && e.response.data) {
      return e.response.data;
    }
    console.error(e);
    return null;
  }
};

export const getDevices = async (user_id = '') => {
  try {
    const path = apiPaths.devices;
    const response = await soomSafetyApi.get(path, { params: { user_id } });
    return response.data || null;
  } catch (e) {
    if (e.response && e.response.data) {
      return e.response.data;
    }
    console.error(e);
    return null;
  }
};

export const getDevice = async (device_id = '', user_id = '') => {
  try {
    const path = apiPaths.device(device_id);
    const response = await soomSafetyApi.get(path, { params: { user_id } });
    return response.data || null;
  } catch (e) {
    if (e.response && e.response.data) {
      return e.response.data;
    }
    console.error(e);
    return null;
  }
};

export const getDeviceGroups = async (user_id = '') => {
  try {
    const path = apiPaths.deviceGroups;
    const response = await soomSafetyApi.get(path, { params: { user_id } });
    return response.data || null;
  } catch (e) {
    if (e.response && e.response.data) {
      return e.response.data;
    }
    console.error(e);
    return null;
  }
};

export const createDeviceGroup = async (name = '', user_id = '') => {
  try {
    const path = apiPaths.deviceGroups;
    const response = await soomSafetyApi.post(path, { name, user_id });
    return response.data || null;
  } catch (e) {
    if (e.response && e.response.data) {
      return e.response.data;
    }
    console.error(e);
    return null;
  }
};

export const updateDeviceGroup = async (id = '', name = '', user_id = '') => {
  try {
    const path = apiPaths.deviceGroup(id);
    const response = await soomSafetyApi.put(path, { name, user_id });
    return response.data || null;
  } catch (e) {
    if (e.response && e.response.data) {
      return e.response.data;
    }
    console.error(e);
    return null;
  }
};

export const deleteDeviceGroup = async (id = '', user_id = '') => {
  try {
    const path = apiPaths.deviceGroup(id);
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

export const getDeviceImageUploadData = async (user_id = '', image_ext = '', content_type = '') => {
  try {
    const path = apiPaths.imagesUploadData;
    const response = await soomSafetyApi.get(path, { params: { user_id, image_ext, content_type } });
    return response.data || null;
  } catch (e) {
    if (e.response && e.response.data) {
      return e.response.data;
    }
    console.error(e);
    return null;
  }
};

export const uploadDeviceImage = async (url = '', uri = '') => {
  try {
    const imageResp = await fetch(uri);
    const imageBody = await imageResp.blob();

    await fetch(url, {
      method: 'PUT',
      body: imageBody
    });
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const createDeviceImage = async (user_id = '', device_id = '', image_key = '') => {
  try {
    const path = apiPaths.images;
    const response = await soomSafetyApi.post(path, { user_id, device_id, image_key });
    return response.data || null;
  } catch (e) {
    if (e.response && e.response.data) {
      return e.response.data;
    }
    console.error(e);
    return null;
  }
};

export const deleteDeviceImage = async (user_id = '', device_id = '', device_image_id = '') => {
  try {
    const path = apiPaths.images;
    const response = await soomSafetyApi.delete(path, { params: { user_id, device_id, device_image_id } });
    return response.data || null;
  } catch (e) {
    if (e.response && e.response.data) {
      return e.response.data;
    }
    console.error(e);
    return null;
  }
};
