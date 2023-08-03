/* eslint-disable dot-notation */
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import { get as _get } from 'lodash';

import { syncManufacturer } from '@soom-universe/soom-api';

import { prismaWrite, prismaRead } from '../../../db';
import { clearCache } from '../../../helpers/webappConfig';
import { getUserSessionData } from '../../../helpers/userSession';

// request printed version
export default withApiAuthRequired(async function handler(request, response) {
  const { method, query, body } = request;

  switch (method) {
    case 'GET':
      try {
        if (!query.org || !query.app) {
          return response.status(400).json({ error: '"org" and "app" is required to get settings' });
        }

        const app = query.app as string;
        const org = query.org as string;

        const session = await getSession(request, response);
        const userData = await getUserSessionData(session, app, org);
        if (!userData) {
          return response.status(409).json({
            message:
              "Contact your administrator. This profile doesn't exist, is disabled, or does not have permission for this app."
          });
        }
        const { configurationId } = userData;

        const configuration = await prismaRead.configuration.findUnique({
          where: { configuration_id: configurationId }
        });
        if (!configuration) {
          return response.status(200).json(null);
        }

        response.status(200).json(configuration);
      } catch (error) {
        console.error(error);
        response.status(500).json({ error: error.message });
      }
      break;
    case 'POST':
      try {
        if (!body.org || !body.app) {
          return response.status(400).json({ error: '"org" and "app" is required to save settings' });
        }

        const app = body.app as string;
        const org = body.org as string;

        const session = await getSession(request, response);
        const userData = await getUserSessionData(session, app, org);
        if (!userData) {
          return response.status(409).json({
            error:
              "Contact your administrator. This profile doesn't exist, is disabled, or does not have permission for this app."
          });
        }
        const { configurationId, licenseBoundaries } = userData;

        const configuration = await prismaRead.configuration.findUnique({
          where: { configuration_id: configurationId }
        });
        if (!configuration) {
          return response.status(400).json({ error: 'Settings not found' });
        }

        const languages = _get(body, 'languages', '');
        // languages validations
        if (licenseBoundaries['languages'] && licenseBoundaries['languages'].limit >= 0) {
          if (languages.split(',').length > licenseBoundaries['languages'].limit) {
            return response.status(400).json({ error: 'Language limit exceeded' });
          }
        }

        // audience selector validation
        const audienceSelectorEnabled = licenseBoundaries['audience-selector']
          ? licenseBoundaries['audience-selector'].enabled
          : false;

        // update config
        const saveData = {
          manufacturer: body.manufacturer,
          manufacturer_alias: _get(body, 'manufacturer_alias', ''),
          notifications_email: _get(body, 'notifications_email', ''),
          phone_number: _get(body, 'phone_number', ''),
          regions: _get(body, 'regions', ''),
          languages,
          webapp_password_preview: _get(body, 'webapp_password_preview', ''),
          webapp_password_production: _get(body, 'webapp_password_production', ''),
          doctor_audience: audienceSelectorEnabled ? _get(body, 'doctor_audience', false) : false
        };

        const result = await prismaWrite.configuration.update({
          where: { configuration_id: configuration.configuration_id },
          data: { ...saveData }
        });

        if (!result) {
          return response.status(400).json({ error: 'An error occurred while saving settings' });
        }

        // clear webapp cache
        await clearCache(configuration.configuration_id);

        // sync manufacturer aliases in backend
        syncManufacturer({
          bucket: configuration.bucket,
          manufacturer_alias: saveData.manufacturer_alias.split(',')
        });

        response.status(200).json(result);
      } catch (error) {
        console.error(error);
        response.status(403).json({ error: 'An error occurred while saving settings' });
      }
      break;
    default:
      response.setHeader('Allow', ['GET', 'POST']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
});
