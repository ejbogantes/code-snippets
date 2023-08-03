import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';

import { listDocuments } from '@soom-universe/soom-api';

import { getUserSessionData } from '../../../helpers/userSession';
import { redis, hash } from '../../../redis';

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

        const { businessUnitSlug, bucket } = userData;

        const params = {
          filterBy: 'bucket',
          filterValue: bucket,
          orderBy: query.orderBy,
          pagination: query.pagination,
          skip: query.skip,
          limit: query.limit,
          statuses: query.statuses,
          businessUnit: businessUnitSlug !== null ? businessUnitSlug : query.businessUnit
        };

        const objectHash = process.env.CACHE ? hash(params) : false;
        const cache = process.env.CACHE ? await redis.get(objectHash) : false;
        let result = {};
        if (cache) {
          result = JSON.parse(cache);
        } else {
          result = await listDocuments(params);
          if (process.env.CACHE) {
            redis.set(objectHash, JSON.stringify(result), 'EX', 3600);
          }
        }
        response.status(200).json(result);
      } catch (error) {
        console.error(error);
        response.status(403).json({ error: 'Error ocurred when listing documents' });
      }
      break;
    default:
      response.setHeader('Allow', ['GET']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
});
