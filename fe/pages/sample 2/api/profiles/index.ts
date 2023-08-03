import { withApiAuthRequired } from '@auth0/nextjs-auth0';
import { prismaRead } from '../../../db';

export default withApiAuthRequired(async function handle(request, response) {
  const { method } = request;

  switch (method) {
    case 'GET':
      try {
        const result = await prismaRead.profile.findMany();
        response.status(200).json(result);
      } catch (error) {
        console.error(error);
        response.status(500).json({ error: 'Error ocurred when listing all profiles' });
      }
      break;
    default:
      response.setHeader('Allow', ['GET']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
});
