import { prismaRead, prismaWrite } from '../../../db';

// request printed version
export default async function handler(request, response) {
  const { method, body } = request;
  const headers = {};
  if (request.headers['accept-language']) {
    headers['accept-language'] = request.headers['accept-language'];
  }

  switch (method) {
    case 'POST':
      try {
        if (!body.configId || !body.documentNumber || !body.email) {
          return response.status(400).json({
            valid: false,
            message: `Invalid params`,
            params: {
              configId: !body.configId ? `Configuration ID is required` : undefined,
              documentNumber: !body.documentNumber ? `Document Number is required` : undefined,
              email: !body.email ? `Email is required` : undefined
            }
          });
        }

        const configId = parseInt(body.configId);
        const documentNumber = body.documentNumber as string;
        const email = body.email as string;

        // check if a subscription exist
        const subscription = await prismaRead.documentSubscription.findFirst({
          where: { configuration_id: configId, document_number: documentNumber, email }
        });

        let resultSave;
        const dataSave = {
          configuration_id: configId,
          document_number: documentNumber,
          name: body.fullName,
          email,
          phone: body.phone,
          profession: body.profession,
          organization: body.organization
        };
        if (subscription) {
          resultSave = await prismaWrite.documentSubscription.update({
            where: { document_subscription_id: subscription.document_subscription_id },
            data: { ...dataSave, deleted_at: null }
          });
        } else {
          resultSave = await prismaWrite.documentSubscription.create({
            data: dataSave
          });
        }

        if (!resultSave) {
          return response.status(400).json({ valid: false, message: `An error has ocurred, please try again` });
        }

        return response.status(200).json({ valid: true });
      } catch (error) {
        console.error(error);
        if (error.response) {
          const statusCode = error.response.status || 500;
          const data = error.response.data || {};
          response.status(statusCode).json(data);
        } else {
          response.status(500).json(error);
        }
      }
      break;
    default:
      response.setHeader('Allow', ['POST']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
}
