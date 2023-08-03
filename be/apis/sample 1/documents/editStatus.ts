import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import getConfig from 'next/config';

import { updateStatus, getDocumentData, sendEmail } from '@soom-universe/soom-api';
import { getTemplate } from '@soom-universe/soom-utils/emails';

import { prismaRead } from '../../../db';

import { getUserSessionData } from '../../../helpers/userSession';
import { getUserEmails, getMailgunSubscribers } from '../../../helpers/notifications';
import { sendEmail as sendEmailMailgun } from '../../../helpers/mailgun';
import { updatePublishedDocument } from '../../../helpers/publishedDocuments';

// next js config // settings
const {
  publicRuntimeConfig: { roleIds }
} = getConfig();

// request printed version
export default withApiAuthRequired(async function handler(request, response) {
  const { method, body } = request;

  switch (method) {
    case 'PUT':
      try {
        const org = body.org as string;
        const app = body.app as string;
        const documentNumber = body.document_number as string;

        delete body.org;
        delete body.app;
        delete body.document_number;

        const session = await getSession(request, response);
        const userData = await getUserSessionData(session, app, org);
        if (!userData) {
          return response.status(409).json({
            message:
              "Contact your administrator. This profile doesn't exist, is disabled, or does not have permission for this app."
          });
        }

        const { configurationId, organizationName, bucket } = userData;

        const params = {
          ...body,
          bucket,
          s3_region: 'us-east-1'
        };

        const data = await updateStatus(params);

        // notifications
        const documentId = body.key ? body.key[0] || '' : '';
        const status = body.status_to || '';
        const rejectReason = body.reject_reason;

        if (status === 'published') {
          await updatePublishedDocument(configurationId, documentId, 'save');
        }

        await sendNotifications(
          configurationId,
          organizationName,
          bucket,
          documentId,
          documentNumber,
          status,
          rejectReason
        );

        return response.status(200).json(data);
      } catch (e) {
        console.error(e);
        if (e.response) {
          const statusCode = e.response.status || 500;
          const data = e.response.data || {};
          return response.status(statusCode).json(data);
        } else {
          return response.status(500).json(e);
        }
      }
      break;
    default:
      response.setHeader('Allow', ['PUT']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
});

const sendNotifications = async (
  configurationId,
  organizationName,
  bucket,
  documentId,
  documentNumber,
  status,
  rejectReason
) => {
  let sendNots = false;
  let sendSubscription = false;
  let roleId;
  let subject;
  let template;
  switch (status) {
    case 'pending':
      sendNots = true;
      roleId = roleIds.admin;
      subject = `Soom eIFU | ${organizationName}`;
      template = 'document-in-review';
      break;
    case 'published':
      sendNots = true;
      sendSubscription = true;
      roleId = roleIds.admin;
      subject = `Soom eIFU | ${organizationName}`;
      template = 'document-published';
      break;
    case 'rejected':
      sendNots = true;
      roleId = roleIds.cm;
      subject = `Soom eIFU | ${organizationName}`;
      template = 'document-rejected';
      break;
    default:
      break;
  }

  if (sendNots || sendSubscription) {
    const destinations = sendNots ? await getUserEmails(configurationId, roleId) : [];
    const subscribers = sendSubscription ? await getMailgunSubscribers(configurationId, documentNumber) : [];

    if (destinations.length > 0 || subscribers.length > 0) {
      const data = await getDocumentData({ bucket, key: documentId });
      if (data) {
        if (sendNots && destinations.length > 0) {
          await sendEmails(destinations, subject, template, data, rejectReason);
        }
        if (sendSubscription && subscribers.length > 0) {
          await sendEmailToSubscribers(configurationId, subscribers, documentId, data);
        }
      }
    }
  }
};

const sendEmails = async (destinations, subject, template, data, rejectReason) => {
  try {
    const emailData = {
      documentName: data.documentName || '',
      documentNumber: data.documentNumber || '',
      documentRevision: data.revision || '',
      rejectReason
    };

    // render the email
    const fromEmail = process.env.NOTIFICATIONS_FROM_EMAIL;
    const html = await getTemplate(template, emailData);

    destinations.forEach(async (d) => {
      // send the email
      await sendEmail({
        Destination: d.email,
        HtmlPart: html,
        TextPart: '',
        SubjectPart: subject,
        Source: fromEmail
      });
    });

    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

const sendEmailToSubscribers = async (configurationId, subscribers, documentId, data) => {
  const documentNumber = data.documentNumber || '';
  const brandName = data.brandName || '';
  const safetyUpdate = data.safetyUpdate || false;

  const domain = await prismaRead.domain.findFirst({
    where: { configuration_id: configurationId, is_prod: true },
    orderBy: { created_at: 'asc' }
  });

  // render the email
  const template = safetyUpdate ? 'document-safety-update' : 'document-update';
  const subject = safetyUpdate ? 'Soom | New Document Safety Update' : 'Soom | New Document Version';
  const html = await getTemplate(template, {
    documentNumber,
    brandName,
    detailUrl: domain ? `https://${domain.domain}/detail/${documentId}` : '',
    unsubscribeUrl: domain ? `https://${domain.domain}/unsubscribe?e=%recipient.email%&dn=${documentNumber}` : ''
  });

  // send the email
  subscribers.forEach(async (subs) => {
    await sendEmailMailgun(subs.emails, subject, html, subs.vars);
  });

  return true;
};
