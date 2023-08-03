import { get as _get } from 'lodash';

import { validateApiKey } from '../../../../helpers/eifu-customers';
// import { prismaRead, prismaWrite } from '../../../../db';

/**
 * @swagger
 * /api/eifu-customers/configuration:
 *  get:
 *    description: This endpoint retrieves the current configuration settings for your account.
 *    operationId: getConfiguration
 *    tags:
 *      - Configuration
 *    security:
 *      - apiKey: []
 *    responses:
 *      200:
 *        description: Configuration data
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/responses/configuration/get'
 *      400:
 *        description: Params or data load error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/errors/error400'
 *      401:
 *        description: Unauthorized
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/errors/error401'
 *      500:
 *        description: Unexpected error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/errors/error500'
 */

const handler = async (request, response) => {
  const { method } = request;

  const customerData = await validateApiKey(request);
  if (!customerData) {
    return response.status(401).json({ valid: false, message: `Unauthorized` });
  }

  switch (method) {
    case 'GET':
      try {
        const result = {
          manufacturer: customerData.configuration.manufacturer,
          manufacturer_alias: customerData.configuration.manufacturer_alias.split(','),
          notifications_email: customerData.configuration.notifications_email,
          phone_number: customerData.configuration.phone_number,
          regions: customerData.configuration.regions.split(','),
          languages: customerData.configuration.languages.split(',')
        };

        return response.status(200).json({ valid: true, configuration: result });
      } catch (error) {
        console.error(error);
        const statusCode = _get(error, 'response.status', 500);
        const message = _get(error, 'response.data.message', error.message);
        response.status(statusCode).json({ valid: false, message });
      }
      break;
    default:
      response.setHeader('Allow', ['GET']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
};

export default handler;
