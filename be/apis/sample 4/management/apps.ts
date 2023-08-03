/* eslint-disable dot-notation */
// required helpers
import Api from '../../helpers/Axios';

// auth token
//  import { getToken } from './auth';

// api configuration
const ApiConfig = {
  baseUrl: process.env['MANAGEMENT_API_BASE_URL'],
  headers: {}
};

// get a profile for app
export const getProfileByEmailOrg = async (email: string, app: string, org: string) => {
  // sets the configuration
  const ManagementApi = Api(ApiConfig);

  // params
  const params = {
    params: {
      app,
      org
    }
  };

  // executes the request
  const res = await ManagementApi.get(`/api/pages/profiles/${email}`, params);
  return res.data;
};

// get a profile with all orgs and apps
export const getProfileByEmail = async (email: string) => {
  // sets the configuration
  const ManagementApi = Api(ApiConfig);

  // executes the request
  const res = await ManagementApi.get(`/api/apps/${email}`);
  return res.data;
};

export const getListApps = async () => {
  // sets the configuration
  const ManagementApi = Api(ApiConfig);

  // executes the request
  const res = await ManagementApi.get(`/api/pages/apps/getListApps`);
  return res.data;
};
