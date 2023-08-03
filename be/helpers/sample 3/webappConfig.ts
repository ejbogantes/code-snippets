import { prismaRead } from '../db';
import { redis } from '../redis';

// get soom functions
import { getWebAppConfigHash } from '@soom-universe/soom-utils/functions';

export const clearCache = async (configId) => {
  try {
    const domains = await prismaRead.domain.findMany({ where: { configuration_id: configId } });
    if (!domains || domains.length <= 0) {
      return true;
    }

    const cacheKeys = [];
    domains.forEach(async (domain) => {
      const cacheKey = getWebAppConfigHash(domain.domain);
      cacheKeys.push(cacheKey);
    });

    await redis.del(cacheKeys);

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
