/* eslint-disable dot-notation */
// required helpers
import Api from '../../helpers/Axios';

// auth token
import { getToken } from './../management/auth';

// api configuration
const ApiConfig = {
  baseUrl: process.env['DOCUMENTS_API_BASE_URL'],
  headers: { 'Content-Type': 'application/json', 'Accept-Encoding': 'application/json', Authorization: '' }
};

// gets a list of results
export const searchDocuments = async (params: object, headers: object = {}) => {
  // gets the token
  const token = await getToken('GET:search/document');

  ApiConfig.headers = { ...ApiConfig.headers, ...headers, Authorization: `Bearer ${token}` };

  // sets the configuration
  const DocumentsApi = Api(ApiConfig);

  // executes the request
  const res = await DocumentsApi.get(`search/document`, { params });
  return res.data;
};
