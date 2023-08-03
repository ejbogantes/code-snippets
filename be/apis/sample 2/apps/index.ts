import { withApiAuthRequired } from '@auth0/nextjs-auth0';
import { prismaRead } from '../../../db';

export default withApiAuthRequired(async function handle(request, response) {
  const { method } = request;

  switch (method) {
    case 'GET':
      try {
        const result = await prismaRead.app.findMany({
          select: {
            app_id: true,
            slug: true,
            name: true,
            description: true,
            version: true,
            logo: true
          }
        });
        if (result) {
          response.status(200).json(result);
          return;
        }
        response.status(409).json({
          message: 'Contact your administrator.'
        });
      } catch (error) {
        let statusCode = 500;
        if (error.name === 'ValidationError') {
          statusCode = 400;
        }
        response.status(statusCode).json({ message: error.message });
      }
      break;
    default:
      response.setHeader('Allow', ['GET']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
});
