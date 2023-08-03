import { get as _get } from 'lodash';

import { getNewDocumentId } from '@soom-universe/soom-utils/functions';

import { validateApiKey } from '../../../../helpers/eifu-customers';
import { getDocumentUploadUrl } from '../../../../helpers/S3';

/**
 * @swagger
 * /api/eifu-customers/documents/upload-data:
 *  get:
 *    description: This endpoint retrieves the upload data required to upload a document file to the server. To upload the file follow these guidelines in AWS, https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html
 *    operationId: getDocumentUploadData
 *    tags:
 *      - Documents
 *    security:
 *      - apiKey: []
 *    responses:
 *      200:
 *        description: Data use for upload and create new document
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/responses/documents/getUploadData'
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
  const { method } = request;

  const customerData = await validateApiKey(request);
  if (!customerData) {
    return response.status(401).json({ valid: false, message: `Unauthorized` });
  }

  switch (method) {
    case 'GET':
      try {
        const bucket = customerData.configuration.bucket;
        const documentId = getNewDocumentId(customerData.configuration.configuration_id);
        const key = `unpublished/${documentId}`;
        const contentType = `application/pdf`;

        const url = await getDocumentUploadUrl(bucket, key, contentType);
        if (!url) {
          return response.status(400).json({ valid: false, message: `An error has ocurred, please try again` });
        }

        return response
          .status(200)
          .json({ valid: true, data: { url, content_type: contentType, document_id: documentId } });
      } catch (error) {
        console.error(error);
        const statusCode = _get(error, 'response.status', 500);
        const message = _get(error, 'response.data.message', error.message);
        response.status(statusCode).json({ valid: false, message });
      }
      break;
    default:
      response.setHeader('Allow', ['GET']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
};

export default handler;
