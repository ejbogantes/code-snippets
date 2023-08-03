import { get as _get } from 'lodash';

import { getTemplate } from '@soom-universe/soom-utils/emails';
import { sendEmail } from '@soom-universe/soom-api';
import { prismaRead } from '../db';

const mailgunRecipientsLimit = 1000;

/** new user notification */
export const sendUserNotification = async (profile, configId) => {
  try {
    const config = await loadConfig(configId);
    const appName = _get(config, 'license.app.name', '');
    const orgName = _get(config, 'organization.name', '');
    const fromEmail = process.env.NOTIFICATIONS_FROM_EMAIL;

    // render the email
    const html = await getTemplate('new-user', {
      name: profile.first_name,
      appName,
      orgName,
      soomPortalUrl: process.env.SOOM_PORTAL_URL
    });
    // send the email
    await sendEmail({
      Destination: profile.email,
      HtmlPart: html,
      TextPart: '',
      SubjectPart: 'Welcome to Soom',
      Source: fromEmail
    });

    return true;
  } catch (error) {
    // console.error(error);
    return false;
  }
};

const loadConfig = async (configId) => {
  const result = await prismaRead.configuration.findUnique({
    where: { configuration_id: configId },
    select: {
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

export const getUserEmails = async (configId, rolId) => {
  const profiles = await prismaRead.organizationProfiles.findMany({
    where: { configuration_id: configId, role_id: rolId },
    select: { Profile: { select: { first_name: true, last_name: true, email: true } } }
  });
  if (!profiles) {
    return [];
  }

  return profiles.map((p) => {
    return p.Profile;
  });
};

export const getMailgunSubscribers = async (configId, documentNumber) => {
  const subscribers = await prismaRead.documentSubscription.findMany({
    where: { configuration_id: configId, document_number: documentNumber || '', deleted_at: null },
    select: { document_subscription_id: true, email: true, name: true }
  });
  if (!subscribers) {
    return [];
  }

  const subsResponse = [];
  for (let i = 0; i < subscribers.length; i += mailgunRecipientsLimit) {
    const chunk = subscribers.slice(i, i + mailgunRecipientsLimit);
    const subsEmails = [];
    const subsVars = {};
    chunk.forEach((s) => {
      // const splitName = s.name.split(' ');
      subsEmails.push(s.email);
      subsVars[s.email] = { email: s.email };
    });
    subsResponse.push({ emails: subsEmails, vars: JSON.stringify(subsVars) });
  }

  return subsResponse;
};
