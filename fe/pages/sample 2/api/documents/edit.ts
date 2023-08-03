import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';

import { updateDocument } from '@soom-universe/soom-api';

import { getUserSessionData } from '../../../helpers/userSession';

// request printed version
export default withApiAuthRequired(async function handler(request, response) {
  const { method, body } = request;

  switch (method) {
    case 'PUT':
      try {
        const org = body.org as string;
        const app = body.app as string;

        delete body.org;
        delete body.app;

        const session = await getSession(request, response);
        const userData = await getUserSessionData(session, app, org);
        if (!userData) {
          return response.status(409).json({
            message:
              "Contact your administrator. This profile doesn't exist, is disabled, or does not have permission for this app."
          });
        }

        const { businessUnitSlug, bucket, manufacturer, manufacturerAlias } = userData;

        const params = {
          ...body,
          bucket,
          business_unit: businessUnitSlug !== null ? businessUnitSlug : body.business_unit,
          manufacturer,
          manufacturer_alias: manufacturerAlias ? manufacturerAlias.split(',') : []
        };

        const data = await updateDocument(params);
        response.status(200).json(data);
      } catch (e) {
        console.error(e);
        if (e.response) {
          const statusCode = e.response.status || 500;
          const data = e.response.data || {};
          response.status(statusCode).json(data);
        } else {
          response.status(500).json(e);
        }
      }
      break;
    default:
      response.setHeader('Allow', ['PUT']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
});
