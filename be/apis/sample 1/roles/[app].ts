import { withApiAuthRequired } from '@auth0/nextjs-auth0';
import { object, string } from 'yup';

import { prismaRead } from '../../../db';

export default withApiAuthRequired(async function handle(request, response) {
  const { method, query } = request;

  switch (method) {
    case 'GET':
      try {
        const app = query.app as string;

        const querySchema = object({
          app: string().required()
        });

        await querySchema.validate(query);
        const result = await prismaRead.role.findMany({
          where: {
            slug: {
              startsWith: app
            }
          },
          select: {
            role_id: true,
            slug: true,
            name: true
          }
        });
        if (!result) {
          return response.status(409).json({
            message: "Contact your administrator. This role doesn't exist."
          });
        }

        return response.status(200).json(result);
      } catch (error) {
        console.error(error);
        let statusCode = 500;
        if (error.name === 'ValidationError') {
          statusCode = 400;
        }
        return response.status(statusCode).json({ message: error.message });
      }
      break;
    default:
      response.setHeader('Allow', ['GET', 'POST', 'PUT']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
});
