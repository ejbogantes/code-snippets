/* eslint-disable dot-notation */
// required helpers
import Api from '../../helpers/Axios';

// auth token
//  import { getToken } from './auth';

// api configuration
const ApiConfig = {
  baseUrl: process.env[''],
  headers: {}
};

export const getOrganizations = async () => {
  // sets the configuration
  const ManagementApi = Api(ApiConfig);

  // executes the request
  const response = await ManagementApi.get(`/api/pages/organizations/getListOrganizations`);
  return response.data;
};

export const postOrganization = async (values: object) => {
  // sets the configuration
  const ManagementApi = Api(ApiConfig);

  const response = await ManagementApi.post(`/api/pages/organizations/postOrganization`, values);
  return response.data;
};

export const postOrganizationProfile = async (values: object) => {
  // sets the configuration
  const ManagementApi = Api(ApiConfig);

  const response = await ManagementApi.post(`/api/pages/organizations/postOrganizationProfile`, values);
  return response.data;
};
