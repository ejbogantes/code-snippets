/* eslint-disable no-case-declarations */
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';

import { prismaRead, prismaWrite } from '../../../db';
import { getUserSessionData } from '../../../helpers/userSession';
import { clearCache } from '../../../helpers/webappConfig';

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
        // const { configurationId, licenseBoundaries } = userData;
        const { configurationId } = userData;

        // if (!licenseBoundaries['multiple-dashboards'] || !licenseBoundaries['multiple-dashboards'].enabled) {
        //   return response.status(400).json({ message: 'Access denied to Multiple Dashboards' });
        // }

        const result = await prismaRead.externalSite.findMany({
          where: { configuration_id: configurationId },
          select: { external_site_id: true, regions: true, url: true }
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
        const regions = body.regions as string;
        const url = body.url as string;

        const session = await getSession(request, response);
        const userData = await getUserSessionData(session, app, org);
        if (!userData) {
          return response.status(409).json({
            message:
              "Contact your administrator. This profile doesn't exist, is disabled, or does not have permission for this app."
          });
        }

        // const { configurationId, licenseBoundaries } = userData;
        const { configurationId } = userData;

        // if (!licenseBoundaries['multiple-dashboards'] || !licenseBoundaries['multiple-dashboards'].enabled) {
        //   return response.status(400).json({ message: 'Access denied to Multiple Dashboards' });
        // }

        const result = await prismaWrite.externalSite.create({
          data: { configuration_id: configurationId, regions, url }
        });
        if (!result) {
          response.status(400).json({ message: 'An error occurred while saving settings' });
        }

        // clear webapp cache
        await clearCache(configurationId);

        response.status(200).json({ valid: true, data: result });
      } catch (error) {
        console.error(error);
        let statusCode = 500;
        if (error.name === 'ValidationError') {
          statusCode = 400;
        }
        response.status(statusCode).json({ message: error.message });
      }
      break;
    case 'PUT':
      try {
        const app = body.app as string;
        const org = body.org as string;
        const id = parseInt(body.id as string);
        const regions = body.regions as string;
        const url = body.url as string;

        const session = await getSession(request, response);
        const userData = await getUserSessionData(session, app, org);
        if (!userData) {
          return response.status(409).json({
            message:
              "Contact your administrator. This profile doesn't exist, is disabled, or does not have permission for this app."
          });
        }
        // const { configurationId, licenseBoundaries } = userData;
        const { configurationId } = userData;

        // if (!licenseBoundaries['multiple-dashboards'] || !licenseBoundaries['multiple-dashboards'].enabled) {
        //   return response.status(400).json({ message: 'Access denied to Multiple Dashboards' });
        // }

        // check for the business unit exists
        const es = await prismaRead.externalSite.findFirst({
          where: { external_site_id: id, configuration_id: configurationId }
        });
        if (!es) {
          return response.status(404).json({ message: 'Invalid External Site.' });
        }

        const result = await prismaWrite.externalSite.updateMany({
          where: { external_site_id: id, configuration_id: configurationId },
          data: { regions, url }
        });
        if (!result) {
          response.status(400).json({ message: 'An error occurred while saving settings' });
        }

        // clear webapp cache
        await clearCache(configurationId);

        response.status(200).json({ valid: true, data: result });
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
        if (!query.id) {
          return response.status(400).json({ valid: false, message: `ID parameter is required` });
        }

        const app = query.app as string;
        const org = query.org as string;
        const id = parseInt(query.id as string);

        const session = await getSession(request, response);
        const userData = await getUserSessionData(session, app, org);
        if (!userData) {
          return response.status(409).json({
            message:
              "Contact your administrator. This profile doesn't exist, is disabled, or does not have permission for this app."
          });
        }
        // const { configurationId, licenseBoundaries } = userData;
        const { configurationId } = userData;

        // if (!licenseBoundaries['multiple-dashboards'] || !licenseBoundaries['multiple-dashboards'].enabled) {
        //   return response.status(400).json({ message: 'Access denied to Multiple Dashboards' });
        // }

        const deleteResult = await prismaWrite.externalSite.deleteMany({
          where: { external_site_id: id, configuration_id: configurationId }
        });

        if (!deleteResult) {
          return response.status(400).json({ valid: false, message: `An error has ocurred, please try again` });
        }

        // clear webapp cache
        await clearCache(configurationId);

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
