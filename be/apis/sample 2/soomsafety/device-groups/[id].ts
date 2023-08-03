import { validateApiKey } from '../../../../helpers/soomsafety';
import { prismaWrite, prismaRead } from '../../../../db';

/**
 * @swagger
 * /api/soomsafety/device-groups/{id}:
 *  get:
 *    description: Get device group information
 *    operationId: getDeviceGroup
 *    tags:
 *      - Device Groups
 *    security:
 *      - apiKey: []
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: integer
 *        required: true
 *        description: device group id
 *      - in: query
 *        name: user_id
 *        schema:
 *          type: integer
 *        required: true
 *        description: user id from login response
 *    responses:
 *      200:
 *        description: Device group found
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/responses/deviceGroups/getOne'
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
 * /api/soomsafety/device-groups/{id}:
 *  put:
 *    description: Update device group information
 *    operationId: editDeviceGroup
 *    tags:
 *      - Device Groups
 *    security:
 *      - apiKey: []
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: integer
 *        required: true
 *        description: device group id
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
 *              name:
 *                type: string
 *                description: device group name
 *            required:
 *              - user_id
 *              - name
 *    responses:
 *      200:
 *        description: Device group updated successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/responses/deviceGroups/edit'
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
 * /api/soomsafety/device-groups/{id}:
 *  delete:
 *    description: Delete device group
 *    operationId: deleteDeviceGroup
 *    tags:
 *      - Device Groups
 *    security:
 *      - apiKey: []
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: integer
 *        required: true
 *        description: device group id
 *      - in: query
 *        name: user_id
 *        schema:
 *          type: integer
 *        required: true
 *        description: user id from login response
 *    responses:
 *      200:
 *        description: Device group deleted successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/responses/deviceGroups/delete'
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

        const group = await prismaRead.ssfDeviceGroup.findFirst({
          where: { device_group_id: id, user_id: userId, deleted_at: null },
          select: {
            device_group_id: true,
            name: true
          }
        });

        if (!group) {
          return response.status(404).json({ valid: false, message: `Group not found` });
        }

        return response.status(200).json({ valid: true, data: group });
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
        if (!body.user_id || !body.name) {
          return response.status(400).json({
            valid: false,
            message: `Invalid params`,
            params: {
              user_id: !body.user_id ? `User ID is required` : undefined,
              name: !body.name ? `Name is required` : undefined
            }
          });
        }

        const userId = parseInt(body.user_id);
        const id = parseInt(query.id);

        // get access code
        const user = await prismaRead.ssfUser.findFirst({
          where: { user_id: userId, enabled: true, deleted_at: null }
        });
        if (!user) {
          return response.status(404).json({ valid: false, message: `Invalid user` });
        }

        const group = await prismaWrite.ssfDeviceGroup.update({
          data: { name: body.name },
          where: { device_group_id: id }
        });
        if (!group) {
          return response.status(400).json({ valid: false, message: `An error has ocurred, please try again` });
        }

        return response.status(200).json({ valid: true, data: group });
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

        const group = await prismaRead.ssfDeviceGroup.findFirst({
          where: { device_group_id: id, user_id: userId }
        });

        if (!group) {
          return response.status(404).json({ valid: false, message: `Invalid group` });
        }

        await prismaWrite.ssfDevice.updateMany({
          data: { device_group_id: null },
          where: { device_group_id: id }
        });

        const deleteResult = await prismaWrite.ssfDeviceGroup.delete({
          where: { device_group_id: group.device_group_id }
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
