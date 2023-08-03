/* eslint-disable @next/next/no-img-element */
import React from 'react';
import Link from 'next/link';
import { Grid, Box, Stack, Container, Divider, Typography } from '@mui/material';

export default function Error403({ org }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        pt: 5
      }}
    >
      <Container maxWidth="md">
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Stack spacing={4} sx={{ mb: 2 }}>
              <Typography variant="h1">403</Typography>
              <Typography variant="h4">Unauthorized to access this page.</Typography>
              <Divider />

              <Link legacyBehavior href={`/org/${org}`}>
                <Typography variant="h6" sx={{ color: '#FDAF43', cursor: 'pointer', fontWeight: 'bold' }}>
                  Go Back to Homepage
                </Typography>
              </Link>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
