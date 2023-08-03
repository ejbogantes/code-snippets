import { useEffect } from 'react';
import { withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/router';

export default withPageAuthRequired(function Index({ user }) {
  const router = useRouter();
  useEffect(() => {
    window.open(`${process.env.SOOM_PORTAL_URL}/api/auth/logout`, '_blank', '');
    const timer = setTimeout(() => {
      router.push('/api/auth/logout');
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div style={{ margin: 5, textAlign: 'center' }}>
      We are logging you out from all Soom Apps.
      <div style={{ display: 'none' }}></div>
    </div>
  );
});
