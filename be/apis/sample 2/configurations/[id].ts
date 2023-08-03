import { withApiAuthRequired } from '@auth0/nextjs-auth0';

import { deleteAllDocuments } from '@soom-universe/soom-api';

import { prismaWrite, prismaRead } from '../../../db';
import { deleteBucket } from '../../../helpers/S3';
import { clearCache } from '../../../helpers/webappConfig';

export default withApiAuthRequired(async function handle(request, response) {
  const { method, query } = request;

  switch (method) {
    case 'DELETE':
      try {
        const id = parseInt(query.id as string);

        const config = await loadConfig(id);
        if (!config) {
          response.status(404).json({ message: 'App configuration not found.' });
        }

        const bucket = config.bucket;

        // delete webapp cache
        await clearCache(id);

        // delete domains
        await prismaWrite.domain.deleteMany({
          where: { configuration_id: id }
        });

        // delete licenses config
        await prismaWrite.licenseConfiguration.deleteMany({
          where: { configuration_id: id }
        });

        // delete org profiles
        await prismaWrite.organizationProfiles.deleteMany({
          where: { configuration_id: id }
        });

        // delete business units
        await prismaWrite.businessUnit.deleteMany({
          where: { configuration_id: id }
        });

        // delete subscriptions
        await prismaWrite.documentSubscription.deleteMany({
          where: { configuration_id: id }
        });

        // delete config
        await prismaWrite.configuration.delete({
          where: { configuration_id: id }
        });

        // delete bucket
        await deleteBucket({ bucket });

        // delete documents in backend api
        deleteAllDocumentsBackend(bucket);

        response.status(200).json({ message: 'App deleted.' });
      } catch (error) {
        console.error(error);
        response.status(500).json({ message: error.message });
      }
      break;
    default:
      response.setHeader('Allow', ['DELETE']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
});

const loadConfig = async (configId) => {
  const result = await prismaRead.configuration.findUnique({
    where: { configuration_id: configId },
    select: {
      bucket: true,
      organization: {
        select: { organization_id: true, slug: true, name: true }
      },
      license: {
        select: {
          license_id: true,
          slug: true,
          name: true,
          app: {
            select: { app_id: true, slug: true, name: true }
          }
        }
      }
    }
  });

  return result;
};

const deleteAllDocumentsBackend = async (bucket) => {
  try {
    const result = await deleteAllDocuments({ source: bucket });
    return Boolean(result);
  } catch (error) {
    // console.error(error);
    return false;
  }
};
