/* eslint-disable camelcase */
import { withApiAuthRequired } from '@auth0/nextjs-auth0';
import { prismaWrite, prismaRead } from '../../../../db';

export default withApiAuthRequired(async function handle(request, response) {
  if (request.method === 'GET') {
    const signature_key = request.query.signature_key as string;
    const profile_id = request.query.profile_id as string;
    const pin = request.query.pin as string;
    try {
      const result = await prismaRead.signing_Pin.findFirst({
        where: {
          signature_key,
          profile_id: parseInt(profile_id),
          pin,
          expires_on: {
            not: undefined
          }
        }
      });
      response.status(200).json(result);
    } catch (error) {
      console.error(error);
      response.status(403).json({ error: 'Error ocurred when retrieving a signing pin' });
    }
  }
  if (request.method === 'PUT') {
    try {
      const signatureKey = request.query.signatureKey as string;
      const result = await prismaWrite.signing_Pin.update({
        data: {
          expires_on: undefined
        },
        where: {
          signature_key: signatureKey
        }
      });
      response.status(200).json({ result });
    } catch (error) {
      console.error(error);
      response.status(403).json({ error: 'Error ocurred when updating a signing pin' });
    }
  }
});
