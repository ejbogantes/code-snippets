import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import { get as _get, find as _find } from 'lodash';
import { prismaRead, prismaWrite } from '../../../db';
import { getUserSessionData } from '../../../helpers/userSession';

export default withApiAuthRequired(async function handle(request, response) {
  const { method, body } = request;

  switch (method) {
    case 'GET':
      try {
        const result = await prismaRead.organization.findMany({
          select: {
            name: true,
            slug: true,
            organization_id: true
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
        console.error(error);
        let statusCode = 500;
        if (error.name === 'ValidationError') {
          statusCode = 400;
        }
        response.status(statusCode).json({ message: error.message });
      }
      break;
    case 'POST':
      try {
        const session = await getSession(request, response);
        const profile = await getUserSessionData(session);
        if (!profile) {
          response.status(404).json({ message: 'Owner user not found.' });
          return;
        }

        const result = await prismaWrite.organization.create({
          data: { ...body, owner_profile_id: profile.profile_id }
        });
        if (!result) {
          response.status(409).json({ message: 'Contact your administrator.' });
          return;
        }

        response.status(200).json(result);
        return;
      } catch (error) {
        console.error(error);

        let message = 'Contact your administrator.';
        let statusCode = 409;

        if (error.code && error.code === 'P2002') {
          // check if the error is cause for unique key
          statusCode = 400;
          const columns = _get(error, 'meta.target', []);
          // check if the error is cause for org name
          const orgNameExist = _find(columns, (item) => {
            if (item === 'slug') {
              return true;
            }
          });
          if (orgNameExist) {
            message = 'The organization name is already in use.';
          }
        }

        response.status(statusCode).json({ message });
        return;
      }
      break;
    default:
      response.setHeader('Allow', ['GET', 'POST']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
});
