/* eslint-disable @next/next/no-img-element */
import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { Grid, Box, Stack, Container, Divider, Typography } from '@mui/material';

export default function Error(props) {
  return (
    <>
      <Head>
        <title>404</title>
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
        }}
      >
        <Container maxWidth="md">
          <Grid container spacing={4}>
            <Grid item xs={8}>
              <Stack
                spacing={4}
                sx={{
                  mb: 2
                }}
              >
                <Typography variant="h1">404</Typography>
                <Typography variant="h5">The page you’re looking for doesn’t exist.</Typography>
                <Divider sx={{ background: '#FFFFFF' }} />

                <Link legacyBehavior href="/">
                  <Typography variant="h6" sx={{ color: '#FDAF43', cursor: 'pointer', fontWeight: 'bold' }}>
                    Go Back to Homepage
                  </Typography>
                </Link>
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
