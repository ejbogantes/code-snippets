import { validateApiKey } from '../../../../helpers/soomsafety';
import { prismaWrite, prismaRead } from '../../../../db';

/**
 * @swagger
 * /api/soomsafety/device-groups:
 *  get:
 *    description: Get user device groups
 *    operationId: getDeviceGroups
 *    tags:
 *      - Device Groups
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
 *        description: List of user device groups
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/responses/deviceGroups/get'
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
 * /api/soomsafety/device-groups:
 *  post:
 *    description: Save device group for a user
 *    operationId: saveDeviceGroup
 *    tags:
 *      - Device Groups
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
 *              name:
 *                type: string
 *                description: device group name
 *            required:
 *              - user_id
 *              - name
 *    responses:
 *      200:
 *        description: Device group saved successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/responses/deviceGroups/save'
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
        const limit = query.limit ? parseInt(query.limit) : undefined;
        const offset = query.offset ? parseInt(query.offset) : undefined;

        const where = { user_id: userId, device_group_id: id, deleted_at: null };

        const groups = await prismaRead.ssfDeviceGroup.findMany({
          take: limit,
          skip: offset,
          where,
          select: {
            device_group_id: true,
            name: true
          }
        });

        const total = await prismaRead.ssfDeviceGroup.count({ where });
        const pagination = { total: total || 0, count: groups ? groups.length : 0 };

        return response.status(200).json({ valid: true, data: groups || [], pagination });
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

        // get access code
        const user = await prismaRead.ssfUser.findFirst({
          where: { user_id: userId, enabled: true, deleted_at: null }
        });
        if (!user) {
          return response.status(404).json({ valid: false, message: `Invalid user` });
        }

        const group = await prismaWrite.ssfDeviceGroup.create({
          data: { user_id: user.user_id, name: body.name }
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
    default:
      response.setHeader('Allow', ['GET', 'POST']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
};

export default handler;
