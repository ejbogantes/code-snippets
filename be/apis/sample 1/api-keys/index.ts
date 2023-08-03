/* eslint-disable no-case-declarations */
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';

import { getNewApiKey } from '@soom-universe/soom-utils/functions';

import { prismaRead, prismaWrite } from '../../../db';
import { getUserSessionData } from '../../../helpers/userSession';

export default withApiAuthRequired(async function handle(request, response) {
  const { method, body, query } = request;

  switch (method) {
    case 'GET':
      try {
        const org = query.org as string;
        const app = query.app as string;

        const session = await getSession(request, response);
        const userData = await getUserSessionData(session, app, org);
        if (!userData) {
          return response.status(409).json({
            message:
              "Contact your administrator. This profile doesn't exist, is disabled, or does not have permission for this app."
          });
        }
        const { configurationId } = userData;

        const result = await prismaRead.apiKey.findMany({
          where: {
            configuration_id: configurationId,
            deleted_at: null
          },
          select: { key: true, enabled: true }
        });
        if (!result) {
          return response.status(200).json([]);
        }

        return response.status(200).json(result);
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
        const app = body.app as string;
        const org = body.org as string;

        const session = await getSession(request, response);
        const userData = await getUserSessionData(session, app, org);
        if (!userData) {
          return response.status(409).json({
            message:
              "Contact your administrator. This profile doesn't exist, is disabled, or does not have permission for this app."
          });
        }
        const { configurationId } = userData;

        const apiKey = getNewApiKey(configurationId);

        const result = await prismaWrite.apiKey.create({
          data: {
            key: apiKey,
            configuration_id: configurationId,
            enabled: true
          }
        });
        if (!result) {
          response.status(400).json({ message: 'An error occurred while saving settings' });
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
    case 'DELETE':
      try {
        if (!query.key) {
          return response.status(400).json({ valid: false, message: `Key parameter is required` });
        }

        const app = query.app as string;
        const org = query.org as string;
        const key = query.key as string;

        const session = await getSession(request, response);
        const userData = await getUserSessionData(session, app, org);
        if (!userData) {
          return response.status(409).json({
            message:
              "Contact your administrator. This profile doesn't exist, is disabled, or does not have permission for this app."
          });
        }
        const { configurationId } = userData;

        const deleteResult = await prismaWrite.apiKey.deleteMany({
          where: { key, configuration_id: configurationId }
        });

        if (!deleteResult) {
          return response.status(400).json({ valid: false, message: `An error has ocurred, please try again` });
        }

        return response.status(200).json({ valid: true });
      } catch (error) {
        console.error(error);
        let statusCode = 500;
        if (error.name === 'ValidationError') {
          statusCode = 400;
        }
        response.status(statusCode).json({ valid: false, message: error.message });
      }
      break;
    default:
      response.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
});
