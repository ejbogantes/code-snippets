import { withApiAuthRequired } from '@auth0/nextjs-auth0';
import { prismaRead } from '../../../db';
import * as Yup from 'yup';
export default withApiAuthRequired(async function handle(request, response) {
  if (request.method === 'GET') {
    const appId = request.query.app_id as string;
    // validation schema
    const querySchema = Yup.object({
      app_id: Yup.number().required()
    });
    try {
      await querySchema.validate(request.query);
      const result = await prismaRead.license.findMany({
        where: {
          app_id: parseInt(appId),
          deleted_at: null
        },
        select: {
          name: true,
          license_id: true
        }
      });
      if (result) {
        response.status(200).json(result);
        return;
      }
      response.status(409).json({
        message: 'Contact your administrator.'
      });
      return;
    } catch (error) {
      console.error(error);
      let statusCode = 500;
      if (error.name === 'ValidationError') {
        statusCode = 400;
      }
      response.status(statusCode).json({ message: error.message });
      return;
    }
  }
  response.status(404).json('Not Found');
});
