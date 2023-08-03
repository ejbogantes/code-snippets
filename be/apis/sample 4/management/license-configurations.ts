/* eslint-disable dot-notation */
// required helpers
import Api from '../../helpers/Axios';

// auth token
// import { getToken } from './auth';

// api configuration
const ApiConfig = {
  baseUrl: process.env[''],
  // baseUrl: process.env['MANAGEMENT_API_BASE_URL'],
  headers: { 'Content-Type': 'application/json', 'Accept-Encoding': 'application/json', Authorization: '' }
};

export const postLicenseConfiguration = async (values: object) => {
  // sets the configuration
  const ManagementApi = Api(ApiConfig);

  const params = {
    settings: values,
    configuration_id: 3,
    is_production: false
  };

  // const json = JSON.stringify(params);

  // executes the request
  // const res = await ManagementApi.post(`license-configurations/createLicenseConfiguration`, json);
  const res = await ManagementApi.post(`/api/pages/license_configurations/createLicenseConfiguration`, params);
  return res.data;
};
