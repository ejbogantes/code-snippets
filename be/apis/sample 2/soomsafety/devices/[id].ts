import { validateApiKey, getBarcodeInfo, formatDevice } from '../../../../helpers/soomsafety';
import { prismaWrite, prismaRead } from '../../../../db';

/**
 * @swagger
 * /api/soomsafety/devices/{id}:
 *  get:
 *    description: Get device information
 *    operationId: getDevice
 *    tags:
 *      - Devices
 *    security:
 *      - apiKey: []
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: integer
 *        required: true
 *        description: device id
 *      - in: query
 *        name: user_id
 *        schema:
 *          type: integer
 *        required: true
 *        description: user id from login response
 *    responses:
 *      200:
 *        description: Device found
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/responses/devices/getOne'
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
 * /api/soomsafety/devices/{id}:
 *  put:
 *    description: Update device information
 *    operationId: editDevice
 *    tags:
 *      - Devices
 *    security:
 *      - apiKey: []
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: integer
 *        required: true
 *        description: device id
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
 *              device_group_id:
 *                type: integer
 *                description: device group id (empty to remove the group id relation)
 *            required:
 *              - user_id
 *    responses:
 *      200:
 *        description: Device updated successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/responses/devices/edit'
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
 * /api/soomsafety/devices/{id}:
 *  delete:
 *    description: Delete device
 *    operationId: deleteDevice
 *    tags:
 *      - Devices
 *    security:
 *      - apiKey: []
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: integer
 *        required: true
 *        description: device id
 *      - in: query
 *        name: user_id
 *        schema:
 *          type: integer
 *        required: true
 *        description: user id from login response
 *    responses:
 *      200:
 *        description: Device deleted successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/responses/devices/delete'
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
        const id = parseInt(query.id);

        const device = await prismaRead.ssfDevice.findFirst({
          where: { user_id: userId, device_id: id, deleted_at: null },
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
            },
            user: {
              select: {
                user_id: true,
                type: true
              }
            }
          }
        });
        if (!device) {
          return response.status(404).json({ valid: false, message: `Device not found` });
        }

        const barcodeResponse = await getBarcodeInfo(device.barcode, device.user.type);

        delete device.user;

        return response.status(200).json({ valid: true, data: formatDevice(device), barcode: barcodeResponse.data });
      } catch (error) {
        console.error(error);
        let statusCode = 500;
        if (error.name === 'ValidationError') {
          statusCode = 400;
        }
        response.status(statusCode).json({ valid: false, message: error.message });
      }
      break;
    case 'PUT':
      try {
        if (!body.user_id) {
          return response
            .status(400)
            .json({ valid: false, message: `Invalid params`, params: { user_id: `User ID is required` } });
        }

        const userId = parseInt(body.user_id);
        const deviceGroupId = body.device_group_id ? parseInt(body.device_group_id) : null;
        const id = parseInt(query.id);

        // get user
        const user = await prismaRead.ssfUser.findFirst({
          where: { user_id: userId, enabled: true, deleted_at: null }
        });
        if (!user) {
          return response.status(404).json({ valid: false, message: `Invalid user` });
        }

        // get device group
        if (deviceGroupId) {
          const deviceGroup = await prismaRead.ssfDeviceGroup.findFirst({
            where: { user_id: userId, device_group_id: deviceGroupId, deleted_at: null }
          });
          if (!deviceGroup) {
            return response.status(404).json({ valid: false, message: `Invalid device group` });
          }
        }

        // update device
        const device = await prismaWrite.ssfDevice.update({
          data: { device_group_id: deviceGroupId },
          where: { device_id: id }
        });
        if (!device) {
          return response.status(400).json({ valid: false, message: `An error has ocurred, please try again` });
        }

        const deviceResponse = await prismaRead.ssfDevice.findFirst({
          where: { user_id: userId, device_id: id, deleted_at: null },
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

        return response.status(200).json({ valid: true, data: formatDevice(deviceResponse) });
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
        if (!query.user_id) {
          return response
            .status(400)
            .json({ valid: false, message: `Invalid params`, params: { user_id: `User ID is required` } });
        }

        const userId = parseInt(query.user_id);
        const id = parseInt(query.id);

        const device = await prismaRead.ssfDevice.findFirst({
          where: { device_id: id, user_id: userId }
        });
        if (!device) {
          return response.status(404).json({ valid: false, message: `Invalid device` });
        }

        const deleteResult = await prismaWrite.ssfDevice.delete({
          where: { device_id: device.device_id }
        });

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
      response.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
};

export default handler;
