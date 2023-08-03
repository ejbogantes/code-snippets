import React from 'react';
import { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';
import getConfig from 'next/config';
import { get as _get } from 'lodash';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import parse from 'html-react-parser';

// soom
import { SoomFooter } from '@soom-universe/soom-ui';

// style
import './styles.css';

// helpers
import { Translation } from '../helpers/translation';

// components
import ConfigError from '../components/ConfigError';
import PasswordProtection from '../components/PasswordProtection';

// get public runtime settings
const {
  publicRuntimeConfig: { defaultIcon, SEO }
} = getConfig();

function CustomApp({ Component, pageProps }: AppProps) {
  const { propsError, propsErrorType, propsErrorAdmin, config, company, theme, translation } = pageProps;
  const translationHelper = translation ? new Translation(translation.data) : null;

  const url = _get(config, 'url', SEO.url);
  const newSEO = {
    locale: _get(translation, 'locale', SEO.locale),
    name: _get(company, 'SEOTitle', SEO.name),
    url,
    title: _get(company, 'SEOTitle', SEO.title),
    description: _get(company, 'SEODescription', SEO.description),
    keywords: SEO.keywords,
    logo: _get(company, 'icon', `${url}${SEO.logo}`),
    image: _get(company, 'logo', `${url}${SEO.image}`),
    imageAlt: _get(company, 'SEOTitle', SEO.imageAlt)
  };

  const websiteStructure = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: newSEO.name,
    url: newSEO.url,
    description: newSEO.description,
    publisher: {
      '@type': 'Organization',
      name: newSEO.name,
      logo: {
        '@type': 'ImageObject',
        url: newSEO.logo
      }
    }
  };

  // analytics
  const analyticsEmbedCode = _get(company, 'analyticsEmbedCode', '');
  let analyticsTagId = '';
  if (company && company.analyticsTagId && company.analyticsTagId !== '') {
    analyticsTagId = company.analyticsTagId;
  }
  let analyticsAdminTagIdCode = '';
  if (company && company.analyticsAdminTagId && company.analyticsAdminTagId !== '') {
    analyticsAdminTagIdCode = `gtag('config', '${company.analyticsAdminTagId}');`;
  }
  const analyticsUrl = `https://www.googletagmanager.com/gtag/js?id=${analyticsTagId}`;
  const analyticsCode = `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${analyticsTagId}');
  ${analyticsAdminTagIdCode}`;

  // favicon
  let favicon = {
    32: { type: 'image/png', href: defaultIcon },
    16: { type: 'image/png', href: defaultIcon }
  };
  if (company && company.icon && company.icon !== '') {
    const ext = company.icon.split('.').pop();
    favicon = {
      32: { type: `image/${ext}`, href: company.icon },
      16: { type: `image/${ext}`, href: company.icon }
    };
  }

  // theme
  const optionsTheme = {
    palette: undefined,
    typography: {
      fontFamily: `Open Sans`
    }
  };
  if (theme) {
    optionsTheme.palette = {
      primary: {
        main: _get(theme, 'primaryColor', '#1976d2'),
        contrastText: _get(theme, 'primaryTextColor', '#ffffff')
      }
    };
  }
  const themeObj = createTheme(optionsTheme);

  // content
  let content;
  if (propsError) {
    content = <ConfigError errorType={propsErrorType} errorAdmin={propsErrorAdmin} />;
  } else if (config && config.needPassword) {
    content = (
      <PasswordProtection>
        <Component {...pageProps} />
      </PasswordProtection>
    );
  } else {
    content = <Component {...pageProps} />;
  }

  return (
    <>
      <Head>
        <title>{company && company.SEOTitle ? company.SEOTitle : `Soom eIFU Web App`}</title>
        <link rel="icon" type={favicon[32].type} sizes="32x32" href={favicon[32].href} />
        <link rel="icon" type={favicon[16].type} sizes="16x16" href={favicon[16].href} />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <link rel="mask-icon" href="/favicon/safari-pinned-tab.svg" color="#5bbad5" />

        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="theme-color" content="#ffffff" />

        <meta name="title" content={newSEO.title} />
        <meta name="description" content={newSEO.description} />
        <meta name="keywords" content={newSEO.keywords} />

        <meta property="og:locale" content={newSEO.locale} />
        <meta property="og:site_name" content={newSEO.name} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={newSEO.url} />
        <meta property="og:title" content={newSEO.title} />
        <meta property="og:description" content={newSEO.description} />
        <meta property="og:image" content={newSEO.image} />
        <meta property="og:image:alt" content={newSEO.imageAlt} />

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructure) }} />
        {parse(analyticsEmbedCode)}
      </Head>
      <Script async src={analyticsUrl}></Script>
      <Script id="ga-script">{analyticsCode}</Script>
      <Script id="how-to">
        {`(function(g,u,i,d,e,s){g[e]=g[e]||[];var f=u.getElementsByTagName(i)[0];var k=u.createElement(i);k.async=true;k.src='https://static.userguiding.com/media/user-guiding-'+s+'-embedded.js';f.parentNode.insertBefore(k,f);if(g[d])return;var ug=g[d]={q:[]};ug.c=function(n){return function(){ug.q.push([n,arguments])};};var m=['previewGuide','finishPreview','track','identify','triggerNps','hideChecklist','launchChecklist'];for(var j=0;j<m.length;j+=1){ug[m[j]]=ug.c(m[j]);}})(window,document,'script','userGuiding','userGuidingLayer','984969674ID');`}
      </Script>
      <main className="app">
        <ThemeProvider theme={themeObj}>
          {theme && (
            <style jsx>{`
              // footer
              :global(.soom-styled-footer-container) {
                background-color: ${_get(theme, 'footerBackgroundColor', '#444444')};
              }
              :global(.soom-styled-footer-option > a) {
                color: ${_get(theme, 'footerTextColor', '#ffffff')};
              }
              :global(.soom-styled-footer-option > p) {
                color: ${_get(theme, 'footerTextColor', '#ffffff')};
              }
              // GDPR
              :global(.soom-styled-gdpr-container) {
                background-color: ${_get(theme, 'gdprBackgroundColor', '#01579b')} !important;
                color: ${_get(theme, 'gdprTextColor', '#ffffff')} !important;
              }
              :global(.soom-styled-gdpr-accept-btn) {
                background-color: ${_get(theme, 'gdprAcceptBtnColor', '#fbb042')};
                color: ${_get(theme, 'gdprAcceptBtnTextColor', '#000000')};
              }
              :global(.soom-styled-gdpr-accept-btn:hover) {
                background-color: ${_get(theme, 'gdprAcceptBtnColor', '#fbb042')};
                filter: brightness(0.85);
              }
              :global(.soom-styled-gdpr-decline-btn) {
                background-color: ${_get(theme, 'gdprDeclineBtnColor', '#e8e8e8')};
                color: ${_get(theme, 'gdprDeclineBtnTextColor', '#000000')};
              }
              :global(.soom-styled-gdpr-decline-btn:hover) {
                background-color: ${_get(theme, 'gdprDeclineBtnColor', '#e8e8e8')};
                filter: brightness(0.85);
              }
            `}</style>
          )}
          {content}
          {translationHelper && (
            <SoomFooter
              options={translationHelper.get('common.footerOptions', [])}
              gdprOptions={translationHelper.get('common.footerGdprOptions', {})}
              versionLabel={process.env.VERSION_WEBAPP}
            />
          )}
        </ThemeProvider>
      </main>
    </>
  );
}

export default CustomApp;
