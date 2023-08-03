// import getConfig from 'next/config';
import { get as _get } from 'lodash';

import { prismaRead, prismaWrite } from '../db';

export const validateApiKey = async (request) => {
  const apiKey = _get(request, 'headers[x-api-key]');
  if (!apiKey) {
    return null;
  }

  const result = await prismaRead.apiKey.findFirst({
    where: { key: apiKey, enabled: true, deleted_at: null },
    select: {
      key: true,
      configuration: {
        select: {
          configuration_id: true,
          manufacturer: true,
          manufacturer_alias: true,
          notifications_email: true,
          phone_number: true,
          regions: true,
          languages: true,
          bucket: true,
          organization: {
            select: {
              organization_id: true,
              slug: true,
              name: true
            }
          },
          license: {
            select: {
              license_id: true,
              app: {
                select: {
                  app_id: true,
                  slug: true,
                  name: true
                }
              },
              licenseBoundaries: {
                select: { boundary: true, enabled: true, limit: true }
              }
            }
          }
        }
      }
    }
  });

  if (!result) {
    return null;
  }

  const boundariesData = _get(result, 'configuration.license.licenseBoundaries', []);
  const boundaries = {};
  boundariesData.forEach((b) => {
    const { boundary, enabled, limit } = b;
    boundaries[boundary.boundary_id] = { enabled, limit };
  });

  // validate id license has access to api integration
  if (!boundaries['api-integration'] || !boundaries['api-integration'].enabled) {
    return null;
  }

  return { key: result.key, configuration: result.configuration, licenseBoundaries: boundaries };
};

export const getBooleanValue = (value) => {
  if (value === 'false') {
    return false;
  }
  return !!value;
};

export const updatePublishedDocument = async (configId: number, docId: string, action: string = 'save' || 'delete') => {
  try {
    if (action === 'save') {
      await prismaWrite.publishedDocument.create({
        data: { document_id: docId, configuration_id: configId }
      });
    } else if (action === 'delete') {
      await prismaWrite.publishedDocument.delete({
        where: { document_id: docId }
      });
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
