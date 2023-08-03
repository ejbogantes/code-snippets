import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import getConfig from 'next/config';
import { get as _get, find as _find } from 'lodash';
import { prismaRead } from '../../../db';

// get soom constants
import { countries, languagesDashboard as languages } from '@soom-universe/soom-utils/constants';

// get public runtime settings
const {
  publicRuntimeConfig: { permissions }
} = getConfig();

export default withApiAuthRequired(async function handle(request, response) {
  const { method, query } = request;

  switch (method) {
    case 'GET':
      try {
        const app = query.app as string;
        const org = query.org as string;

        const session = await getSession(request, response);
        const email = _get(session, 'user.email', null);

        const result = await prismaRead.profile.findFirst({
          where: { email: email.toLowerCase(), enabled: true, deleted_at: null },
          select: selectSchema(app, org)
        });
        if (!result) {
          response.status(409).json({
            message:
              "Contact your administrator. This profile doesn't exist, is disabled, or does not have permission for this app."
          });
          return;
        }

        const newResult = getResultFormatted(result);
        const configId = _get(newResult, 'organizationProfiles.0.configuration.configuration_id', 0);

        // load domains
        const objResult = { ...newResult, domains: {} };
        const dataLoaded = await loadDomains(configId);
        if (dataLoaded.valid) {
          objResult.domains = dataLoaded.domains;
        }

        // load another org that the user have access of this app
        const orgs = await prismaRead.organizationProfiles.findMany({
          where: {
            enabled: true,
            profile_id: objResult.profile_id,
            organization: { slug: { not: org } },
            configuration: { deleted_at: null, license: { deleted_at: null, app: { slug: app } } }
          },
          select: {
            organization: {
              select: { organization_id: true, name: true, slug: true }
            },
            configuration: {
              select: {
                configuration_id: true,
                bucket: true,
                license: {
                  select: {
                    license_id: true,
                    app: {
                      select: { app_id: true, name: true, slug: true, admin_url: true, public_url: true }
                    }
                  }
                }
              }
            }
          }
        });
        objResult.accessToOrganizations = orgs || [];

        // load all business unit if has access
        const businessUnit = _get(newResult, 'organizationProfiles.0.businessUnit', null);
        if (!businessUnit) {
          const bUnits = await prismaRead.businessUnit.findMany({
            where: { configuration_id: configId },
            select: { business_unit_id: true, slug: true, name: true }
          });
          objResult.orgBusinessUnits = bUnits || [];
        }

        response.status(200).json(objResult);
      } catch (error) {
        console.error(error);
        response.status(error.name === 'ValidationError' ? 400 : 500).json({ message: error.message });
      }
      break;
    default:
      response.setHeader('Allow', ['GET']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
});

const selectSchema = (app, org) => {
  return {
    profile_id: true,
    first_name: true,
    last_name: true,
    company: true,
    country: true,
    avatar: true,
    enabled: true,
    marketplace: true,
    apps_limit: true,
    terms_of_service: true,
    privacy_policy: true,
    organizationProfiles: {
      where: {
        enabled: true,
        organization: { slug: org },
        configuration: { deleted_at: null, license: { deleted_at: null, app: { slug: app } } }
      },
      select: {
        organization: {
          select: { organization_id: true, name: true, slug: true }
        },
        configuration: {
          select: {
            configuration_id: true,
            license_id: true,
            manufacturer: true,
            manufacturer_alias: true,
            languages: true,
            regions: true,
            bucket: true,
            doctor_audience: true,
            license: {
              select: {
                slug: true,
                name: true,
                description: true,
                price: true,
                app: {
                  select: {
                    name: true,
                    slug: true,
                    description: true,
                    version: true,
                    admin_url: true,
                    public_url: true
                  }
                },
                licenseFeatures: {
                  select: { feature: true }
                },
                licenseBoundaries: {
                  select: { boundary: true, enabled: true, limit: true }
                }
              }
            }
          }
        },
        role: {
          select: {
            role_id: true,
            name: true,
            slug: true,
            description: true,
            rolePermissions: {
              select: {
                permission: {
                  select: { permission_id: true, name: true, slug: true, description: true }
                }
              }
            }
          }
        },
        businessUnit: {
          select: { business_unit_id: true, slug: true, name: true }
        }
      }
    }
  };
};

const loadDomains = async (configId) => {
  // load domains
  const domainsData = { preview: '', production: '', custom: '' };
  const domains = await prismaRead.domain.findMany({
    where: { configuration_id: configId },
    orderBy: { created_at: 'asc' }
  });
  if (domains) {
    const previewDomain = _find(domains, (d) => {
      return !d.is_prod;
    });
    if (previewDomain) {
      domainsData.preview = `https://${previewDomain.domain}`;
    }

    // custom must not have the https
    const customDomain = _find(domains, (d) => {
      return d.is_custom && d.domain.indexOf('www') === -1;
    });
    domainsData.custom = customDomain && customDomain.domain ? customDomain.domain : '';

    const prodDomain = _find(domains, (d) => {
      return d.is_prod;
    });
    if (prodDomain) {
      domainsData.production = `https://${prodDomain.domain}`;
    }
  }

  return { valid: true, domains: domainsData };
};

const getResultFormatted = (result) => {
  try {
    const config = _get(result, 'organizationProfiles.0.configuration', null);
    if (!config) {
      return result;
    }

    const newResult = { ...result };

    // regions
    let regions = _get(config, 'regions', '');
    regions = regions && regions !== '' ? regions.split(',') : [];
    newResult.organizationProfiles[0].configuration.regions = regions.map((region) => {
      const countryObj = _find(countries, (country) => {
        return country.value === region;
      });
      return countryObj;
    });

    // languages
    let languagesTemp = _get(config, 'languages', '');
    languagesTemp = languagesTemp && languagesTemp !== '' ? languagesTemp.split(',') : [process.env.DEFAULT_LANGUAGE];
    newResult.organizationProfiles[0].configuration.languages = languagesTemp.map((lang) => {
      const langObj = _find(languages, (language) => {
        return language.value === lang;
      });
      return langObj;
    });

    // permissions and boundaries
    const role = _get(newResult, 'organizationProfiles.0.role', null);
    const boundariesData = _get(newResult, 'organizationProfiles.0.configuration.license.licenseBoundaries', null);
    if (!role || !boundariesData) {
      return newResult;
    }

    const boundaries = {};
    boundariesData.forEach((b) => {
      const { boundary, enabled, limit } = b;
      boundaries[boundary.boundary_id] = { enabled, limit };
    });

    newResult.organizationProfiles[0].role.rolePermissions = filterPermissionsWithBoundaries(
      newResult.organizationProfiles[0].role.rolePermissions,
      boundaries
    );

    // format license
    newResult.organizationProfiles[0].configuration.license.licenseBoundaries = boundaries;
    newResult.organizationProfiles[0].license = newResult.organizationProfiles[0].configuration.license;
    delete newResult.organizationProfiles[0].configuration.license;

    return newResult;
  } catch (error) {
    console.error(error);
    return result;
  }
};

const filterPermissionsWithBoundaries = (rolePermissions, LicenseBoundaries) => {
  const permissionsToValidate = {
    [permissions.EXPORT_DOCUMENTS_HISTORY]: 'user-logs',
    [permissions.MULTIPLE_DOCUMENTS]: 'bulk-upload',
    [permissions.LIST_PRODUCTS]: 'product-page',
    [permissions.LIST_API_KEYS]: 'api-integration',
    [permissions.LIST_REPORTS]: 'reports'
  };

  const newPermissions = [...rolePermissions];
  newPermissions.forEach((p, index) => {
    const {
      permission: { slug }
    } = p;
    let deleteIndex = false;

    if (permissionsToValidate[slug]) {
      const boundary = permissionsToValidate[slug];
      if (!LicenseBoundaries[boundary] || !LicenseBoundaries[boundary].enabled) {
        deleteIndex = true;
      }
    }

    if (deleteIndex) {
      newPermissions.splice(index, 1);
    }
  });

  return newPermissions;
};
