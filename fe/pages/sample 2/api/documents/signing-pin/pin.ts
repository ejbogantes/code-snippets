/* eslint-disable camelcase */
import { prismaWrite } from '../../../../db';
import { randomString } from '../../../../helpers/Strings';
// import CryptoJS from 'crypto-js';
import { withApiAuthRequired } from '@auth0/nextjs-auth0';

// email templates
import { getTemplate } from '@soom-universe/soom-utils/emails';

import { sendEmail } from '@soom-universe/soom-api';

export default withApiAuthRequired(async function handle(request, response) {
  if (request.method === 'POST') {
    const { profile_id, action_name, signature_key, expires_on, email } = request.body;
    const pin = randomString(6);
    try {
      const result = await prismaWrite.signing_Pin.create({
        data: {
          profile_id,
          pin,
          action_name,
          signature_key,
          expires_on
        }
      });

      if (result) {
        const fromEmail = process.env.NOTIFICATIONS_FROM_EMAIL;
        // render the email
        const html = await getTemplate('pin', { pin });
        // send the email
        await sendEmail({
          Destination: email,
          HtmlPart: html,
          TextPart: '',
          SubjectPart: 'Soom eIFU | Signing PIN Request',
          Source: fromEmail
        });
      }
      response.status(200).json({ uuid: result.signature_key });
    } catch (error) {
      console.error(error);
      response.status(403).json({ error: 'Error ocurred when creating a signing pin' });
    }
  }
});
