import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import { prismaRead } from '../../../db';
import { getUserSessionData } from '../../../helpers/userSession';

export default withApiAuthRequired(async function handle(request, response) {
  const { method } = request;

  switch (method) {
    case 'GET':
      try {
        const session = await getSession(request, response);
        const profile = await getUserSessionData(session);
        if (!profile) {
          response.status(404).json({ message: 'Owner user not found.' });
          return;
        }

        const result = await prismaRead.profile.findFirst({
          where: {
            email: profile.email,
            enabled: true,
            deleted_at: null
          },
          select: {
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
                organization: {
                  deleted_at: null
                },
                configuration: {
                  deleted_at: null,
                  license: {
                    deleted_at: null,
                    app: {
                      deleted_at: null
                    }
                  }
                }
              },
              select: {
                organization: {
                  select: {
                    organization_id: true,
                    name: true,
                    slug: true,
                    owner_profile_id: true
                  }
                },
                configuration: {
                  select: {
                    configuration_id: true,
                    bucket: true,
                    license_configurations: true,
                    license_id: true,
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
                          select: {
                            feature: true
                          }
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
                          select: {
                            permission_id: true,
                            name: true,
                            slug: true,
                            description: true
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        });

        if (!result) {
          response.status(409).json({
            message:
              "Contact your administrator. This profile doesn't exist, is disabled, or does not have permission for this app."
          });
          return;
        }

        response.status(200).json(result);
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
