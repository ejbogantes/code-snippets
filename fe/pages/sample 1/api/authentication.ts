import { setCookie, deleteCookie } from 'cookies-next';
import { prismaRead } from '../../db';

// get soom functions
import { getWebAppPasswordHash } from '@soom-universe/soom-utils/functions';

// get soom constants
import { passwordProtection } from '@soom-universe/soom-utils/constants';

export default async function handle(request, response) {
  const { method, body } = request;
  const host = request.headers.host;

  switch (method) {
    case 'POST':
      try {
        const domain = await getDomain(host);
        if (!domain) {
          response.status(400).json({ valid: false });
          return;
        }

        const { configuration, is_prod: isProd } = domain;
        const cookieName = isProd ? passwordProtection.cookieNameProd : passwordProtection.cookieNamePreview;
        const password = isProd ? configuration.webapp_password_production : configuration.webapp_password_preview;

        const isValid = body.password === password;
        if (!isValid) {
          deleteCookie(cookieName, { req: request, res: response });
          response.status(400).json({ valid: false });
          return;
        }

        setCookie(cookieName, getWebAppPasswordHash(body.password), { req: request, res: response });
        response.status(200).json({ valid: true });
      } catch (error) {
        console.error(error);
        let statusCode = 500;
        if (error.name === 'ValidationError') {
          statusCode = 400;
        }
        response.status(statusCode).json({ valid: false, error });
      }
      break;
    default:
      response.setHeader('Allow', ['POST']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
}

const getDomain = async (host) => {
  try {
    const domain = await prismaRead.domain.findFirst({
      where: { domain: host, enabled: true },
      select: {
        domain: true,
        is_prod: true,
        configuration: {
          select: {
            configuration_id: true,
            manufacturer: true,
            manufacturer_alias: true,
            notifications_email: true,
            phone_number: true,
            regions: true,
            languages: true,
            webapp_password_preview: true,
            webapp_password_production: true,
            organization: {
              select: {
                organization_id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      }
    });
    if (!domain) {
      return null;
    }

    return domain;
  } catch (error) {
    console.error(error);
    return null;
  }
};
