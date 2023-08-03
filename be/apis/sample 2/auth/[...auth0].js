// pages/api/auth/[...auth0].js
import { handleAuth, handleLogout } from '@auth0/nextjs-auth0';

export default handleAuth({
  logout: async (request, response) => {
    const { query } = request;
    try {
      const manualLogout = Boolean(query.m);
      const logoutOptions = manualLogout
        ? { returnTo: `${process.env.SOOM_EIFU_DASHBOARD}/api/auth/logout` }
        : undefined;
      await handleLogout(request, response, logoutOptions);
    } catch (error) {
      console.error(error);
      response.status(500).json({ message: error.message });
    }
  }
});
