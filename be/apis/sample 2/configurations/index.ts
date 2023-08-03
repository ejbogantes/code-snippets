import { withApiAuthRequired } from '@auth0/nextjs-auth0';
import { prismaWrite } from '../../../db';

export default withApiAuthRequired(async function handle(request, response) {
  const { method, body } = request;

  switch (method) {
    case 'POST':
      try {
        const result = await prismaWrite.configuration.create({
          data: body
        });
        if (result) {
          response.status(200).json(result);
          return;
        }
        response.status(409).json({
          message: 'Contact your administrator.'
        });
      } catch (error) {
        console.error(error);
        let statusCode = 500;
        if (error.name === 'ValidationError') {
          statusCode = 400;
        }
        response.status(statusCode).json({ message: error.message });
      }
      break;
    default:
      response.setHeader('Allow', ['POST']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
});
