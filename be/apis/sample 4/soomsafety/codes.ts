/* eslint-disable dot-notation */
// required helpers
import Api from '../../helpers/Axios';

// api configuration
const ApiConfig = {
  baseUrl: process.env['SOOMSAFETY_BE_API_ENDPOINT'],
  headers: { 'x-api-key': process.env['SOOMSAFETY_BE_API_KEY'] }
};

// get a profile for app
export const getManufacturerBarcode = async (barcode: string) => {
  // sets the configuration
  const ApiInstance = Api(ApiConfig);

  // executes the request
  const res = await ApiInstance.get(`/search/device/manufacturer`, { params: { barcode } });
  return res.data;
};

// get a profile for app
export const getPatientBarcode = async (barcode: string) => {
  // sets the configuration
  const ApiInstance = Api(ApiConfig);

  // executes the request
  const res = await ApiInstance.get(`/search/device/patient`, { params: { barcode } });
  return res.data;
};
