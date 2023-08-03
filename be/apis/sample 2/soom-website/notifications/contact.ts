import { sendEmail } from '@soom-universe/soom-api';
import { getTemplate } from '@soom-universe/soom-utils/emails';

import { validateApiKey } from '../../../../helpers/soom-website';

/**
 * @swagger
 * /api/soom-website/notifications/contact:
 *  post:
 *    description: Send contact form notifications
 *    operationId: contactFormNotification
 *    tags:
 *      - Notifications
 *    security:
 *      - apiKey: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/x-www-form-urlencoded:
 *          schema:
 *            type: object
 *            properties:
 *              company:
 *                type: string
 *                description: company name
 *              name:
 *                type: string
 *                description: user name
 *              phone:
 *                type: string
 *                description: user phone
 *              email:
 *                type: string
 *                description: user email
 *              message:
 *                type: string
 *                description: message to admin
 *            required:
 *              - company
 *              - name
 *              - phone
 *              - email
 *              - message
 *    responses:
 *      200:
 *        description: Notification sent successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/responses/notifications/contact'
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
        if (!body.company || !body.name || !body.phone || !body.email || !body.message) {
          return response.status(400).json({
            valid: false,
            message: `Invalid params`,
            params: {
              company: !body.company ? `Company name is required` : undefined,
              name: !body.name ? `Name is required` : undefined,
              phone: !body.phone ? `Phone is required` : undefined,
              email: !body.email ? `Email is required` : undefined,
              message: !body.message ? `A message is required` : undefined
            }
          });
        }

        const { company, name, phone, email, message } = body;
        const toEmail = process.env.SOOM_WEBSITE_NOTIFICATIONS_TO_ADMIN_EMAIL;
        const fromEmail = process.env.SOOM_WEBSITE_NOTIFICATIONS_FROM_EMAIL;

        // admin notification (request)
        // render the email
        const htmlAdmin = await getTemplate('soom-website-contact-admin', {
          company,
          name,
          phone,
          email,
          message
        });
        // send the email
        const emailAdmin = await sendEmail({
          Destination: toEmail,
          HtmlPart: htmlAdmin,
          TextPart: '',
          SubjectPart: `Soom - New Contact Message`,
          Source: fromEmail
        });
        if (!emailAdmin) {
          return response.status(400).json({ valid: false, message: `An error has ocurred, please try again` });
        }

        if (email) {
          // user notification (message received)
          try {
            // render the email
            const htmlUser = await getTemplate('soom-website-contact-user', {
              company,
              name,
              phone,
              email,
              message
            });
            // send the email
            await sendEmail({
              Destination: email,
              HtmlPart: htmlUser,
              TextPart: '',
              SubjectPart: `Soom - Contact Message Received`,
              Source: fromEmail
            });
          } catch (e) {
            console.error(e);
          }
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
      response.setHeader('Allow', ['POST']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
};

export default handler;
