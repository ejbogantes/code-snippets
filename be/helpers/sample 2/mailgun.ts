import FormData from 'form-data';
import Mailgun from 'mailgun.js';
const mailgun = new Mailgun(FormData);

const apiKey = process.env.MAILGUN_API_KEY;
const domain = process.env.MAILGUN_DOMAIN;
const fromEmail = process.env.MAILGUN_FROM_EMAIL;
const mg = mailgun.client({ username: 'api', key: apiKey });

// send email
export const sendEmail = async (to: string[], subject: string, html: string, vars?: string) => {
  try {
    const params = {
      from: fromEmail,
      to,
      subject,
      html,
      'recipient-variables': vars
    };

    const msg = await mg.messages.create(domain, params);

    if (!msg || !msg.status || msg.status !== 200) {
      console.error(msg);
      return null;
    }

    return msg;
  } catch (e) {
    console.error(e);
    return null;
  }
};
