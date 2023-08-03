/* eslint-disable no-case-declarations */
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import slugify from 'react-slugify';

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
        const { configurationId, licenseBoundaries } = userData;

        if (!licenseBoundaries['multiple-dashboards'] || !licenseBoundaries['multiple-dashboards'].enabled) {
          return response.status(400).json({ message: 'Access denied to Multiple Dashboards' });
        }

        const result = await prismaRead.businessUnit.findMany({
          where: { configuration_id: configurationId, deleted_at: null },
          select: { business_unit_id: true, slug: true, name: true }
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
        const name = body.name as string;

        const session = await getSession(request, response);
        const userData = await getUserSessionData(session, app, org);
        if (!userData) {
          return response.status(409).json({
            message:
              "Contact your administrator. This profile doesn't exist, is disabled, or does not have permission for this app."
          });
        }

        const { configurationId, organizationSlug, licenseBoundaries } = userData;

        if (!licenseBoundaries['multiple-dashboards'] || !licenseBoundaries['multiple-dashboards'].enabled) {
          return response.status(400).json({ message: 'Access denied to Multiple Dashboards' });
        }

        const slug = slugify(name);

        const result = await prismaWrite.businessUnit.create({
          data: {
            configuration_id: configurationId,
            slug: `${organizationSlug}-${slug}`,
            name,
            enabled: true
          }
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
        const name = body.name as string;

        const session = await getSession(request, response);
        const userData = await getUserSessionData(session, app, org);
        if (!userData) {
          return response.status(409).json({
            message:
              "Contact your administrator. This profile doesn't exist, is disabled, or does not have permission for this app."
          });
        }
        const { configurationId, organizationSlug, licenseBoundaries } = userData;

        if (!licenseBoundaries['multiple-dashboards'] || !licenseBoundaries['multiple-dashboards'].enabled) {
          return response.status(400).json({ message: 'Access denied to Multiple Dashboards' });
        }

        // check for the business unit exists
        const bu = await prismaRead.businessUnit.findFirst({
          where: { business_unit_id: id, configuration_id: configurationId }
        });
        if (!bu) {
          return response.status(404).json({ message: 'Invalid Business Unit.' });
        }

        const slug = slugify(name);

        const result = await prismaWrite.businessUnit.updateMany({
          where: { business_unit_id: id, configuration_id: configurationId },
          data: {
            slug: `${organizationSlug}-${slug}`,
            name
          }
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
        const { configurationId, licenseBoundaries } = userData;

        if (!licenseBoundaries['multiple-dashboards'] || !licenseBoundaries['multiple-dashboards'].enabled) {
          return response.status(400).json({ message: 'Access denied to Multiple Dashboards' });
        }

        const deleteResult = await prismaWrite.businessUnit.deleteMany({
          where: { business_unit_id: id, configuration_id: configurationId }
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
