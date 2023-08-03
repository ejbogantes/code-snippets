import { get as _get } from 'lodash';

// api endpoint
import { getDocumentData, updateDocument, editPublishedDocument, deleteDocument } from '@soom-universe/soom-api';

import { validateApiKey, getBooleanValue, updatePublishedDocument } from '../../../../helpers/eifu-customers';
// import { prismaRead, prismaWrite } from '../../../../db';

const validTypes = {
  eIFU: 'eIFU',
  doc: 'Declaration of Conformity',
  sds: 'Safety Data Sheet',
  dl: 'Distributors List'
};

const validAudience = {
  patient: 'Patients',
  clinician: 'Healthcare Professionals'
};

/**
 * @swagger
 * /api/eifu-customers/documents/{id}:
 *  get:
 *    description: This endpoint retrieves the details of a specific document (eIFU).
 *    operationId: getDocument
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
 *    responses:
 *      200:
 *        description: Document found
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/responses/documents/getOne'
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
 * /api/eifu-customers/documents/{id}:
 *  put:
 *    description: This endpoint updates the details/metadata of a specific document (eIFU).
 *    operationId: editDocumentMetadata
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
 *              type:
 *                type: string
 *                enum: [eIFU, doc, sds, dl]
 *                description: document type value (eIFU = 'eIFU', doc = 'Declaration of Conformity', sds = 'Safety Data Sheet', dl = 'Distributors List')
 *              brand_name:
 *                type: string
 *                description: document brand name
 *              alternate_brand_name:
 *                type: array
 *                items:
 *                  type: string
 *                description: document alternate brand names
 *              cfn:
 *                type: array
 *                items:
 *                  type: string
 *                description: document CFNs
 *              regions:
 *                type: array
 *                items:
 *                  type: string
 *                description: document regions
 *              languages:
 *                type: array
 *                items:
 *                  type: string
 *                description: document languages
 *              audience:
 *                type: string
 *                enum: [patient, clinician]
 *                description: document audience value (patient = 'Patients', clinician = 'Healthcare Professionals'). Required for non published documents
 *              safety_update:
 *                type: boolean
 *                description: document safety update
 *              edit_reason:
 *                type: string
 *                description: reason for editing the document. Required for published documents
 *            required:
 *              - type
 *              - brand_name
 *              - safety_update
 *    responses:
 *      200:
 *        description: Document edited successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/responses/documents/edit'
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
 * /api/eifu-customers/documents/{id}:
 *  delete:
 *    description: This endpoint deletes a specific document (eIFU).
 *    operationId: deleteDocument
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
 *      - in: query
 *        name: delete_reason
 *        schema:
 *          type: string
 *        required: true
 *        description: deletion reason
 *    responses:
 *      200:
 *        description: Document deleted successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/responses/documents/delete'
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
    case 'GET':
      try {
        const params = {
          bucket: customerData.configuration.bucket,
          key: query.id
        };

        const result = await getDocumentData(params);

        return response.status(200).json({ valid: true, document: result });
      } catch (error) {
        console.error(error);
        const statusCode = _get(error, 'response.status', 500);
        const message = _get(error, 'response.data.message', error.message);
        response.status(statusCode).json({ valid: false, message });
      }
      break;
    case 'PUT':
      try {
        // get document from server
        const document = await getDocumentData({
          bucket: customerData.configuration.bucket,
          key: query.id
        });
        if (!document) {
          return response.status(400).json({ valid: false, message: `Invalid document` });
        }

        const isPublished = document.status === 'published';

        if (
          !body.type ||
          !body.brand_name ||
          (!body.audience && !isPublished) ||
          !body.safety_update ||
          (!body.edit_reason && isPublished)
        ) {
          return response.status(400).json({
            valid: false,
            message: `Invalid params`,
            params: {
              type: !body.type ? `Type is required` : undefined,
              brand_name: !body.brand_name ? `Brand name is required` : undefined,
              audience: !body.audience && !isPublished ? `Audience is required` : undefined,
              safety_update: !body.safety_update ? `Safety update value is required` : undefined,
              edit_reason: !body.edit_reason && isPublished ? `Reason for editing the document is required` : undefined
            }
          });
        } else if (!validTypes[body.type]) {
          const typesMsg = [];
          for (const [key, value] of Object.entries(validTypes)) {
            typesMsg.push(`${key}: ${value}`);
          }
          return response.status(400).json({
            valid: false,
            message: `Invalid params`,
            params: { type: `Invalid value for type param (${typesMsg.join(', ')})` }
          });
        } else if (body.audience && !validAudience[body.audience] && !isPublished) {
          const audienceMsg = [];
          for (const [key, value] of Object.entries(validAudience)) {
            audienceMsg.push(`${key}: ${value}`);
          }
          return response.status(400).json({
            valid: false,
            message: `Invalid params`,
            params: { audience: `Invalid value for audience param (${audienceMsg.join(', ')})` }
          });
        }

        if (isPublished) {
          const params = {
            type: body.type,
            brand_name: body.brand_name,
            alternate_brand_name: body.alternate_brand_name
              ? Array.isArray(body.alternate_brand_name)
                ? body.alternate_brand_name
                : body.alternate_brand_name.split(',')
              : [],
            cfn: body.cfn ? (Array.isArray(body.cfn) ? body.cfn : body.cfn.split(',')) : [],
            region: body.regions ? (Array.isArray(body.regions) ? body.regions : body.regions.split(',')) : [],
            language: body.languages
              ? Array.isArray(body.languages)
                ? body.languages
                : body.languages.split(',')
              : [],
            safety_update: getBooleanValue(body.safety_update),

            edit_reason: `Published again by ${customerData.configuration.notifications_email}. Reason: ${body.edit_reason}`,

            bucket: customerData.configuration.bucket,
            s3_region: 'us-east-1',
            manufacturer: customerData.configuration.manufacturer || '',
            manufacturer_alias: customerData.configuration.manufacturer_alias.split(','),
            key: query.id,
            email: customerData.configuration.notifications_email
          };

          await editPublishedDocument(params);
        } else {
          const params = {
            type: body.type,
            brand_name: body.brand_name,
            alternate_brand_name: body.alternate_brand_name
              ? Array.isArray(body.alternate_brand_name)
                ? body.alternate_brand_name
                : body.alternate_brand_name.split(',')
              : [],
            cfn: body.cfn ? (Array.isArray(body.cfn) ? body.cfn : body.cfn.split(',')) : [],
            region: body.regions ? (Array.isArray(body.regions) ? body.regions : body.regions.split(',')) : [],
            language: body.languages
              ? Array.isArray(body.languages)
                ? body.languages
                : body.languages.split(',')
              : [],
            audience: body.audience,
            safety_update: getBooleanValue(body.safety_update),

            document_number: document.documentNumber,
            revision: document.revision,
            first_applicable_lot_number: document.firstApplicableLotNumber || '',
            last_applicable_lot_number: document.lastApplicableLotNumber || '',
            expiry_date: document.expiryDate || '',
            site_name: document.siteName || '',
            document_name: document.documentName,
            date_of_issue: document.dateOfIssue,

            bucket: customerData.configuration.bucket,
            s3_region: 'us-east-1',
            manufacturer: customerData.configuration.manufacturer || '',
            manufacturer_alias: customerData.configuration.manufacturer_alias.split(','),
            key: query.id,
            email: customerData.configuration.notifications_email
          };

          await updateDocument(params);
        }

        return response.status(200).json({ valid: true });
      } catch (error) {
        console.error(error);
        const statusCode = _get(error, 'response.status', 500);
        const message = _get(error, 'response.data.message', error.message);
        response.status(statusCode).json({ valid: false, message });
      }
      break;
    case 'DELETE':
      try {
        if (!query.delete_reason) {
          return response.status(400).json({
            valid: false,
            message: `Invalid params`,
            params: {
              delete_reason: !query.delete_reason ? `Deletion reason is required` : undefined
            }
          });
        }

        const params = {
          bucket: customerData.configuration.bucket,
          delete_reason: query.delete_reason,
          s3_region: 'us-east-1',
          hard: false,
          key: [query.id],
          email: customerData.configuration.notifications_email
        };

        await deleteDocument(params);

        await updatePublishedDocument(customerData.configuration.configuration_id, query.id, 'delete');

        return response.status(200).json({ valid: true });
      } catch (error) {
        console.error(error);
        const statusCode = _get(error, 'response.status', 500);
        const message = _get(error, 'response.data.message', error.message);
        response.status(statusCode).json({ valid: false, message });
      }
      break;
    default:
      response.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
};

export default handler;
