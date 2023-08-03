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

// eslint-disable-next-line camelcase
export const getLicenseByApp = async (app_id: number) => {
  // sets the configuration
  const ManagementApi = Api(ApiConfig);
  // executes the request
  // eslint-disable-next-line camelcase
  const res = await ManagementApi.get(`/api/pages/licenses/${app_id}`);
  return res.data;
};
