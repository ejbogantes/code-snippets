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

// deletes a document
export const deleteDocument = async (data: object, headers: object = {}) => {
  // gets the token
  const token = await getToken('DELETE:management/deleteDocuments');

  ApiConfig.headers = { ...ApiConfig.headers, ...headers, Authorization: `Bearer ${token}` };

  // sets the configuration
  const DocumentsApi = Api(ApiConfig);

  // executes the request
  const res = await DocumentsApi.delete(`management/deleteDocuments`, { data });
  return res.data;
};

// deletes a document
export const deleteAllDocuments = async (data: object, headers: object = {}) => {
  // gets the token
  const token = await getToken('DELETE:management/deleteAllDocuments');

  ApiConfig.headers = { ...ApiConfig.headers, ...headers, Authorization: `Bearer ${token}` };

  // sets the configuration
  const DocumentsApi = Api(ApiConfig);

  // executes the request
  const res = await DocumentsApi.delete(`management/deleteAllDocuments`, { data });
  return res.data;
};
