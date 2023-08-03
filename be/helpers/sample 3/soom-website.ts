import { get as _get } from 'lodash';

export const validateApiKey = (request) => {
  const apiKey = _get(request, 'headers[x-api-key]');
  if (!apiKey) {
    return false;
  }

  if (apiKey !== process.env.SOOM_WEBSITE_API_KEY) {
    return false;
  }

  return true;
};
