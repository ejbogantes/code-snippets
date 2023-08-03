import { validateApiKey } from '../../../../../helpers/soomsafety';
import { prismaRead, prismaWrite } from '../../../../../db';

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
        const limit = query.limit ? parseInt(query.limit) : undefined;
        const offset = query.offset ? parseInt(query.offset) : undefined;

        const where = { user_id: userId, deleted_at: null };

        const devices = await prismaRead.ssfUserDevice.findMany({
          orderBy: [{ created_at: 'desc' }],
          take: limit,
          skip: offset,
          where,
          select: {
            user_device_id: true,
            user_id: true,
            token: true,
            created_at: true,
            updated_at: true
          }
        });

        const total = await prismaRead.ssfUserDevice.count({ where });
        const pagination = { total: total || 0, count: devices ? devices.length : 0 };

        return response.status(200).json({ valid: true, data: devices || [], pagination });
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
        if (!body.user_id || !body.device_id || !body.device_token) {
          return response.status(400).json({
            valid: false,
            message: `Invalid params`,
            params: {
              user_id: !body.user_id ? `User ID is required` : undefined,
              device_id: !body.device_id ? `Device ID is required` : undefined,
              device_token: !body.device_token ? `Device Token is required` : undefined
            }
          });
        }

        const userId = parseInt(body.user_id);

        // get user
        const user = await prismaRead.ssfUser.findFirst({
          where: { user_id: userId, enabled: true, deleted_at: null }
        });
        if (!user) {
          return response.status(404).json({ valid: false, message: `Invalid user` });
        }

        // check barcode exist
        const deviceExist = await prismaRead.ssfUserDevice.findUnique({
          where: { user_device_id: body.device_id }
        });

        let resultSave;
        if (deviceExist) {
          resultSave = await prismaWrite.ssfUserDevice.update({
            where: { user_device_id: body.device_id },
            data: {
              user_id: user.user_id,
              token: body.device_token
            }
          });
        } else {
          resultSave = await prismaWrite.ssfUserDevice.create({
            data: {
              user_device_id: body.device_id,
              user_id: user.user_id,
              token: body.device_token
            }
          });
        }

        if (!resultSave) {
          return response.status(400).json({ valid: false, message: `An error has ocurred, please try again` });
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
      response.setHeader('Allow', ['GET', 'POST']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
};

export default handler;
