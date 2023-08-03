/* eslint-disable react-hooks/exhaustive-deps */
// auth & react stuff
import { withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import React, { useEffect } from 'react';

// next router
import { useRouter } from 'next/router';
// index page component

export default withPageAuthRequired(function Index({ user }) {
  // hooks
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    const verifyAuthQ = router.query.verifyAuth as string;

    if (user && verifyAuthQ) {
      router.push(`/org/${verifyAuthQ}`);
    } else if (user && !verifyAuthQ) {
      router.push(`/portal`);
    }
  }, [router.isReady]);

  return <div style={{ margin: 5, textAlign: 'center' }}>Loading...</div>;
});
