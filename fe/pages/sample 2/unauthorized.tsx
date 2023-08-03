/* eslint-disable @next/next/no-img-element */
import React from 'react';
import Link from 'next/link';
import { Box, Container, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';

export default function Error(props) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#444444',
        color: '#FFFFFF',
        fontFamily: 'Open Sans'
      }}>
      <Container maxWidth="md">
        <Grid container spacing={4}>
          <Grid item xs={8}>
            <Stack
              spacing={4}
              sx={{
                mb: 2
              }}>
              <Typography variant="h1">403</Typography>
              <Typography variant="h5">Unauthorized to access this page.</Typography>
              <Divider sx={{ background: '#FFFFFF' }} />
              <Link legacyBehavior href="/portal">
                <Typography variant="h6" sx={{ color: '#FDAF43', cursor: 'pointer', fontWeight: 'bold' }}>
                  Go to Soom Portal
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
  );
}
