import { withApiAuthRequired } from '@auth0/nextjs-auth0';

import { prismaRead } from '../../../db';

export default withApiAuthRequired(async function handle(request, response) {
  const { method, query } = request;

  switch (method) {
    case 'GET':
      try {
        const email = query.email as string;

        const result = await prismaRead.profile.findFirst({
          where: { email: email.toLowerCase() },
          select: {
            profile_id: true,
            first_name: true,
            last_name: true,
            company: true,
            enabled: true
          }
        });

        if (!result) {
          return response.status(409).json({
            message:
              "Contact your administrator. This profile doesn't exist, is disabled, or does not have permission for this app."
          });
        }

        response.status(200).json(result);
      } catch (error) {
        console.error(error);
        response.status(error.name === 'ValidationError' ? 400 : 500).json({ message: error.message });
      }
      break;
    default:
      response.setHeader('Allow', ['GET']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
});
