import axios from 'axios';

// get environment
import { SOOMSAFETYAPI_ENDPOINT, SOOMSAFETYAPI_APIKEY } from '@env';

export const soomSafetyApi = axios.create({
  baseURL: SOOMSAFETYAPI_ENDPOINT,
  headers: { 'Content-Type': 'application/json', 'Accept-Encoding': 'application/json', 'x-api-key': SOOMSAFETYAPI_APIKEY }
});
