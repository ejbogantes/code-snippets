import { withApiAuthRequired } from '@auth0/nextjs-auth0';
import { verifyDomainFromProject } from '../../../helpers/vercel';

export default withApiAuthRequired(async function handler(request, response) {
  if (request.method === 'POST') {
    const { domain } = request.body;
    const result = await verifyDomainFromProject({ domain });
    response.status(200).json({ result });
  } else {
    response.status(500).json({ msg: 'Not supported' });
  }
});
