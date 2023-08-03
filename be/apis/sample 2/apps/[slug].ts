import { withApiAuthRequired } from '@auth0/nextjs-auth0';
import { prismaRead } from '../../../db';

export default withApiAuthRequired(async function handle(request, response) {
  const { method, query } = request;

  switch (method) {
    case 'GET':
      try {
        const slug = query.slug as string;
        const result = await prismaRead.app.findUnique({
          where: { slug },
          select: {
            app_id: true,
            slug: true,
            name: true,
            description: true,
            version: true,
            logo: true,
            licenses: {
              where: { deleted_at: null },
              select: {
                license_id: true,
                slug: true,
                name: true,
                description: true,
                price: true,
                licenseFeatures: {
                  select: {
                    description: true,
                    feature: true
                  }
                },
                licensePeriodicity: {
                  where: { status: true },
                  orderBy: { order: 'asc' },
                  select: {
                    license_periodicity_id: true,
                    periodicity: true,
                    periodicity_label: true,
                    price: true,
                    price_label: true,
                    status: true,
                    order: true
                  }
                }
              }
            }
          }
        });
        if (result) {
          response.status(200).json(result);
          return;
        }
        response.status(409).json({
          message: 'Contact your administrator.'
        });
      } catch (error) {
        console.error(error);
        let statusCode = 500;
        if (error.name === 'ValidationError') {
          statusCode = 400;
        }
        response.status(statusCode).json({ message: error.message });
      }
      break;
    default:
      response.setHeader('Allow', ['GET']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
});
