import { Grid, Paper, Typography } from '@mui/material';
import * as React from 'react';

export default function Heading({ title, image }) {
  return (
    <Grid
      container
      sx={{
        px: [5, 0, 0, 0],
        pt: 22,
        pb: 17,
        backgroundImage: `url('${image}')`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover'
      }}>
      <Grid item xs={0} sm={2} md={3} lg={4}></Grid>
      <Grid item xs={12} sm={8} md={6} lg={4} textAlign="center">
        <Typography variant="h3" fontWeight={'bold'} color={'#FFFFFF'} style={{ textShadow: '2px 1px 1px #000000' }}>
          {title}
        </Typography>
      </Grid>
    </Grid>
  );
}
