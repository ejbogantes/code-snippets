// api endpoint
import { autoCompletePublicDocuments } from '@soom-universe/soom-api';

// request printed version
export default async function handler(request, response) {
  const { method } = request;
  const headers = {};
  if (request.headers['accept-language']) {
    headers['accept-language'] = request.headers['accept-language'];
  }

  switch (method) {
    case 'GET':
      try {
        const data = await autoCompletePublicDocuments(request.query, headers);
        response.status(200).json(data);
      } catch (error) {
        console.error(error);
        if (error.response) {
          const statusCode = error.response.status || 500;
          const data = error.response.data || {};
          response.status(statusCode).json(data);
        } else {
          response.status(500).json(error);
        }
      }
      break;
    default:
      response.setHeader('Allow', ['GET']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
}
