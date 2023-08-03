import getConfig from 'next/config';
import { get as _get } from 'lodash';

import { getPatientBarcode, getManufacturerBarcode } from '@soom-universe/soom-api';
import { getSoomSafetyS3Endpoint } from '@soom-universe/soom-utils/functions';

const {
  publicRuntimeConfig: {
    soomSafety: { userTypes }
  }
} = getConfig();

export const validateApiKey = (request) => {
  const apiKey = _get(request, 'headers[x-api-key]');
  if (!apiKey) {
    return false;
  }

  if (apiKey !== process.env.SOOMSAFETY_API_KEY) {
    return false;
  }

  return true;
};

export const getBarcodeInfo = async (barcode, userType) => {
  try {
    let data;
    if (userType === userTypes.manufacturer) {
      data = await getManufacturerBarcode(barcode);
    } else {
      data = await getPatientBarcode(barcode);
    }

    return { valid: true, data, saved: undefined };
  } catch (error) {
    console.error(error);
    if (error.response) {
      const data = error.response.data || {};
      return { valid: false, data };
    } else {
      return { valid: false, message: `An error has ocurred, please try again` };
    }
  }
};

export const formatDevice = (data) => {
  const formatDeviceImages = (device) => {
    const images = device.device_images || [];
    if (!Array.isArray(images)) {
      return device;
    }

    const s3Endpoint = getSoomSafetyS3Endpoint();
    const newDevice = { ...device };
    newDevice.device_images = images.map((img) => {
      return { ...img, url: `${s3Endpoint}${img.key}` };
    });

    return newDevice;
  };

  if (!Array.isArray(data)) {
    return formatDeviceImages(data);
  }

  return data.map((device) => {
    return formatDeviceImages(device);
  });
};

export const formatDeviceImage = (data) => {
  const s3Endpoint = getSoomSafetyS3Endpoint();
  return { ...data, url: `${s3Endpoint}${data.key}` };
};
