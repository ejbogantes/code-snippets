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

// updates a document
export const updateDocument = async (params: object, headers: object = {}) => {
  // gets the token
  const token = await getToken('PUT:management/updateDocument');

  ApiConfig.headers = { ...ApiConfig.headers, ...headers, Authorization: `Bearer ${token}` };

  // sets the configuration
  const DocumentsApi = Api(ApiConfig);

  // executes the request
  const res = await DocumentsApi.put(`management/updateDocument`, params);
  return res.data;
};

// updates a published document
export const editPublishedDocument = async (params: object, headers: object = {}) => {
  // gets the token
  const token = await getToken('PUT:management/editPublishedDocument');

  ApiConfig.headers = { ...ApiConfig.headers, ...headers, Authorization: `Bearer ${token}` };

  // sets the configuration
  const DocumentsApi = Api(ApiConfig);

  // executes the request
  const res = await DocumentsApi.put(`management/editPublishedDocument`, params);
  return res.data;
};

// updates document status
export const updateStatus = async (params: object, headers: object = {}) => {
  // gets the token
  const token = await getToken('PUT:management/changeStatuses');

  ApiConfig.headers = { ...ApiConfig.headers, ...headers, Authorization: `Bearer ${token}` };

  // sets the configuration
  const DocumentsApi = Api(ApiConfig);

  // executes the request
  const res = await DocumentsApi.put(`management/changeStatuses`, params);
  return res.data;
};
