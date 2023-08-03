/* eslint-disable dot-notation */
// required helpers
import Api from '../../helpers/Axios';
import Redis from '../../helpers/Redis';
import qs from 'qs';
import hash from 'object-hash';

const apiTokenPrefix = 'auth0-m2m-token-';
const expTokenTime = 86400;

const getTokenFromAuth0 = async () => {
  try {
    const ManagementApi = Api({
      baseUrl: process.env['AUTH0_BACKEND_TOKEN_URL'],
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept-Encoding': 'application/json'
      },
      withCredentials: false
    });
    const res = await ManagementApi.post(
      '',
      qs.stringify({
        grant_type: 'client_credentials',
        client_id: process.env['AUTH0_BACKEND_CLIENT_ID'],
        client_secret: process.env['AUTH0_BACKEND_CLIENT_SECRET'],
        audience: process.env['AUTH0_BACKEND_AUDIENCE']
      })
    );
    return res.data.access_token;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getToken = async (requestIdent: string | undefined, resetToken?: boolean | false) => {
  if (!requestIdent) {
    return getTokenFromAuth0();
  }

  // check cache to get a token
  const hashIdent = hash(requestIdent, { algorithm: 'sha1' });
  const cacheKey = `${apiTokenPrefix}${hashIdent}`;
  const cache = !resetToken ? await Redis.get(cacheKey) : null;
  if (cache) {
    return cache;
  }

  // get new token from api and set it in cache
  const token = await getTokenFromAuth0();
  if (token) {
    Redis.set(cacheKey, token, 'EX', expTokenTime);
  }
  return token;
};
