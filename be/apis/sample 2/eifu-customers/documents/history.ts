import { get as _get } from 'lodash';

// api endpoint
import { getDocumentsLogs } from '@soom-universe/soom-api';

import { validateApiKey } from '../../../../helpers/eifu-customers';

/**
 * @swagger
 * /api/eifu-customers/documents/history:
 *  get:
 *    description: This endpoint retrieves the history of document (eIFU) updates.
 *    operationId: getDocumentsLogs
 *    tags:
 *      - Documents
 *    security:
 *      - apiKey: []
 *    responses:
 *      200:
 *        description: List of logs
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/responses/documents/getHistory'
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
        const params = { filterValue: customerData.configuration.bucket };

        const result = await getDocumentsLogs(params);

        return response.status(200).json({ valid: true, logs: result });
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
