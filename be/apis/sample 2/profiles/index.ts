import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import { prismaWrite } from '../../../db';
import { getUserSessionData } from '../../../helpers/userSession';

export default withApiAuthRequired(async function handle(request, response) {
  const { method, body } = request;

  switch (method) {
    case 'PUT':
      try {
        const session = await getSession(request, response);
        const profile = await getUserSessionData(session);
        if (!profile) {
          response.status(404).json({ message: 'Owner user not found.' });
          return;
        }

        const result = await prismaWrite.profile.update({
          where: { email: profile.email },
          data: {
            first_name: body.firstName,
            last_name: body.lastName,
            company: body.company
          }
        });
        if (!result) {
          response.status(409).json({
            message: 'Contact your administrator.'
          });
          return;
        }

        response.status(200).json(result);
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
      response.setHeader('Allow', ['PUT']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
});
