import { validateApiKey } from '../../../../../helpers/soomsafety';
import { prismaWrite, prismaRead } from '../../../../../db';

const handler = async (request, response) => {
  const { method, query } = request;

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
        const id = query.id;

        const device = await prismaRead.ssfUserDevice.findFirst({
          where: { user_id: userId, user_device_id: id, deleted_at: null },
          select: {
            user_device_id: true,
            user_id: true,
            token: true,
            created_at: true,
            updated_at: true
          }
        });
        if (!device) {
          return response.status(404).json({ valid: false, message: `Device not found` });
        }

        return response.status(200).json({ valid: true, data: device });
      } catch (error) {
        console.error(error);
        let statusCode = 500;
        if (error.name === 'ValidationError') {
          statusCode = 400;
        }
        response.status(statusCode).json({ valid: false, message: error.message });
      }
      break;
    case 'DELETE':
      try {
        if (!query.user_id) {
          return response
            .status(400)
            .json({ valid: false, message: `Invalid params`, params: { user_id: `User ID is required` } });
        }

        const userId = parseInt(query.user_id);
        const id = query.id;

        const device = await prismaRead.ssfUserDevice.findFirst({
          where: { user_device_id: id, user_id: userId }
        });
        if (!device) {
          return response.status(404).json({ valid: false, message: `Invalid device` });
        }

        const deleteResult = await prismaWrite.ssfUserDevice.delete({
          where: { user_device_id: device.user_device_id }
        });

        if (!deleteResult) {
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
      response.setHeader('Allow', ['GET', 'DELETE']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
};

export default handler;
