import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import axios from 'axios';
import { getUserSessionData } from '../../../helpers/userSession';

export default withApiAuthRequired(async function handle(request, response) {
  const { method } = request;

  switch (method) {
    case 'POST':
      try {
        const session = await getSession(request, response);
        const profile = await getUserSessionData(session);
        if (!profile) {
          response.status(404).json({ message: 'Owner user not found.' });
          return;
        }

        const result = await axios.request({
          method: 'post',
          url: process.env.AUTH0_BACKEND_CHANGEPASS_URL,
          headers: { 'Content-Type': 'application/json' },
          data: {
            client_id: process.env.AUTH0_BACKEND_CLIENT_ID,
            email: profile.email,
            connection: 'Username-Password-Authentication'
          }
        });
        if (!result) {
          response.status(400).json({ message: 'An error has occurred. Please try again.' });
          return;
        }

        response.status(200).json({ message: "We've just sent you an email to reset your password." });
        return;
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
      response.setHeader('Allow', ['POST']);
      response.status(404).end(`Method ${method} Not Allowed`);
      break;
  }
});
