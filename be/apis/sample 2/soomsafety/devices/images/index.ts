import { validateApiKey, formatDeviceImage } from '../../../../../helpers/soomsafety';
import { prismaRead, prismaWrite } from '../../../../../db';

/**
 * @swagger
 * /api/soomsafety/devices/images:
 *  post:
 *    description: Save a device image
 *    operationId: saveDeviceImage
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
 *              device_id:
 *                type: string
 *                description: device id
 *              image_key:
 *                type: string
 *                description: image key from upload data response
 *            required:
 *              - user_id
 *              - device_id
 *              - image_key
 *    responses:
 *      200:
 *        description: Device image saved successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/responses/deviceImages/save'
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
 * /api/soomsafety/devices/images:
 *  delete:
 *    description: Delete a device image
 *    operationId: deleteDeviceImage
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
 *        name: device_id
 *        schema:
 *          type: integer
 *        required: true
 *        description: device id
 *      - in: query
 *        name: device_image_id
 *        schema:
 *          type: integer
 *        required: true
 *        description: device image id
 *    responses:
 *      200:
 *        description: Device image deleted successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/responses/deviceImages/delete'
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
  const { method, body, query } = request;

  const apiKeyValidation = validateApiKey(request);
  if (!apiKeyValidation) {
    return response.status(401).json({ valid: false, message: `Unauthorized` });
  }

  switch (method) {
    case 'POST':
      try {
        if (!body.user_id || !body.device_id || !body.image_key) {
          return response.status(400).json({
            valid: false,
            message: `Invalid params`,
            params: {
              user_id: !body.user_id ? `User ID is required` : undefined,
              device_id: !body.device_id ? `Device ID is required` : undefined,
              image_key: !body.image_key ? `Image Key is required` : undefined
            }
          });
        }

        const userId = parseInt(body.user_id);
        const deviceId = parseInt(body.device_id);

        // get user
        const user = await prismaRead.ssfUser.findFirst({
          where: { user_id: userId, enabled: true, deleted_at: null }
        });
        if (!user) {
          return response.status(404).json({ valid: false, message: `Invalid user` });
        }

        // get device
        const device = await prismaRead.ssfDevice.findFirst({
          where: { user_id: userId, device_id: deviceId }
        });
        if (!device) {
          return response.status(404).json({ valid: false, message: `Invalid device` });
        }

        const image = await prismaWrite.ssfDeviceImage.create({
          data: {
            device_id: device.device_id,
            key: body.image_key
          }
        });
        if (!image) {
          return response.status(400).json({ valid: false, message: `An error has ocurred, please try again` });
        }

        delete image.device_id;
        delete image.created_at;
        delete image.updated_at;
        delete image.deleted_at;

        return response.status(200).json({ valid: true, data: formatDeviceImage(image) });
      } catch (error) {
        console.error(error);
        let statusCode = 500;
        if (error.name === 'ValidationError') {
          statusCode = 400;
        }
        response.status(statusCode).json({ valid: false, message: error.message });
      }
      break;
    case 'DELETE':
      try {
        if (!query.user_id || !query.device_id || !query.device_image_id) {
          return response.status(400).json({
            valid: false,
            message: `Invalid params`,
            params: {
              user_id: !query.user_id ? `User ID is required` : undefined,
              device_id: !query.device_id ? `Device ID is required` : undefined,
              device_image_id: !query.device_image_id ? `At least 1 Image ID is required` : undefined
            }
          });
        }

        const userId = parseInt(query.user_id);
        const deviceId = parseInt(query.device_id);

        // get user
        const user = await prismaRead.ssfUser.findFirst({
          where: { user_id: userId, enabled: true, deleted_at: null }
        });
        if (!user) {
          return response.status(404).json({ valid: false, message: `Invalid user` });
        }

        // get device
        const device = await prismaRead.ssfDevice.findFirst({
          where: { user_id: userId, device_id: deviceId }
        });
        if (!device) {
          return response.status(404).json({ valid: false, message: `Invalid device` });
        }

        const where = { device_id: deviceId, device_image_id: query.device_image_id };
        if (Array.isArray(query.device_image_id)) {
          where.device_image_id = {
            in: query.device_image_id.map((id) => {
              return parseInt(id);
            })
          };
        } else {
          where.device_image_id = parseInt(query.device_image_id);
        }

        const deleteResult = await prismaWrite.ssfDeviceImage.deleteMany({ where });
        if (!deleteResult) {
          return response.status(400).json({ valid: false, message: `An error has ocurred, please try again` });
        }

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
      response.setHeader('Allow', ['POST', 'DELETE']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
};

export default handler;
