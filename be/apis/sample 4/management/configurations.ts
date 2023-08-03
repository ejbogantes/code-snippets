/* eslint-disable dot-notation */
// required helpers
import Api from '../../helpers/Axios';

// auth token
import { getToken } from './auth';

// api configuration
const ApiConfig = {
  baseUrl: process.env['MANAGEMENT_API_BASE_URL'],
  headers: { 'Content-Type': 'application/json', 'Accept-Encoding': 'application/json', Authorization: '' }
};

export const getConfigurationsByProfileId = async (profileId: number, headers: object = {}) => {
  // gets the token
  const token = await getToken('GET:configurations/listConfigurations');

  ApiConfig.headers = { ...ApiConfig.headers, ...headers, Authorization: `Bearer ${token}` };

  // sets the configuration
  const ManagementApi = Api(ApiConfig);

  // params
  const params = {
    params: {
      filterAttr: 'profile_id',
      filterVal: profileId
    }
  };

  // executes the request
  const res = await ManagementApi.get(`configurations/listConfigurations`, params);
  return res.data;
};

export const getLicenseConfigurationById = async (licenseConfigurationId: number, headers: object = {}) => {
  // gets the token
  const token = await getToken('GET:license-configurations/getLicenseConfiguration/');

  ApiConfig.headers = { ...ApiConfig.headers, ...headers, Authorization: `Bearer ${token}` };

  // sets the configuration
  const ManagementApi = Api(ApiConfig);

  // executes the request
  const res = await ManagementApi.get(`license-configurations/getLicenseConfiguration/${licenseConfigurationId}`);

  return res.data;
};

export const postConfiguration = async (values: object) => {
  // sets the configuration
  const ManagementApi = Api(ApiConfig);

  const response = await ManagementApi.post(`/api/pages/configurations/postConfiguration`, values);
  return response.data;
};
