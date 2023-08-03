import { get as _get } from 'lodash';

// api endpoint
import { listDocuments, createDocument } from '@soom-universe/soom-api';

import { validateApiKey, getBooleanValue } from '../../../../helpers/eifu-customers';
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
 * /api/eifu-customers/documents:
 *  get:
 *    description: This endpoint retrieves a list of documents (eIFUs).
 *    operationId: getDocuments
 *    tags:
 *      - Documents
 *    security:
 *      - apiKey: []
 *    parameters:
 *      - in: query
 *        name: search
 *        schema:
 *          type: string
 *        description: search term (filter)
 *      - in: query
 *        name: status[]
 *        schema:
 *          type: array
 *          items:
 *            schema:
 *              type: string
 *            enum: [unpublished, pending, published, rejected]
 *          collectionFormat: multi
 *        description: status (filter)
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *        description: limit (pagination - default 50)
 *      - in: query
 *        name: offset
 *        schema:
 *          type: integer
 *        description: offset (pagination - default 0)
 *    responses:
 *      200:
 *        description: List of documents
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/responses/documents/get'
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
 * /api/eifu-customers/documents:
 *  post:
 *    description: This endpoint creates a new document (eIFU).
 *    operationId: createDocument
 *    tags:
 *      - Documents
 *    security:
 *      - apiKey: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/x-www-form-urlencoded:
 *          schema:
 *            type: object
 *            properties:
 *              document_id:
 *                type: string
 *                description: document id obtained in endpoint "/api/eifu-customers/documents/upload-data"
 *              document_number:
 *                type: string
 *                description: document number
 *              document_name:
 *                type: string
 *                description: document name
 *              revision:
 *                type: string
 *                description: document revision
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
 *                description: document audience value (patient = 'Patients', clinician = 'Healthcare Professionals')
 *              safety_update:
 *                type: boolean
 *                description: document safety update
 *            required:
 *              - document_id
 *              - document_number
 *              - document_name
 *              - revision
 *              - type
 *              - brand_name
 *              - audience
 *              - safety_update
 *    responses:
 *      200:
 *        description: Document created successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/responses/documents/new'
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
        const search = query.search;
        const status = query['status[]']
          ? Array.isArray(query['status[]'])
            ? query['status[]']
            : [query['status[]']]
          : undefined;
        const limit = query.limit ? parseInt(query.limit) : 50;
        const offset = query.offset ? parseInt(query.offset) : 0;

        const params = {
          filterBy: 'bucket',
          filterValue: customerData.configuration.bucket,
          pagination: true,
          skip: offset,
          limit,
          searchTerm: undefined,
          searchMethod: undefined,
          statuses: undefined
        };

        if (search) {
          params.searchTerm = search;
        }

        if (status) {
          params.statuses = JSON.stringify(status);
        }

        const result = await listDocuments(params);

        return response.status(200).json({ valid: true, ...result });
      } catch (error) {
        console.error(error);
        const statusCode = _get(error, 'response.status', 500);
        const message = _get(error, 'response.data.message', error.message);
        response.status(statusCode).json({ valid: false, message });
      }
      break;
    case 'POST':
      try {
        if (
          !body.document_id ||
          !body.document_number ||
          !body.document_name ||
          !body.revision ||
          !body.type ||
          !body.brand_name ||
          !body.audience ||
          !body.safety_update
        ) {
          return response.status(400).json({
            valid: false,
            message: `Invalid params`,
            params: {
              document_id: !body.document_id ? `Document ID is required` : undefined,
              document_number: !body.document_number ? `Document number is required` : undefined,
              document_name: !body.document_name ? `Document name is required` : undefined,
              revision: !body.revision ? `Revision is required` : undefined,
              type: !body.type ? `Type is required` : undefined,
              brand_name: !body.brand_name ? `Brand name is required` : undefined,
              audience: !body.audience ? `Audience is required` : undefined,
              safety_update: !body.safety_update ? `Safety update value is required` : undefined
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
        } else if (!validAudience[body.audience]) {
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

        const params = {
          key: body.document_id,
          document_number: body.document_number,
          document_name: body.document_name,
          revision: body.revision,
          type: body.type,
          brand_name: body.brand_name,
          alternate_brand_name: body.alternate_brand_name
            ? Array.isArray(body.alternate_brand_name)
              ? body.alternate_brand_name
              : body.alternate_brand_name.split(',')
            : [],
          cfn: body.cfn ? (Array.isArray(body.cfn) ? body.cfn : body.cfn.split(',')) : [],
          region: body.regions ? (Array.isArray(body.regions) ? body.regions : body.regions.split(',')) : [],
          language: body.languages ? (Array.isArray(body.languages) ? body.languages : body.languages.split(',')) : [],
          audience: body.audience,
          safety_update: getBooleanValue(body.safety_update),

          first_applicable_lot_number: '',
          last_applicable_lot_number: '',
          expiry_date: '',
          site_name: '',
          date_of_issue: new Date().toISOString(),

          bucket: customerData.configuration.bucket,
          s3_region: 'us-east-1',
          manufacturer: customerData.configuration.manufacturer || '',
          manufacturer_alias: customerData.configuration.manufacturer_alias.split(','),
          email: customerData.configuration.notifications_email
        };

        await createDocument(params);

        return response.status(200).json({ valid: true });
      } catch (error) {
        console.error(error);
        const statusCode = _get(error, 'response.status', 500);
        const message = _get(error, 'response.data.message', error.message);
        response.status(statusCode).json({ valid: false, message });
      }
      break;
    default:
      response.setHeader('Allow', ['GET', 'POST']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
};

export default handler;
