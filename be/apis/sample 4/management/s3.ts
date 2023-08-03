/* eslint-disable dot-notation */
// required helpers
import Api from '../../helpers/Axios';

// api configuration
const ApiConfig = {
  baseUrl: process.env[''],
  headers: {}
};

// eslint-disable-next-line camelcase
export const postCreateBucket = async (bucket: string) => {
  // sets the configuration
  const ManagementApi = Api(ApiConfig);
  // executes the request
  // eslint-disable-next-line camelcase
  const res = await ManagementApi.post(`/api/uploads/createBucket`, { bucket });
  return res.data;
};
