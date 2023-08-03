import { get as _get } from 'lodash';

// api endpoint
import { updateStatus } from '@soom-universe/soom-api';

import { validateApiKey, updatePublishedDocument } from '../../../../../helpers/eifu-customers';
// import { prismaRead, prismaWrite } from '../../../../db';

const validStatus = ['unpublished', 'pending', 'published', 'rejected'];

/**
 * @swagger
 * /api/eifu-customers/documents/{id}/status:
 *  put:
 *    description: This endpoint updates the status of a specific document (eIFU).
 *    operationId: setDocumentStatus
 *    tags:
 *      - Documents
 *    security:
 *      - apiKey: []
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: document id
 *    requestBody:
 *      required: true
 *      content:
 *        application/x-www-form-urlencoded:
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: string
 *                enum: [unpublished, pending, published, rejected]
 *                description: status value to change
 *              edit_reason:
 *                type: string
 *                description: reason for document status change
 *              reject_reason:
 *                type: string
 *                description: reason for rejection of the document
 *            required:
 *              - status
 *    responses:
 *      200:
 *        description: Document status changed successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/responses/documents/editStatus'
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

  const customerData = await validateApiKey(request);
  if (!customerData) {
    return response.status(401).json({ valid: false, message: `Unauthorized` });
  }

  switch (method) {
    case 'PUT':
      try {
        if (!body.status) {
          return response.status(400).json({
            valid: false,
            message: `Invalid params`,
            params: {
              status: !body.status ? `Status is required` : undefined
            }
          });
        } else if (!validStatus.includes(body.status)) {
          return response.status(400).json({
            valid: false,
            message: `Invalid params`,
            params: {
              status: `Invalid status (${validStatus.join(', ')})`
            }
          });
        }

        if (body.status === 'rejected' && !body.reject_reason) {
          return response.status(400).json({
            valid: false,
            message: `Invalid params`,
            params: {
              reject_reason: `Reject reason is required`
            }
          });
        } else if (body.status !== 'rejected' && !body.edit_reason) {
          return response.status(400).json({
            valid: false,
            message: `Invalid params`,
            params: {
              edit_reason: `Edit reason is required`
            }
          });
        }

        const params = {
          bucket: customerData.configuration.bucket,
          s3_region: 'us-east-1',
          status_to: body.status,
          key: [query.id],
          email: customerData.configuration.notifications_email,
          edit_reason: body.edit_reason ? body.edit_reason : undefined,
          reject_reason: body.reject_reason ? body.reject_reason : undefined
        };

        await updateStatus(params);

        if (body.status === 'published') {
          await updatePublishedDocument(customerData.configuration.configuration_id, query.id, 'save');
        }

        return response.status(200).json({ valid: true });
      } catch (error) {
        console.error(error);
        const statusCode = _get(error, 'response.status', 500);
        const message = _get(error, 'response.data.message', error.message);
        response.status(statusCode).json({ valid: false, message });
      }
      break;
    default:
      response.setHeader('Allow', ['PUT']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
};

export default handler;
