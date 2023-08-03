import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';

import { prismaWrite, prismaRead } from '../../../db';
import { clearCache } from '../../../helpers/webappConfig';
import { getUserSessionData } from '../../../helpers/userSession';
import { addDomainToProject, deleteDomainFromProject, getCustomDomainSettings } from '../../../helpers/vercel';

// request printed version
export default withApiAuthRequired(async function handler(request, response) {
  const { method, query, body } = request;

  switch (method) {
    case 'GET':
      try {
        if (!query.org || !query.app) {
          response.status(400).json({ error: '"org" and "app" is required to get web app settings' });
          return;
        }

        const app = query.app as string;
        const org = query.org as string;

        const session = await getSession(request, response);
        const userData = await getUserSessionData(session, app, org);
        if (!userData) {
          return response.status(409).json({
            error:
              "Contact your administrator. This profile doesn't exist, is disabled, or does not have permission for this app."
          });
        }
        const { configurationId } = userData;

        const lastLicenseConfiguration = await getLicenseConfig(configurationId);
        if (!lastLicenseConfiguration) {
          response.status(200).json(null);
          return;
        }

        response.status(200).json(formatLicenseConfiguration(lastLicenseConfiguration));
      } catch (error) {
        console.error(error);
        response.status(500).json({ error: error.message });
      }
      break;
    case 'POST':
      try {
        if (!body.org || !body.app) {
          response.status(400).json({ error: '"org" and "app" is required to save web app settings' });
          return;
        }

        const app = body.app as string;
        const org = body.org as string;

        const session = await getSession(request, response);
        const userData = await getUserSessionData(session, app, org);
        if (!userData) {
          return response.status(409).json({
            error:
              "Contact your administrator. This profile doesn't exist, is disabled, or does not have permission for this app."
          });
        }
        const { configurationId, licenseBoundaries } = userData;

        const lastLicenseConfiguration = await getLicenseConfig(configurationId);

        // update license config if the last one is not in production
        let updateConfig = false;
        if (lastLicenseConfiguration) {
          updateConfig = !lastLicenseConfiguration.is_production;
        }

        // create or update license config as preview
        const saveData = {
          is_preview: true,
          is_production: false,
          settings: JSON.stringify({
            company: body.company,
            theme: body.theme,
            features: body.features
          }),
          welcome_text: JSON.stringify(body.welcome_text)
        };

        let result;
        if (updateConfig) {
          result = await prismaWrite.licenseConfiguration.update({
            where: { license_configuration_id: lastLicenseConfiguration.license_configuration_id },
            data: { ...saveData }
          });
        } else {
          result = await prismaWrite.licenseConfiguration.create({
            data: { configuration_id: configurationId, ...saveData }
          });
        }

        if (!result) {
          response.status(400).json({ error: 'An error occurred while saving settings' });
          return;
        }

        // update old license config as preview if a new one has been created
        if (!updateConfig) {
          await prismaWrite.licenseConfiguration.updateMany({
            where: {
              NOT: { license_configuration_id: result.license_configuration_id },
              configuration_id: configurationId,
              is_preview: true
            },
            data: {
              is_preview: false
            }
          });
        }

        // let's check if custom domain/subdomain has been entered
        const customDomainEnabled = licenseBoundaries['custom-domain']
          ? licenseBoundaries['custom-domain'].enabled
          : false;
        if (customDomainEnabled) {
          if (body.company.customDomain === '' && body.company.oldCustomDomain !== '') {
            const customDomainSettings = await getCustomDomainSettings(body.company.oldCustomDomain);

            await prismaWrite.domain.deleteMany({
              where: {
                is_custom: true,
                configuration_id: configurationId
              }
            });
            await deleteDomainFromProject({ domain: body.company.oldCustomDomain });

            if (customDomainSettings.subdomain === 'www') {
              await deleteDomainFromProject({ domain: `www.${body.company.oldCustomDomain}` });
            }
          } else {
            if (body.company.oldCustomDomain !== '' && body.company.oldCustomDomain !== body.company.customDomain) {
              const customDomainSettings = await getCustomDomainSettings(body.company.oldCustomDomain);
              await prismaWrite.domain.deleteMany({
                where: {
                  is_custom: true,
                  configuration_id: configurationId
                }
              });
              await deleteDomainFromProject({ domain: body.company.oldCustomDomain });

              if (customDomainSettings.subdomain === 'www') {
                await deleteDomainFromProject({ domain: `www.${body.company.oldCustomDomain}` });
              }
            }
            const customDomainSettings = await getCustomDomainSettings(body.company.customDomain);
            await prismaWrite.domain.upsert({
              where: {
                domain: body.company.customDomain
              },
              update: {
                domain: body.company.customDomain
              },
              create: {
                domain: body.company.customDomain,
                enabled: true,
                deleted_at: null,
                is_prod: true,
                is_custom: true,
                configuration_id: configurationId
              }
            });
            await addDomainToProject({ domain: body.company.customDomain });

            if (customDomainSettings.subdomain === 'www') {
              await prismaWrite.domain.upsert({
                where: {
                  domain: `www.${body.company.customDomain}`
                },
                update: {
                  domain: `www.${body.company.customDomain}`
                },
                create: {
                  domain: `www.${body.company.customDomain}`,
                  enabled: true,
                  deleted_at: null,
                  is_prod: true,
                  is_custom: true,
                  configuration_id: configurationId
                }
              });
              await addDomainToProject({ domain: `www.${body.company.customDomain}` });
            }
          }
        }

        // clear webapp cache
        await clearCache(configurationId);

        response.status(200).json(formatLicenseConfiguration(result));
      } catch (error) {
        console.error(error);
        response.status(403).json({ error: 'An error occurred while saving settings' });
      }
      break;
    case 'PUT':
      try {
        if (!body.org || !body.app) {
          response.status(400).json({ error: '"org" and "app" is required to save web app settings' });
          return;
        }

        const app = body.app as string;
        const org = body.org as string;

        const session = await getSession(request, response);
        const userData = await getUserSessionData(session, app, org);
        if (!userData) {
          return response.status(409).json({
            error:
              "Contact your administrator. This profile doesn't exist, is disabled, or does not have permission for this app."
          });
        }
        const { configurationId } = userData;

        const lastLicenseConfiguration = await getLicenseConfig(configurationId);

        const result = await prismaWrite.licenseConfiguration.update({
          where: { license_configuration_id: lastLicenseConfiguration.license_configuration_id },
          data: { is_production: true }
        });

        if (!result) {
          response.status(400).json({ error: 'An error occurred while saving settings' });
          return;
        }

        // update old production license config
        await prismaWrite.licenseConfiguration.updateMany({
          where: {
            NOT: { license_configuration_id: result.license_configuration_id },
            configuration_id: configurationId,
            is_production: true
          },
          data: { is_production: false }
        });

        // clear webapp cache
        await clearCache(configurationId);

        response.status(200).json(formatLicenseConfiguration(result));
      } catch (error) {
        console.error(error);
        response.status(403).json({ error: 'An error occurred while saving settings' });
      }
      break;
    default:
      response.setHeader('Allow', ['GET', 'POST', 'PUT']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
});

const getLicenseConfig = async (configId) => {
  // load last licenseConfiguration
  const licenseConfiguration = await prismaRead.licenseConfiguration.findFirst({
    where: { configuration_id: configId },
    orderBy: { created_at: 'desc' }
  });

  return licenseConfiguration;
};

const formatLicenseConfiguration = (licenseConfiguration) => {
  try {
    const object = { ...licenseConfiguration };
    object.settings = JSON.parse(object.settings);
    object.welcome_text = JSON.parse(object.welcome_text);
    return object;
  } catch (error) {
    console.error(error);
    return { ...licenseConfiguration };
  }
};
