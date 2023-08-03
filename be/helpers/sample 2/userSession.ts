import { get as _get } from 'lodash';

import { prismaRead } from '../db';

export const getUserSessionData = async (session, app, org) => {
  if (!session || !app || !org) {
    return null;
  }

  try {
    const email = _get(session, 'user.email', null);

    const result = await prismaRead.profile.findFirst({
      where: { email: email.toLowerCase(), enabled: true, deleted_at: null },
      select: {
        profile_id: true,
        first_name: true,
        last_name: true,
        email: true,
        company: true,
        organizationProfiles: {
          where: {
            enabled: true,
            organization: { slug: org },
            configuration: { deleted_at: null, license: { deleted_at: null, app: { slug: app } } }
          },
          select: {
            organization_id: true,
            configuration_id: true,
            business_unit_id: true,
            organization: { select: { organization_id: true, slug: true, name: true } },
            configuration: {
              select: {
                configuration_id: true,
                bucket: true,
                manufacturer: true,
                manufacturer_alias: true,
                license: { select: { licenseBoundaries: true } }
              }
            },
            businessUnit: {
              select: { business_unit_id: true, slug: true, name: true }
            }
          }
        }
      }
    });
    if (!result) {
      return null;
    }

    const orgId = _get(result, 'organizationProfiles.0.organization_id', null);
    const configId = _get(result, 'organizationProfiles.0.configuration_id', null);
    const buId = _get(result, 'organizationProfiles.0.business_unit_id', null);
    const orgSlug = _get(result, 'organizationProfiles.0.organization.slug', null);
    const orgName = _get(result, 'organizationProfiles.0.organization.name', null);
    const buSlug = _get(result, 'organizationProfiles.0.businessUnit.slug', null);
    const bucket = _get(result, 'organizationProfiles.0.configuration.bucket', null);
    const manufacturer = _get(result, 'organizationProfiles.0.configuration.manufacturer', null);
    const manufacturerAlias = _get(result, 'organizationProfiles.0.configuration.manufacturer_alias', null);
    const boundariesData = _get(result, 'organizationProfiles.0.configuration.license.licenseBoundaries', []);

    const licenseBoundaries = {};
    boundariesData.forEach((b) => {
      const { boundary_id: boundaryId, enabled, limit } = b;
      licenseBoundaries[boundaryId] = { enabled, limit };
    });

    return {
      profileId: result.profile_id,
      firstName: result.first_name,
      lastName: result.last_name,
      email: result.email,
      company: result.company,
      organizationId: orgId,
      organizationSlug: orgSlug,
      organizationName: orgName,
      configurationId: configId,
      businessUnitId: buId,
      businessUnitSlug: buSlug,
      bucket,
      manufacturer,
      manufacturerAlias,
      licenseBoundaries
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};
