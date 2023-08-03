import { soomSafetyApi } from '../helpers/apiHelper';
import { apiPaths } from '../Constants';

export const getGuestBarcodeDetail = async (barcode = '') => {
  try {
    const path = apiPaths.guestBarcode;
    const response = await soomSafetyApi.get(path, { params: { barcode } });
    return response.data || null;
  } catch (e) {
    if (e.response && e.response.data) {
      return e.response.data;
    }
    console.error(e);
    return null;
  }
};

export const getUserBarcodeDetail = async (barcode = '', user_id = '') => {
  try {
    const path = apiPaths.usersBarcode;
    const response = await soomSafetyApi.get(path, { params: { barcode, user_id } });
    return response.data || null;
  } catch (e) {
    if (e.response && e.response.data) {
      return e.response.data;
    }
    console.error(e);
    return null;
  }
};
