import { validateApiKey, getBarcodeInfo, formatDevice } from '../../../../helpers/soomsafety';
import { prismaRead, prismaWrite } from '../../../../db';

/**
 * @swagger
 * /api/soomsafety/devices:
 *  get:
 *    description: Get user devices
 *    operationId: getDevices
 *    tags:
 *      - Devices
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
 *        name: id
 *        schema:
 *          type: integer
 *        description: device id (filter)
 *      - in: query
 *        name: device_group_id
 *        schema:
 *          type: integer
 *        description: device group id (filter)
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *        description: limit (pagination)
 *      - in: query
 *        name: offset
 *        schema:
 *          type: integer
 *        description: offset (pagination)
 *    responses:
 *      200:
 *        description: List of user devices
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/responses/devices/get'
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

/**
 * @swagger
 * /api/soomsafety/devices:
 *  post:
 *    description: Save device for a user
 *    operationId: saveDevice
 *    tags:
 *      - Devices
 *    security:
 *      - apiKey: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/x-www-form-urlencoded:
 *          schema:
 *            type: object
 *            properties:
 *              user_id:
 *                type: integer
 *                description: user id from login response
 *              barcode:
 *                type: string
 *                description: device barcode
 *            required:
 *              - user_id
 *              - barcode
 *    responses:
 *      200:
 *        description: Device saved successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/responses/devices/save'
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
  const { method, query, body } = request;

  const apiKeyValidation = validateApiKey(request);
  if (!apiKeyValidation) {
    return response.status(401).json({ valid: false, message: `Unauthorized` });
  }

  switch (method) {
    case 'GET':
      try {
        if (!query.user_id) {
          return response
            .status(400)
            .json({ valid: false, message: `Invalid params`, params: { user_id: `User ID is required` } });
        }

        const userId = parseInt(query.user_id);
        const id = query.id ? parseInt(query.id) : undefined;
        const deviceGroupId = query.device_group_id ? parseInt(query.device_group_id) : undefined;
        const limit = query.limit ? parseInt(query.limit) : undefined;
        const offset = query.offset ? parseInt(query.offset) : undefined;

        const where = { user_id: userId, device_id: id, device_group_id: deviceGroupId, deleted_at: null };

        const devices = await prismaRead.ssfDevice.findMany({
          orderBy: [{ created_at: 'desc' }],
          take: limit,
          skip: offset,
          where,
          select: {
            device_id: true,
            user_id: true,
            device_group_id: true,
            barcode: true,
            brand_name: true,
            description: true,
            model_number: true,
            device_group: {
              select: {
                device_group_id: true,
                name: true
              }
            },
            device_images: {
              select: {
                device_image_id: true,
                key: true
              }
            }
          }
        });

        const total = await prismaRead.ssfDevice.count({ where });
        const pagination = { total: total || 0, count: devices ? devices.length : 0 };

        return response.status(200).json({ valid: true, data: formatDevice(devices) || [], pagination });
      } catch (error) {
        console.error(error);
        let statusCode = 500;
        if (error.name === 'ValidationError') {
          statusCode = 400;
        }
        response.status(statusCode).json({ valid: false, message: error.message });
      }
      break;
    case 'POST':
      try {
        if (!body.user_id || !body.barcode) {
          return response.status(400).json({
            valid: false,
            message: `Invalid params`,
            params: {
              user_id: !body.user_id ? `User ID is required` : undefined,
              barcode: !body.barcode ? `Barcode is required` : undefined
            }
          });
        }

        const userId = parseInt(body.user_id);

        // get user
        const user = await prismaRead.ssfUser.findFirst({
          where: { user_id: userId, enabled: true, deleted_at: null }
        });
        if (!user) {
          return response.status(404).json({ valid: false, message: `Invalid user` });
        }

        // check barcode exist
        const deviceExist = await prismaRead.ssfDevice.findFirst({
          where: { user_id: userId, barcode: body.barcode }
        });
        if (deviceExist) {
          return response.status(400).json({ valid: false, message: `Device already exist` });
        }

        // get barcode info
        const barcodeResponse = await getBarcodeInfo(body.barcode, user.type);
        if (!barcodeResponse.valid) {
          return response.status(404).json({ valid: false, message: `Invalid barcode` });
        }

        const details = barcodeResponse.data.details || {};
        const description = details.standardized_description || 'N/A';

        const device = await prismaWrite.ssfDevice.create({
          data: {
            user_id: user.user_id,
            barcode: body.barcode,
            brand_name: details.brand_name || 'N/A',
            description: Array.isArray(description) ? description[0] : description,
            model_number: details.model_number || 'N/A'
          }
        });
        if (!device) {
          return response.status(400).json({ valid: false, message: `An error has ocurred, please try again` });
        }

        return response.status(200).json({ valid: true, data: device, barcode: barcodeResponse.data });
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
