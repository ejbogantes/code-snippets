import { validateApiKey } from '../../../../../helpers/soomsafety';
import { getImageUploadData } from '../../../../../helpers/S3';
import { prismaRead } from '../../../../../db';

const keyPrefix = (userId) => `${process.env.SOOM_UNIVERSE_ENVIRONMENT}/ident${userId}/`;

/**
 * @swagger
 * /api/soomsafety/devices/images/upload-data:
 *  get:
 *    description: Get data for upload an image to S3 bucket
 *    operationId: getDeviceImageUploadData
 *    tags:
 *      - Devices
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
 *        name: image_ext
 *        schema:
 *          type: string
 *        required: true
 *        description: image file extension (jpg, png, gif, etc...)
 *      - in: query
 *        name: content_type
 *        schema:
 *          type: string
 *        required: true
 *        description: image content type (image/jpeg, image/png, image/gif, etc...)
 *    responses:
 *      200:
 *        description: Data use for upload an image to S3 bucket
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/responses/deviceImages/getUploadData'
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
  const { method, query } = request;

  const apiKeyValidation = validateApiKey(request);
  if (!apiKeyValidation) {
    return response.status(401).json({ valid: false, message: `Unauthorized` });
  }

  switch (method) {
    case 'GET':
      try {
        if (!query.user_id || !query.image_ext || !query.content_type) {
          return response.status(400).json({
            valid: false,
            message: `Invalid params`,
            params: {
              user_id: !query.user_id ? `User ID is required` : undefined,
              image_ext: !query.image_ext ? `Image extension is required` : undefined,
              content_type: !query.content_type ? `Content type is required` : undefined
            }
          });
        }

        const userId = parseInt(query.user_id);

        // get user
        const user = await prismaRead.ssfUser.findFirst({
          where: { user_id: userId, enabled: true, deleted_at: null }
        });
        if (!user) {
          return response.status(404).json({ valid: false, message: `Invalid user` });
        }

        const bucket = process.env.SOOMSAFETY_S3_BUCKET;
        const prefix = keyPrefix(user.user_id);

        const data = await getImageUploadData(bucket, prefix, query.image_ext, query.content_type);
        if (!data) {
          return response.status(400).json({ valid: false, message: `An error has ocurred, please try again` });
        }

        return response.status(200).json({ valid: true, data });
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
      response.setHeader('Allow', ['GET']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
};

export default handler;
