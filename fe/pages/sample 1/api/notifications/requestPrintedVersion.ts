// api endpoint
import { sendEmail } from '@soom-universe/soom-api';
import { getTemplate } from '@soom-universe/soom-utils/emails';
import { get as _get } from 'lodash';

import { clientConfigLoaderAPI } from '../../../helpers/clientConfigLoader';

// request printed version
export default async function handler(request, response) {
  const { method, body } = request;
  const host = request.headers.host;
  const headers = {};
  if (request.headers['accept-language']) {
    headers['accept-language'] = request.headers['accept-language'];
  }

  switch (method) {
    case 'POST':
      try {
        const resp = { not1: null, not2: null };

        const domain = await clientConfigLoaderAPI(host);
        const destination = _get(domain, 'configuration.notifications_email', '');
        const orgName = _get(domain, 'configuration.organization.name', '');
        const fromEmail = process.env.NOTIFICATIONS_FROM_EMAIL;

        // admin notification (request)
        // render the email
        const html = await getTemplate('request-printed-version-admin', { ...body, clientUrl: host, orgName });

        // send the email
        resp.not1 = await sendEmail({
          Destination: destination,
          HtmlPart: html,
          TextPart: '',
          SubjectPart: `Printed eIFU request from ${orgName}`,
          Source: fromEmail
        });

        if (resp.not1 && body.email) {
          // client notification (request received)
          try {
            // render the email
            const htmlClient = await getTemplate('request-printed-version-client', {
              ...body,
              clientUrl: host,
              orgName
            });

            // send the email
            resp.not2 = await sendEmail({
              Destination: body.email,
              HtmlPart: htmlClient,
              TextPart: '',
              SubjectPart: `Printed eIFU request received`,
              Source: fromEmail
            });
          } catch (e) {
            console.error(e);
          }
        }

        response.status(200).json(resp);
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
      response.setHeader('Allow', ['POST']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
}
