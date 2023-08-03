import { getCookie, deleteCookie } from 'cookies-next';
import { get as _get, find as _find } from 'lodash';
import replace from 'key-value-replace';

// database for server side props
import { prismaRead } from '../db';

import { redis } from '../redis';

// get soom functions
import { getS3Endpoint, getWebAppConfigHash, getWebAppPasswordHash } from '@soom-universe/soom-utils/functions';

// get soom constants
import { countries, languages, passwordProtection } from '@soom-universe/soom-utils/constants';

export const clientConfigLoaderAPI = async (host) => {
  const domain = await loadDomain(host);
  return domain;
};

const clientConfigLoader = async (context) => {
  const { req } = context;
  const host = req.headers.host;
  const resetCache = process.env.WEBAPP_RESET_CACHE;

  try {
    // check cache to get the config
    const cacheKey = getWebAppConfigHash(host);
    let cache = !resetCache ? await redis.get(cacheKey) : null;
    if (cache) {
      try {
        cache = JSON.parse(cache);
        return cache;
      } catch (error) {
        cache = null;
      }
    }

    // get new token from api and set it in cache
    const props = await loadConfigFromDB(host, context);
    if (!props) {
      return { propsError: true, propsErrorType: 'database', propsErrorAdmin: false };
    }

    redis.set(cacheKey, JSON.stringify(props));
    return props;
  } catch (error) {
    console.error(error);
    return { propsError: true, propsErrorType: 'database', propsErrorAdmin: false };
  }
};

const loadConfigFromDB = async (host, context) => {
  const domain = await loadDomain(host);
  if (!domain) {
    return { propsError: true, propsErrorType: 'configuration', propsErrorAdmin: false };
  }

  const siteAuthStatus = getSiteAuthStatus(domain.configuration, domain.is_prod, context);

  const whereLicenseConfiguration = domain.is_prod ? { is_production: true } : { is_preview: true };

  const licenseConfiguration = await prismaRead.licenseConfiguration.findFirst({
    where: { configuration_id: domain.configuration.configuration_id, ...whereLicenseConfiguration },
    orderBy: { created_at: 'desc' }
  });

  if (!licenseConfiguration) {
    return { propsError: true, propsErrorType: 'licenseConfiguration', propsErrorAdmin: !domain.is_prod };
  }

  const settings = getSettings(licenseConfiguration, domain.configuration);

  const props = {
    config: {
      ident: domain.configuration.configuration_id,
      url: `https://${host}`,
      needPassword: !siteAuthStatus,
      bucketName: domain.configuration.bucket,
      manufacturer: domain.configuration.manufacturer,
      manufacturerAlias: domain.configuration.manufacturer_alias,
      notificationsEmail: domain.configuration.notifications_email,
      phoneNumber: domain.configuration.phone_number,
      doctorAudience: domain.configuration.doctor_audience
    },
    ...settings
  };

  return props;
};

const loadDomain = async (host) => {
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
            bucket: true,
            doctor_audience: true,
            organization: {
              select: {
                organization_id: true,
                name: true,
                slug: true
              }
            },
            externalSites: {
              select: {
                external_site_id: true,
                regions: true,
                url: true
              }
            }
          }
        }
      }
    });
    return domain;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getSettings = (licenseConfig, config) => {
  try {
    const settings = JSON.parse(licenseConfig.settings);
    const welcomeText = JSON.parse(licenseConfig.welcome_text);

    // icon
    const icon = _get(settings, 'company.icon', '');
    if (icon !== '') {
      settings.company.icon = getS3Endpoint(config.bucket, icon);
    }

    // logo
    const logo = _get(settings, 'company.logo', '');
    if (logo !== '') {
      settings.company.logo = getS3Endpoint(config.bucket, logo);
    }

    // regions
    const regionsRedirects = formatRegionsRedirects(_get(config, 'externalSites', []));
    let regions = _get(config, 'regions', '');
    regions = regions && regions !== '' ? regions.split(',') : [];
    settings.company.regions = regions.map((region) => {
      const countryObj = _find(countries, (country) => {
        return country.value === region;
      });
      if (countryObj && regionsRedirects[region]) {
        return { ...countryObj, url: `${regionsRedirects[region]}?r=${region}` };
      }
      return countryObj;
    });

    // languages
    let languagesTemp = _get(config, 'languages', '');
    languagesTemp = languagesTemp && languagesTemp !== '' ? languagesTemp.split(',') : [process.env.DEFAULT_LANGUAGE];
    settings.company.languages = languagesTemp.map((lang) => {
      const langObj = _find(languages, (language) => {
        return language.value === lang;
      });
      return langObj;
    });

    if (welcomeText) {
      // welcome text
      const replaceVars = {
        email: config.notifications_email || '',
        phone: config.phone_number || ''
      };
      const welcomeTextTemp = {};
      Object.keys(welcomeText).forEach((langIndex) => {
        const text = welcomeText[langIndex];
        welcomeTextTemp[langIndex] = replace(text, replaceVars);
      });
      settings.welcomeText = welcomeTextTemp;
    }

    return settings;
  } catch (error) {
    console.error(error);
    return { company: {}, theme: {}, features: {} };
  }
};

const getSiteAuthStatus = (config, isProd, context) => {
  const cookieName = isProd ? passwordProtection.cookieNameProd : passwordProtection.cookieNamePreview;
  const password = isProd ? config.webapp_password_production : config.webapp_password_preview;

  // check if the site has a password
  if (!(password && password !== '')) {
    deleteCookie(cookieName, { req: context.req, res: context.res });
    return true;
  }

  // if has a password check the cookie
  const passwordHash = getWebAppPasswordHash(password);
  const authCookie = getCookie(cookieName, { req: context.req, res: context.res }) || null;
  const isValid = authCookie === passwordHash;
  if (!isValid) {
    deleteCookie(cookieName, { req: context.req, res: context.res });
    return false;
  }

  return true;
};

const formatRegionsRedirects = (redirects) => {
  redirects = redirects.map((rr) => {
    return { ...rr, regions: rr.regions.split(',') };
  });

  const results = {};
  redirects.forEach((r1) => {
    r1.regions.forEach((r2) => {
      results[r2] = r1.url;
    });
  });
  return results;
};

export default clientConfigLoader;
