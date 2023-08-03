import getConfig from 'next/config';
import moment from 'moment';

import { validateApiKey } from '../../../../helpers/soomsafety';
import { prismaRead, prismaWrite } from '../../../../db';

const {
  publicRuntimeConfig: {
    soomSafety: { userTypesLabels }
  }
} = getConfig();

const expiredTimeForAccessCodes = 15; // mins

/**
 * @swagger
 * /api/soomsafety/users/login:
 *  post:
 *    description: Login service to get user information
 *    operationId: userLogin
 *    tags:
 *      - Users
 *    security:
 *      - apiKey: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/x-www-form-urlencoded:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *                description: user email
 *              code:
 *                type: integer
 *                description: access code sent to user email
 *              type:
 *                type: integer
 *                enum: [1, 2]
 *                description: 1- Patient, 2- Manufacturer
 *            required:
 *              - email
 *              - code
 *    responses:
 *      200:
 *        description: Login success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/responses/users/login'
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
  const { method, body } = request;

  const apiKeyValidation = validateApiKey(request);
  if (!apiKeyValidation) {
    return response.status(401).json({ valid: false, message: `Unauthorized` });
  }

  switch (method) {
    case 'POST':
      try {
        if (!body.email || !body.code) {
          return response.status(400).json({
            valid: false,
            message: `Invalid params`,
            params: {
              email: !body.email ? `Email is required` : undefined,
              code: !body.code ? `Code is required` : undefined
            }
          });
        }

        // get user
        const user = await prismaRead.ssfUser.findFirst({
          where: { email: body.email, enabled: true, deleted_at: null }
        });
        if (!user) {
          return response.status(401).json({ valid: false, message: `Invalid user` });
        }

        // validation if user type is required
        const userTypeRequired = !user.type;
        if (userTypeRequired) {
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
        }

        // get access code
        const accessCode = await prismaRead.ssfAccessCode.findFirst({
          where: { user_id: user.user_id, code: body.code }
        });
        if (!accessCode) {
          return response.status(401).json({ valid: false, message: `Invalid credentials` });
        }

        // if not a permanent code then check expire time and delete the code
        if (!accessCode.permanent) {
          // check for expire time
          const accessCodeDate = moment(accessCode.created_at);
          const now = moment();
          const diff = now.diff(accessCodeDate, 'minutes');
          if (diff > expiredTimeForAccessCodes) {
            return response.status(401).json({ valid: false, message: `Access code expired` });
          }

          // delete access code
          await prismaWrite.ssfAccessCode.delete({
            where: { access_code_id: accessCode.access_code_id }
          });
        }

        // update user if user type is required
        if (userTypeRequired) {
          const userUpdated = await prismaWrite.ssfUser.update({
            data: { type: body.type },
            where: { user_id: user.user_id }
          });
          if (!userUpdated) {
            return response.status(400).json({ valid: false, message: `An error has ocurred, please try again` });
          }
          user.type = body.type;
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
    default:
      response.setHeader('Allow', ['POST']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
};

export default handler;
