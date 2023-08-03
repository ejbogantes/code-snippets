import { validateApiKey, getBarcodeInfo } from '../../../../helpers/soomsafety';
import { prismaRead } from '../../../../db';

/**
 * @swagger
 * /api/soomsafety/users/barcode:
 *  get:
 *    description: Get barcode information for a user
 *    operationId: getUserBarcode
 *    tags:
 *      - Users
 *    security:
 *      - apiKey: []
 *    parameters:
 *      - in: query
 *        name: user_id
 *        schema:
 *          type: integer
 *        required: true
 *        description: user id from login response
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
 *              oneOf:
 *                - $ref: '#/definitions/responses/users/barcodePatient'
 *                - $ref: '#/definitions/responses/users/barcodeManufacturer'
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
        if (!query.user_id || !query.barcode) {
          return response.status(400).json({
            valid: false,
            message: `Invalid params`,
            params: {
              user_id: !query.user_id ? `User ID is required` : undefined,
              barcode: !query.barcode ? `Barcode is required` : undefined
            }
          });
        }

        const userId = parseInt(query.user_id);

        const user = await prismaRead.ssfUser.findFirst({
          where: { user_id: userId, enabled: true, deleted_at: null }
        });
        if (!user) {
          return response.status(404).json({ valid: false, message: `Invalid user` });
        }

        const barcodeResponse = await getBarcodeInfo(query.barcode, user.type);

        const deviceSaved = await prismaRead.ssfDevice.findFirst({
          where: { user_id: user.user_id, barcode: query.barcode }
        });
        barcodeResponse.saved = Boolean(deviceSaved);

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
      response.setHeader('Allow', ['GET', 'POST']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
};

export default handler;
