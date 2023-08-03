import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';

import { deleteDocument } from '@soom-universe/soom-api';

import { getUserSessionData } from '../../../helpers/userSession';
import { updatePublishedDocument } from '../../../helpers/publishedDocuments';

// request printed version
export default withApiAuthRequired(async function handler(request, response) {
  const { method, query } = request;

  switch (method) {
    case 'DELETE':
      try {
        const org = query.org as string;
        const app = query.app as string;
        const key = query.key as string;

        const session = await getSession(request, response);
        const userData = await getUserSessionData(session, app, org);
        if (!userData) {
          return response.status(409).json({
            message:
              "Contact your administrator. This profile doesn't exist, is disabled, or does not have permission for this app."
          });
        }

        const { configurationId, bucket } = userData;

        const params = {
          bucket,
          s3_region: 'us-east-1',
          hard: false,
          delete_reason: query.delete_reason,
          key: key ? [key] : [],
          email: query.email
        };

        const data = await deleteDocument(params);

        if (data) {
          await updatePublishedDocument(configurationId, key, 'delete');
        }

        return response.status(200).json(data);
      } catch (e) {
        console.error(e);
        if (e.response) {
          const statusCode = e.response.status || 500;
          const data = e.response.data || {};
          return response.status(statusCode).json(data);
        } else {
          return response.status(500).json(e);
        }
      }
      break;
    default:
      response.setHeader('Allow', ['DELETE']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
});
