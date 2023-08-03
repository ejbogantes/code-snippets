/* eslint-disable @next/next/no-img-element */
import React from 'react';
import Head from 'next/head';
import { Box, Container, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';

const defaultTitle = '404';
const titles = {
  configuration: 'Configuration Error',
  licenseConfiguration: 'Settings Error'
};
const defaultMessage = 'The page you’re looking for doesn’t exist.';
const messages = {
  configuration: 'Missing configuration (domain, configuration or organization). Please contact a site administrator.',
  licenseConfiguration: `Complete the settings in your organization's dashboard and also make sure it is published for the production WebApp when is ready. If it does not load with all these indications, please contact a site administrator.`
};

export default function Error(props) {
  const { errorType, errorAdmin } = props;

  return (
    <>
      <Head>
        <title>Settings Error</title>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
      </Head>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#444444',
          color: '#FFFFFF'
        }}>
        <Container maxWidth="md">
          <Grid container spacing={4}>
            <Grid item xs={8}>
              <Stack
                spacing={4}
                sx={{
                  mb: 2
                }}>
                <Typography variant="h1">
                  {errorAdmin && titles[errorType] ? titles[errorType] : defaultTitle}
                </Typography>
                <Typography variant="h5">
                  {errorAdmin && messages[errorType] ? messages[errorType] : defaultMessage}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={4} style={{ textAlign: 'right' }}>
              <img src="https://assets.soom.com/soom-brandguide/soom-logo-navbar.png" alt="" width={200} height={200} />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
}
