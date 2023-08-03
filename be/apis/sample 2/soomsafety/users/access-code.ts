import moment from 'moment';

import { validateApiKey } from '../../../../helpers/soomsafety';
import { randomString } from '../../../../helpers/Strings';
import { prismaWrite, prismaRead } from '../../../../db';

import { sendEmail } from '@soom-universe/soom-api';
import { getTemplate } from '@soom-universe/soom-utils/emails';

const expiredTimeForAccessCodes = 15; // mins

/**
 * @swagger
 * /api/soomsafety/users/access-code:
 *  post:
 *    description: Get the access code via email for login
 *    operationId: getAccessCode
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
 *            required:
 *              - email
 *    responses:
 *      200:
 *        description: Access code sent successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/responses/users/accessCode'
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
        if (!body.email) {
          return response
            .status(400)
            .json({ valid: false, message: `Invalid params`, params: { email: `Email is required` } });
        }

        // get access code
        let user = await prismaRead.ssfUser.findFirst({
          where: { email: body.email }
        });
        if (!user) {
          user = await prismaWrite.ssfUser.create({
            data: { email: body.email, type: null }
          });

          if (!user) {
            return response.status(400).json({ valid: false, message: `An error has ocurred, please try again` });
          }
        } else if (!user.enabled || user.deleted_at) {
          return response.status(404).json({ valid: false, message: `Invalid user` });
        }

        // get access code
        const accessCode = await getAccessCode(user);
        if (!accessCode) {
          return response.status(400).json({ valid: false, message: `An error has ocurred, please try again` });
        }

        // send access code
        const fromEmail = process.env.NOTIFICATIONS_FROM_EMAIL;
        // render the email
        const html = await getTemplate('access-code', { code: accessCode });

        // send the email
        await sendEmail({
          Destination: user.email,
          HtmlPart: html,
          TextPart: '',
          SubjectPart: `Soom | Access Code Request`,
          Source: fromEmail
        });

        return response.status(200).json({ valid: true, email: user.email, user_type_required: !user.type });
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

const getAccessCode = async (user) => {
  try {
    let accessCode = await prismaRead.ssfAccessCode.findFirst({
      where: { user_id: user.user_id }
    });

    if (accessCode && !accessCode.permanent) {
      // check for expire time
      const accessCodeDate = moment(accessCode.created_at);
      const now = moment();
      const diff = now.diff(accessCodeDate, 'minutes');
      if (diff > expiredTimeForAccessCodes) {
        await prismaWrite.ssfAccessCode.delete({
          where: { access_code_id: accessCode.access_code_id }
        });
        accessCode = null;
      }
    }

    if (!accessCode) {
      const code = randomString(6);
      accessCode = await prismaWrite.ssfAccessCode.create({
        data: { user_id: user.user_id, code }
      });
      if (!accessCode) {
        return null;
      }
    }

    return accessCode.code;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export default handler;
