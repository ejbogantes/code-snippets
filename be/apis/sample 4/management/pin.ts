/* eslint-disable camelcase */
/* eslint-disable dot-notation */
// required helpers
import Api from '../../helpers/Axios';

// api configuration
const ApiConfig = {
  baseUrl: process.env['MANAGEMENT_API_BASE_URL'],
  headers: { 'Content-Type': 'application/json', 'Accept-Encoding': 'application/json' }
};

export const getSigningPin = async (params: { signatureKey: string; profileId: number; pin: string }) => {
  // sets the configuration
  const ManagementApi = Api(ApiConfig);

  const { signatureKey, profileId, pin } = params;
  const res = await ManagementApi.get(`/api/pages/org/signing-pin/${signatureKey}`, {
    params: {
      pin,
      signature_key: signatureKey,
      profile_id: profileId
    }
  });
  return res.data;
};

export const postSigningPin = async (params: object) => {
  // sets the configuration
  const ManagementApi = Api(ApiConfig);

  const res = await ManagementApi.post(`/api/pages/org/signing-pin/pin`, params);
  return res.data;
};

export const putSigningPin = async (params: { signatureKey: string }) => {
  // sets the configuration
  const ManagementApi = Api(ApiConfig);

  const { signatureKey } = params;
  const res = await ManagementApi.put(`/api/pages/org/signing-pin/${signatureKey}`, {
    params: {
      signature_key: signatureKey
    }
  });
  return res.data;
};
