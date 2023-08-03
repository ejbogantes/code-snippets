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

// list all profiles
export const listProfiles = async () => {
  // gets the token
  const token = await getToken('GET:profiles/listProfiles');

  ApiConfig.headers = { ...ApiConfig.headers, Authorization: `Bearer ${token}` };

  // sets the configuration
  const ManagementApi = Api(ApiConfig);

  // executes the request
  const res = await ManagementApi.get('profiles/listProfiles');
  return res;
};

export const updateProfile = async (params: object, email: string) => {
  // gets the token
  const token = await getToken('PUT:api/profiles/');

  ApiConfig.headers = { ...ApiConfig.headers, Authorization: `Bearer ${token}` };

  // sets the configuration
  const ManagementApi = Api(ApiConfig);

  // executes the request
  const res = await ManagementApi.put(`api/profiles/${email}`, params);
  return res.data;
};
