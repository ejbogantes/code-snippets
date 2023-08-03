import { withApiAuthRequired } from '@auth0/nextjs-auth0';
import { prismaWrite } from '../../../db';
import { getSubdomain, getS3Bucket } from '@soom-universe/soom-utils/functions';
import { createBucket, newBucketName } from '../../../helpers/S3';

// TODO: Think on a rollback process here
export default withApiAuthRequired(async function handle(req, res) {
  if (req.method === 'POST' && req.query.slug) {
    try {
      const config = req.query.config as string;
      const slug = req.query.slug as string;
      const app = req.query.app as string;
      // prefixes
      const previewPrefix = `${slug}-preview`;

      const bucket = await newBucketName({ name: getS3Bucket(app, slug) });

      // data object
      const data = {
        // TODO: Get the app name as a parameter
        bucket,
        previewPrefix,
        productionPrefix: slug,
        previewSubdomain: getSubdomain(previewPrefix),
        productionSubdomain: getSubdomain(slug),
        s3: false,
        registerDomains: undefined
      };

      // Amazon S3 Bucket
      const s3 = await createBucket({ bucket: data.bucket });

      if (s3) {
        // save bucket
        data.s3 = true;
        await prismaWrite.configuration.update({
          data: { bucket: data.bucket },
          where: { configuration_id: parseInt(config) }
        });
        // save domains
        data.registerDomains = await prismaWrite.domain.createMany({
          data: [
            {
              domain: data.previewSubdomain,
              enabled: true,
              configuration_id: parseInt(config),
              is_prod: false
            },
            {
              domain: data.productionSubdomain,
              enabled: true,
              configuration_id: parseInt(config),
              is_prod: true
            }
          ],
          skipDuplicates: true
        });
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error registering the sites.' });
    }
  } else if (req.method === 'POST' && !req.query.slug) {
    return res.status(400).json({
      message: 'Missing required parameters. slug is required',
      required: {
        slug: req.query.slug || 'empty'
      }
    });
  }
  return res.status(404).json({ message: 'Not supported' });
});
