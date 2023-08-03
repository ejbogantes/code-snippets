/* eslint-disable dot-notation */
// required helpers
import Api from '../../helpers/Axios';

// auth token
import { getToken } from '../management/auth';

// api configuration
const ApiConfig = {
  baseUrl: process.env['NOTIFICATIONS_API_BASE_URL'],
  headers: { 'Content-Type': 'application/json', 'Accept-Encoding': 'application/json', Authorization: '' }
};

// request printed version
export const sendTemplatedEmail = async (params: object, headers: object = {}) => {
  // gets the token
  const token = await getToken('POST:emails/sendTemplatedEmail');

  ApiConfig.headers = { ...ApiConfig.headers, ...headers, Authorization: `Bearer ${token}` };

  // sets the configuration
  const apiObject = Api(ApiConfig);

  // executes the request
  const res = await apiObject.post(`emails/sendTemplatedEmail`, params);
  return res.data;
};
