/* eslint-disable no-case-declarations */
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import { get as _get, find as _find } from 'lodash';

import { prismaRead, prismaWrite } from '../../../db';
import { sendUserNotification } from '../../../helpers/notifications';
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
        const { email, organizationId, configurationId, businessUnitId } = userData;

        const result = await prismaRead.organizationProfiles.findMany({
          where: {
            configuration_id: configurationId,
            organization_id: organizationId,
            business_unit_id: businessUnitId || undefined,
            Profile: { email: { not: email }, deleted_at: null }
          },
          select: {
            profile_id: true,
            enabled: true,
            Profile: {
              select: {
                first_name: true,
                last_name: true,
                email: true,
                enabled: true
              }
            },
            role: {
              select: { role_id: true, slug: true, name: true }
            },
            businessUnit: {
              select: { business_unit_id: true, name: true }
            }
          }
        });
        if (!result) {
          return response.status(200).json([]);
        }

        const newResult = result.map((item) => {
          return {
            id: item.profile_id,
            name: item.Profile.first_name,
            lastName: item.Profile.last_name,
            email: item.Profile.email,
            role: item.role.name,
            businessUnit: item.businessUnit ? item.businessUnit.name : null,
            status: item.enabled
          };
        });

        return response.status(200).json(newResult);
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
        const { organizationId, configurationId, businessUnitId, licenseBoundaries } = userData;

        // users limit validation
        const usersCant = await prismaRead.organizationProfiles.count({
          where: {
            configuration_id: configurationId
          }
        });
        if (licenseBoundaries['users-quantity'] && licenseBoundaries['users-quantity'].limit >= 0) {
          if (usersCant + 1 > licenseBoundaries['users-quantity'].limit) {
            return response.status(400).json({ message: 'Users limit exceeded' });
          }
        }

        let buId = null;
        if (businessUnitId) {
          buId = businessUnitId;
        } else if (body.business_unit_id && body.business_unit_id !== -1) {
          buId = body.business_unit_id;
        }

        const result = await prismaWrite.profile.create({
          data: {
            first_name: body.first_name,
            last_name: body.last_name,
            email: body.email.toLowerCase(),
            company: body.company,
            enabled: true,
            organizationProfiles: {
              create: {
                role_id: body.role_id,
                organization_id: organizationId,
                configuration_id: configurationId,
                business_unit_id: buId,
                enabled: body.enabled
              }
            }
          }
        });
        response.status(200).json(result);

        // send user notification
        sendUserNotification(result, configurationId);
      } catch (error) {
        console.error(error);

        const { statusCode, message } = getErrorInfo(
          error,
          500,
          'Error ocurred creating a new user.Please verify the user information and try again.'
        );
        response.status(statusCode).json({ message });
      }
      break;
    default:
      response.setHeader('Allow', ['GET', 'POST']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
});

const getErrorInfo = (error, statusCode, message) => {
  if (error.code && error.code === 'P2002') {
    // check if the error is cause for unique key
    statusCode = 400;
    const errorColumns = _get(error, 'meta.target', []);
    // check if the error is cause for relation
    const relExist = _find(errorColumns, (item) => {
      if (item === 'organization_id' || item === 'profile_id' || item === 'configuration_id') {
        return true;
      }
    });
    const emailExist = _find(errorColumns, (item) => {
      if (item === 'email') {
        return true;
      }
    });
    if (relExist) {
      message = 'The user already have access to your app.';
    } else if (emailExist) {
      message = 'The user already exists in our database.';
    }
  }
  return { statusCode, message };
};
