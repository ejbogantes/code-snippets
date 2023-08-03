import { withApiAuthRequired } from '@auth0/nextjs-auth0';
import { prismaRead } from '../../../db';

export default withApiAuthRequired(async function handle(request, response) {
  try {
    const result = await prismaRead.organization.findMany();
    response.status(200).json(result);
  } catch (error) {
    console.error(error);
    response.status(403).json({ error: 'Error ocurred when listing all organizations' });
  }
});
