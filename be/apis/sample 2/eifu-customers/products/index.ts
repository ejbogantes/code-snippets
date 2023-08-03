import { get as _get } from 'lodash';

// api endpoint
import { listProducts } from '@soom-universe/soom-api';

import { validateApiKey } from '../../../../helpers/eifu-customers';
// import { prismaRead, prismaWrite } from '../../../../db';

/**
 * @swagger
 * /api/eifu-customers/products:
 *  get:
 *    description: This endpoint retrieves a list of products that are associated with the manufacturer.
 *    operationId: getProducts
 *    tags:
 *      - Products
 *    security:
 *      - apiKey: []
 *    parameters:
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *        description: limit (pagination - default 50)
 *      - in: query
 *        name: offset
 *        schema:
 *          type: integer
 *        description: offset (pagination - default 0)
 *    responses:
 *      200:
 *        description: List of products
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/responses/products/get'
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
  const { method, query } = request;

  const customerData = await validateApiKey(request);
  if (!customerData) {
    return response.status(401).json({ valid: false, message: `Unauthorized` });
  }

  switch (method) {
    case 'GET':
      try {
        const limit = query.limit ? parseInt(query.limit) : 50;
        const offset = query.offset ? parseInt(query.offset) : 0;

        const manufacturerAliasFormatted = customerData.configuration.manufacturer_alias.split(',').map((alias) => {
          return `manufacturer_alias=${alias}`;
        });
        const queryManufacturerAlias =
          manufacturerAliasFormatted.length > 0 ? manufacturerAliasFormatted.join('&') : 'manufacturer_alias=';

        const params = {
          pagination: true,
          skip: offset,
          limit,
          sources: customerData.configuration.bucket,
          manufacturer: customerData.configuration.manufacturer || ''
        };

        const result = await listProducts(params, `?${queryManufacturerAlias}`);

        return response.status(200).json({ valid: true, ...result });
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
