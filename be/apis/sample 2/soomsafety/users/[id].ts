import getConfig from 'next/config';

import { validateApiKey } from '../../../../helpers/soomsafety';
import { prismaRead, prismaWrite } from '../../../../db';

const {
  publicRuntimeConfig: {
    soomSafety: { userTypesLabels }
  }
} = getConfig();

/**
 * @swagger
 * /api/soomsafety/users/{id}:
 *  get:
 *    description: Get user information
 *    operationId: getUser
 *    tags:
 *      - Users
 *    security:
 *      - apiKey: []
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: integer
 *        required: true
 *        description: user id from login response
 *    responses:
 *      200:
 *        description: User found
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/responses/users/get'
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
 * /api/soomsafety/users/{id}:
 *  put:
 *    description: Update user information
 *    operationId: editUser
 *    tags:
 *      - Users
 *    security:
 *      - apiKey: []
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: integer
 *        required: true
 *        description: user id from login response
 *    requestBody:
 *      required: true
 *      content:
 *        application/x-www-form-urlencoded:
 *          schema:
 *            type: object
 *            properties:
 *              type:
 *                type: integer
 *                enum: [1, 2]
 *                default: 1
 *                description: values 1- Patient, 2- Manufacturer
 *            required:
 *              - type
 *    responses:
 *      200:
 *        description: User found
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/responses/users/edit'
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
        const id = parseInt(query.id);
        // get user
        const user = await prismaRead.ssfUser.findUnique({
          where: { user_id: id }
        });
        if (!user) {
          return response.status(404).json({ valid: false, message: `User not found` });
        } else if (!user.enabled || user.deleted_at) {
          return response.status(404).json({ valid: false, message: `Invalid user` });
        }

        return response
          .status(200)
          .json({ valid: true, user: { user_id: user.user_id, email: user.email, type: user.type } });
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
        if (!body.type) {
          return response.status(400).json({
            valid: false,
            message: `Invalid params`,
            params: { type: `Type is required` }
          });
        } else if (!userTypesLabels[body.type]) {
          const userTypesMsg = [];
          for (const [key, value] of Object.entries(userTypesLabels)) {
            userTypesMsg.push(`${key}: ${value}`);
          }
          return response.status(400).json({
            valid: false,
            message: `Invalid params`,
            params: { type: `Invalid value for type param (${userTypesMsg.join(', ')})` }
          });
        }

        const id = parseInt(query.id);

        // get access code
        const user = await prismaRead.ssfUser.findFirst({
          where: { user_id: id, enabled: true, deleted_at: null }
        });
        if (!user) {
          return response.status(404).json({ valid: false, message: `Invalid user` });
        }

        const userUpdated = await prismaWrite.ssfUser.update({
          data: { type: body.type },
          where: { user_id: id }
        });
        if (!userUpdated) {
          return response.status(400).json({ valid: false, message: `An error has ocurred, please try again` });
        }

        return response.status(200).json({
          valid: true,
          user: { user_id: userUpdated.user_id, email: userUpdated.email, type: userUpdated.type }
        });
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
      response.setHeader('Allow', ['GET', 'PUT']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
};

export default handler;
