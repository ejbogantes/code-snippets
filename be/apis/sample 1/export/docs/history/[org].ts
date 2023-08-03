import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import { parse } from 'json2csv';
import getConfig from 'next/config';

import { getDocumentsLogs } from '@soom-universe/soom-api';

import { getUserSessionData } from '../../../../../helpers/userSession';

const {
  publicRuntimeConfig: { appName }
} = getConfig();

export default withApiAuthRequired(async function handle(request, response) {
  const { method, query } = request;

  switch (method) {
    case 'GET':
      try {
        const org = query.org as string;

        const session = await getSession(request, response);
        const userData = await getUserSessionData(session, appName, org);
        if (!userData) {
          return response.status(401).json({});
        }
        const { bucket, licenseBoundaries } = userData;

        // user logs validation
        if (!licenseBoundaries['user-logs'] || !licenseBoundaries['user-logs'].enabled) {
          return response.status(401).json({});
        }

        const logs = await getDocumentsLogs({ filterValue: bucket });
        if (!logs) {
          return response.status(404).json({});
        }

        response.setHeader('Content-Type', 'application/csv');
        response.setHeader('Content-Disposition', `attachment; filename=Documents_History_${org}.csv`);
        response.status(200);
        response.send(parse(logs));
      } catch (error) {
        console.error(error);
        response.status(500).json({ error: 'Error getting documents history' });
      }
      break;
    default:
      response.setHeader('Allow', ['GET']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
});
