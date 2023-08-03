import { withApiAuthRequired } from '@auth0/nextjs-auth0';
import { getMultipartPreSignedUrls } from '@soom-universe/soom-api';

export default withApiAuthRequired(async function handler(request, response) {
  const { method } = request;

  switch (method) {
    case 'POST':
      try {
        const { bucket, fileKey, fileId, parts } = request.body;

        if (!bucket || !fileKey || !fileId || !parts) {
          return response.status(400).json({
            message: 'Missing required parameters',
            required: {
              bucket: bucket || 'empty',
              fileKey: fileKey || 'empty',
              fileId: fileId || 'empty',
              parts: parts || 'empty'
            }
          });
        }

        const data = await getMultipartPreSignedUrls(request.body);
        if (!data.valid) {
          response.status(500).json(data.error);
        }
        response.status(200).json(data.data);
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
      response.setHeader('Allow', ['POST']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
});
