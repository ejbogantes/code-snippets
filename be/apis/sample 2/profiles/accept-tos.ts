import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import { prismaWrite } from '../../../db';
import { getUserSessionData } from '../../../helpers/userSession';

export default withApiAuthRequired(async function handle(request, response) {
  const { method } = request;

  switch (method) {
    case 'POST':
      try {
        const session = await getSession(request, response);
        const profile = await getUserSessionData(session);
        if (!profile) {
          response.status(404).json({ message: 'Owner user not found.' });
          return;
        }

        const result = await prismaWrite.profile.update({
          where: { email: profile.email },
          data: { terms_of_service: true }
        });

        if (!result) {
          response.status(400).json({ message: 'An error has occurred. Please try again.' });
          return;
        }

        response.status(200).json({ message: 'Success.' });
        return;
      } catch (error) {
        console.error(error);
        response.status(500).json({ message: error.message });
      }
      break;
    default:
      response.setHeader('Allow', ['POST']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
});
