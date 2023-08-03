import { withApiAuthRequired } from '@auth0/nextjs-auth0';
import { searchDocuments } from '@soom-universe/soom-api';

// request printed version
export default withApiAuthRequired(async function handler(request, response) {
  const { method } = request;

  switch (method) {
    case 'GET':
      try {
        const data = await searchDocuments(request.query);
        response.status(200).json(data);
      } catch (e) {
        console.error(e);
        if (e.response) {
          const statusCode = e.response.status || 500;
          const data = e.response.data || {};
          response.status(statusCode).json(data);
        } else {
          response.status(500).json(e);
        }
      }
      break;
    default:
      response.setHeader('Allow', ['GET']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
});
