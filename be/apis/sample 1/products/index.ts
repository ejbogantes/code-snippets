import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';

import { listProducts } from '@soom-universe/soom-api';

import { getUserSessionData } from '../../../helpers/userSession';

// request printed version
export default withApiAuthRequired(async function handler(request, response) {
  const { method, query } = request;

  switch (method) {
    case 'GET':
      try {
        const org = query.org as string;
        const app = query.app as string;

        const session = await getSession(request, response);
        const userData = await getUserSessionData(session, app, org);
        if (!userData) {
          return response.status(409).json({
            message:
              "Contact your administrator. This profile doesn't exist, is disabled, or does not have permission for this app."
          });
        }

        const { bucket, manufacturer, manufacturerAlias } = userData;

        let manufacturerAliasValue = manufacturerAlias ? manufacturerAlias.split(',') : [];
        manufacturerAliasValue = manufacturerAliasValue.map((alias) => {
          return `manufacturer_alias=${alias}`;
        });
        const queryManufacturerAlias =
          manufacturerAliasValue.length > 0 ? manufacturerAliasValue.join('&') : 'manufacturer_alias=';

        const params = {
          pagination: query.pagination,
          skip: query.skip,
          limit: query.limit,
          sources: bucket,
          manufacturer
        };

        const data = await listProducts(params, `?${queryManufacturerAlias}`);
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
      response.setHeader('Allow', ['GET']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
});
