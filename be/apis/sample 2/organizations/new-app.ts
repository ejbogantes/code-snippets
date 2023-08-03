import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import { prismaRead } from '../../../db';
import { getUserSessionData } from '../../../helpers/userSession';

export default withApiAuthRequired(async function handle(request, response) {
  const { method, query } = request;
  const appId = (query.app_id as string) || '0';

  switch (method) {
    case 'GET':
      try {
        const session = await getSession(request, response);
        const profile = await getUserSessionData(session);
        if (!profile) {
          response.status(404).json({ message: 'Owner user not found.' });
          return;
        }

        const result = await prismaRead.organization.findMany({
          where: {
            owner_profile_id: profile.profile_id,
            Configuration: {
              every: {
                license: {
                  app: { app_id: parseInt(appId) }
                }
              }
            }
          },
          select: {
            organization_id: true,
            slug: true,
            name: true,
            Configuration: {
              select: {
                configuration_id: true,
                license: {
                  select: {
                    license_id: true,
                    app_id: true
                  }
                }
              }
            }
          }
        });
        if (!result) {
          response.status(200).json([]);
          return;
        }

        response.status(200).json(result.filter((item) => item.Configuration.length <= 0));
        return;
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
      response.setHeader('Allow', ['GET', 'POST']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
});
