import { withApiAuthRequired } from '@auth0/nextjs-auth0';
import { createBucket } from '../../../helpers/S3';

export default withApiAuthRequired(async function handle(req, res) {
  const { bucket } = req.body;
  if (req.method === 'POST' && bucket) {
    const r = await createBucket(req.body);
    return res.status(200).json(r);
  } else if (req.method === 'POST' && !bucket) {
    return res.status(400).json({
      message: 'Missing required parameters',
      required: {
        bucket: bucket || 'empty'
      }
    });
  }
  return res.status(404).json({ message: 'Not supported' });
});
