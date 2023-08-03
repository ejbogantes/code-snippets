import getConfig from 'next/config';

import { validateApiKey, getBarcodeInfo } from '../../../../helpers/soomsafety';

const {
  publicRuntimeConfig: {
    soomSafety: { userTypes }
  }
} = getConfig();

/**
 * @swagger
 * /api/soomsafety/guest/barcode:
 *  get:
 *    description: Get barcode information for a guest user
 *    operationId: getGuestBarcode
 *    tags:
 *      - Guest
 *    security:
 *      - apiKey: []
 *    parameters:
 *      - in: query
 *        name: barcode
 *        schema:
 *          type: string
 *        required: true
 *        description: barcode to search for information
 *    responses:
 *      200:
 *        description: Barcode information found
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/responses/guest/barcode'
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

  const apiKeyValidation = validateApiKey(request);
  if (!apiKeyValidation) {
    return response.status(401).json({ valid: false, message: `Unauthorized` });
  }

  switch (method) {
    case 'GET':
      try {
        if (!query.barcode) {
          return response
            .status(400)
            .json({ valid: false, message: `Invalid params`, params: { barcode: `Barcode is required` } });
        }

        const barcodeResponse = await getBarcodeInfo(query.barcode, userTypes.patient);

        return response.status(200).json(barcodeResponse);
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
      response.setHeader('Allow', ['GET']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
};

export default handler;
