/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';

// mui && page component
import CssBaseline from '@mui/material/CssBaseline';

// nextjs and auth
import Head from 'next/head';
import Script from 'next/script';
import getConfig from 'next/config';
import { UserProvider } from '@auth0/nextjs-auth0/client';

// soom-ui components
import { createTheme, ThemeProvider } from '@mui/material/styles';
import './styles.css';

// mui pro/premium
import { LicenseInfo } from '@mui/x-license-pro';

// sets the MUI License
LicenseInfo.setLicenseKey(process.env.MUI_LICENSE);

const theme = createTheme({
  typography: {
    fontFamily: `Open Sans`
  }
});

const {
  publicRuntimeConfig: { SEO }
} = getConfig();

const websiteStructure = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SEO.name,
  url: SEO.url,
  description: SEO.description,
  publisher: {
    '@type': 'Organization',
    name: SEO.name,
    logo: {
      '@type': 'ImageObject',
      url: `${SEO.url}${SEO.logo}`
    }
  }
};

function CustomApp({ Component, pageProps }) {
  return (
    <UserProvider>
      <ThemeProvider theme={theme}>
        <Head>
          <title>Soom eIFU Dashboard</title>
          <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
          <link rel="manifest" href="/favicon/site.webmanifest" />
          <link rel="mask-icon" href="/favicon/safari-pinned-tab.svg" color="#5bbad5" />

          <meta name="msapplication-TileColor" content="#ffffff" />
          <meta name="theme-color" content="#ffffff" />
          <meta name="title" content={SEO.title} />
          <meta name="description" content={SEO.description} />
          <meta name="keywords" content={SEO.keywords} />

          <meta property="og:locale" content={SEO.locale} />
          <meta property="og:site_name" content={SEO.name} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={SEO.url} />
          <meta property="og:title" content={SEO.title} />
          <meta property="og:description" content={SEO.description} />
          <meta property="og:image" content={`${SEO.url}${SEO.image}`} />
          <meta property="og:image:width" content={SEO.imageW} />
          <meta property="og:image:height" content={SEO.imageH} />
          <meta property="og:image:alt" content={SEO.imageAlt} />

          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructure) }} />
        </Head>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-C2EYVJYTPS" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','G-C2EYVJYTPS');
        `}
        </Script>
        <Script id="how-to">
          {`
            (function(g,u,i,d,e,s){g[e]=g[e]||[];var f=u.getElementsByTagName(i)[0];var k=u.createElement(i);k.async=true;k.src='https://static.userguiding.com/media/user-guiding-'+s+'-embedded.js';f.parentNode.insertBefore(k,f);if(g[d])return;var ug=g[d]={q:[]};ug.c=function(n){return function(){ug.q.push([n,arguments])};};var m=['previewGuide','finishPreview','track','identify','triggerNps','hideChecklist','launchChecklist'];for(var j=0;j<m.length;j+=1){ug[m[j]]=ug.c(m[j]);}})(window,document,'script','userGuiding','userGuidingLayer','984969674ID');
          `}
        </Script>
        <main className="app">
          <CssBaseline />
          <Component {...pageProps} />
        </main>
      </ThemeProvider>
    </UserProvider>
  );
}

export default CustomApp;
